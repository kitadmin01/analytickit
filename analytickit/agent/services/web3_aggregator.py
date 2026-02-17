import json
import logging
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from analytickit.agent.constants import GWEI_PER_ETH, WEI_PER_ETH, WHALE_THRESHOLD_ETH
from analytickit.models.crypto.wallet_address import VisitorWalletAddress

logger = logging.getLogger(__name__)


class Web3Aggregator:
    """Aggregates web3 blockchain data from PostgreSQL for a team over a date range."""

    def __init__(self, team_id: int, target_date: datetime = None, days: int = 1):
        self.team_id = team_id
        self.target_date = target_date or datetime.now(timezone.utc)
        self.days = days
        self.from_date = self.target_date - timedelta(days=days)

    def aggregate(self) -> Dict[str, Any]:
        wallets = self._fetch_wallets()
        if not wallets:
            return self._empty_summary()

        all_txns = []
        all_transfers = []
        for w in wallets:
            all_txns.extend(self._parse_json_field(w.txn_data))
            all_transfers.extend(self._parse_json_field(w.token_transfer_data))

        # Filter transactions to the date range
        txns = self._filter_by_date(all_txns)
        transfers = self._filter_by_date(all_transfers)

        successful = [t for t in txns if str(t.get("receipt_status", "1")) == "1"]
        failed = [t for t in txns if str(t.get("receipt_status", "1")) == "0"]

        total_volume_wei = sum(int(t.get("value", 0)) for t in txns)
        gas_used_list = [int(t.get("receipt_gas_used", 0)) for t in txns if t.get("receipt_gas_used")]
        gas_price_list = [int(t.get("gas_price", 0)) for t in txns if t.get("gas_price")]

        return {
            "date": self.target_date.strftime("%Y-%m-%d"),
            "unique_wallets_active": len(wallets),
            "new_wallets": self._count_new_wallets(wallets),
            "returning_wallets": len(wallets) - self._count_new_wallets(wallets),
            "total_transactions": len(txns),
            "successful_transactions": len(successful),
            "failed_transactions": len(failed),
            "total_txn_volume_wei": total_volume_wei,
            "total_txn_volume_eth": round(total_volume_wei / WEI_PER_ETH, 6),
            "avg_gas_used": round(sum(gas_used_list) / len(gas_used_list)) if gas_used_list else 0,
            "avg_gas_price_gwei": (
                round(sum(gas_price_list) / len(gas_price_list) / GWEI_PER_ETH, 1) if gas_price_list else 0
            ),
            "total_token_transfers": len(transfers),
            "total_token_volume_wei": sum(int(t.get("value", 0)) for t in transfers),
            "unique_token_addresses": len({t.get("token_address", "") for t in transfers if t.get("token_address")}),
            "top_interacting_contracts": self._get_top_contracts(txns),
            "wallet_segments": self._segment_wallets(wallets),
            "input_method_breakdown": self._get_input_methods(txns),
        }

    def _fetch_wallets(self) -> List[VisitorWalletAddress]:
        return list(
            VisitorWalletAddress.objects.filter(
                team_id=self.team_id,
                visitor_wallet_address_ts__gte=self.from_date,
            )
        )

    def _parse_json_field(self, data) -> List[Dict]:
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return []
        if isinstance(data, list):
            return data
        return []

    def _filter_by_date(self, items: List[Dict]) -> List[Dict]:
        filtered = []
        for item in items:
            date_str = item.get("date") or item.get("block_timestamp", "")
            if not date_str:
                filtered.append(item)  # include items without date
                continue
            try:
                if isinstance(date_str, str):
                    item_date = datetime.strptime(date_str[:10], "%Y-%m-%d")
                    if self.from_date.date() <= item_date.date() <= self.target_date.date():
                        filtered.append(item)
            except (ValueError, AttributeError):
                filtered.append(item)
        return filtered

    def _count_new_wallets(self, wallets: List[VisitorWalletAddress]) -> int:
        return sum(1 for w in wallets if w.creation_ts and w.creation_ts >= self.from_date)

    def _get_top_contracts(self, txns: List[Dict], limit: int = 10) -> List[Dict[str, Any]]:
        contracts = defaultdict(int)
        for t in txns:
            to_addr = t.get("to_address", "")
            if to_addr:
                contracts[to_addr.lower()] += 1
        sorted_contracts = sorted(contracts.items(), key=lambda x: x[1], reverse=True)[:limit]
        return [{"address": addr, "txn_count": count} for addr, count in sorted_contracts]

    def _segment_wallets(self, wallets: List[VisitorWalletAddress]) -> Dict[str, List[str]]:
        segments = {"whales": [], "regular": [], "micro": []}
        for w in wallets:
            txns = self._parse_json_field(w.txn_data)
            total_wei = sum(int(t.get("value", 0)) for t in txns)
            total_eth = total_wei / WEI_PER_ETH
            addr = w.visitor_wallet_address
            if total_eth >= WHALE_THRESHOLD_ETH:
                segments["whales"].append(addr)
            elif total_eth >= 0.01:
                segments["regular"].append(addr)
            else:
                segments["micro"].append(addr)
        return segments

    def _get_input_methods(self, txns: List[Dict]) -> Dict[str, int]:
        methods = defaultdict(int)
        for t in txns:
            input_data = t.get("input", "0x")
            if not input_data or input_data == "0x":
                methods["0x"] += 1
            else:
                method_sig = input_data[:10] if len(input_data) >= 10 else input_data
                methods[method_sig] += 1
        return dict(methods)

    def _empty_summary(self) -> Dict[str, Any]:
        return {
            "date": self.target_date.strftime("%Y-%m-%d"),
            "unique_wallets_active": 0,
            "new_wallets": 0,
            "returning_wallets": 0,
            "total_transactions": 0,
            "successful_transactions": 0,
            "failed_transactions": 0,
            "total_txn_volume_wei": 0,
            "total_txn_volume_eth": 0.0,
            "avg_gas_used": 0,
            "avg_gas_price_gwei": 0,
            "total_token_transfers": 0,
            "total_token_volume_wei": 0,
            "unique_token_addresses": 0,
            "top_interacting_contracts": [],
            "wallet_segments": {"whales": [], "regular": [], "micro": []},
            "input_method_breakdown": {},
        }
