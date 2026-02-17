import json
import logging
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from analytickit.agent.constants import WEI_PER_ETH
from analytickit.client import sync_execute
from analytickit.models.crypto.wallet_address import VisitorWalletAddress

logger = logging.getLogger(__name__)


class CrossLinker:
    """Joins web2 wallet login events with web3 on-chain transaction data."""

    def __init__(self, team_id: int, target_date: datetime = None, days: int = 1):
        self.team_id = team_id
        self.target_date = target_date or datetime.now(timezone.utc)
        self.days = days
        self.from_date = self.target_date - timedelta(days=days)

    def link(self) -> Dict[str, Any]:
        web2_wallets = self._get_web2_wallet_logins()
        web3_wallets = self._get_web3_wallets()

        web2_set = {w.lower() for w in web2_wallets.keys()}
        web3_set = {w.lower() for w in web3_wallets.keys()}

        both = web2_set & web3_set
        web2_only = web2_set - web3_set
        web3_only = web3_set - web2_set

        conversion_rate = len(both) / len(web2_set) if web2_set else 0.0

        return {
            "wallets_with_both_web2_and_web3": len(both),
            "wallets_web2_only": len(web2_only),
            "wallets_web3_only": len(web3_only),
            "web2_to_web3_conversion_rate": round(conversion_rate, 3),
            "avg_time_wallet_login_to_txn_hours": None,
            "campaign_attribution": self._get_campaign_attribution(web2_wallets, web3_wallets),
            "page_to_txn_correlation": self._get_page_to_txn_correlation(web3_set),
        }

    def _get_web2_wallet_logins(self) -> Dict[str, List[Dict]]:
        """Get wallet addresses from web2 WalletLogin events."""
        query = """
            SELECT
                JSONExtractString(properties, '$crypto_wallet_public_address') as wallet,
                properties,
                timestamp
            FROM events
            WHERE team_id = %(team_id)s
              AND event = 'WalletLogin'
              AND timestamp >= toDateTime(%(from_date)s)
              AND timestamp < toDateTime(%(to_date)s)
              AND wallet != ''
        """
        params = {
            "team_id": self.team_id,
            "from_date": self.from_date,
            "to_date": self.target_date,
        }
        try:
            rows = sync_execute(query, params)
        except Exception as e:
            logger.error("Failed to fetch web2 wallet logins for team %s: %s", self.team_id, e)
            return {}

        wallets = defaultdict(list)
        for row in rows:
            wallet_addr = (row[0] or "").lower()
            if wallet_addr:
                props = row[1]
                if isinstance(props, str):
                    try:
                        props = json.loads(props)
                    except json.JSONDecodeError:
                        props = {}
                wallets[wallet_addr].append(
                    {
                        "properties": props or {},
                        "timestamp": row[2],
                    }
                )
        return dict(wallets)

    def _get_web3_wallets(self) -> Dict[str, List[Dict]]:
        """Get wallet addresses from web3 transaction data."""
        qs = VisitorWalletAddress.objects.filter(
            team_id=self.team_id,
            visitor_wallet_address_ts__gte=self.from_date,
        )
        wallets = {}
        for w in qs:
            addr = w.visitor_wallet_address.lower()
            txns = w.txn_data
            if isinstance(txns, str):
                try:
                    txns = json.loads(txns)
                except json.JSONDecodeError:
                    txns = []
            wallets[addr] = txns if isinstance(txns, list) else []
        return wallets

    def _get_campaign_attribution(
        self, web2_wallets: Dict[str, List[Dict]], web3_wallets: Dict[str, List[Dict]]
    ) -> List[Dict[str, Any]]:
        """Attribute on-chain transactions to UTM campaigns."""
        campaigns = defaultdict(
            lambda: {
                "source": "",
                "medium": "",
                "wallet_logins": 0,
                "on_chain_txns": 0,
                "txn_volume_eth": 0.0,
            }
        )

        for wallet_addr, login_events in web2_wallets.items():
            for event in login_events:
                props = event["properties"]
                campaign = props.get("utm_campaign", "")
                if not campaign:
                    continue

                campaigns[campaign]["source"] = props.get("utm_source", "")
                campaigns[campaign]["medium"] = props.get("utm_medium", "")
                campaigns[campaign]["wallet_logins"] += 1

                if wallet_addr in web3_wallets:
                    txns = web3_wallets[wallet_addr]
                    campaigns[campaign]["on_chain_txns"] += len(txns)
                    total_wei = sum(int(t.get("value", 0)) for t in txns)
                    campaigns[campaign]["txn_volume_eth"] += round(total_wei / WEI_PER_ETH, 6)

        return [{"campaign": name, **data} for name, data in campaigns.items()]

    def _get_page_to_txn_correlation(self, web3_wallet_set: set, limit: int = 10) -> List[Dict[str, Any]]:
        """Correlate page views with on-chain transactions."""
        query = """
            SELECT
                JSONExtractString(properties, '$current_url') as page,
                distinct_id,
                JSONExtractString(properties, '$crypto_wallet_public_address') as wallet
            FROM events
            WHERE team_id = %(team_id)s
              AND event IN ('$pageview', 'pageview')
              AND timestamp >= toDateTime(%(from_date)s)
              AND timestamp < toDateTime(%(to_date)s)
              AND page != ''
        """
        params = {
            "team_id": self.team_id,
            "from_date": self.from_date,
            "to_date": self.target_date,
        }
        try:
            rows = sync_execute(query, params)
        except Exception as e:
            logger.error("Failed to fetch page views for team %s: %s", self.team_id, e)
            return []

        page_stats = defaultdict(lambda: {"total_visitors": set(), "transacting_visitors": set()})
        for row in rows:
            page = row[0]
            wallet = (row[2] or "").lower()
            distinct_id = row[1]

            page_stats[page]["total_visitors"].add(distinct_id)
            if wallet and wallet in web3_wallet_set:
                page_stats[page]["transacting_visitors"].add(distinct_id)

        results = []
        for page, stats in page_stats.items():
            total = len(stats["total_visitors"])
            transacting = len(stats["transacting_visitors"])
            if total > 0 and transacting > 0:
                results.append(
                    {
                        "path": page,
                        "visitors_who_transacted": transacting,
                        "total_visitors": total,
                        "conversion_rate": round(transacting / total, 3),
                    }
                )

        results.sort(key=lambda x: x["conversion_rate"], reverse=True)
        return results[:limit]
