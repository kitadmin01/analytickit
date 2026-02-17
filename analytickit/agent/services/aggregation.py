import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from analytickit.agent.models import AggregationSnapshot
from analytickit.agent.services.cross_linker import CrossLinker
from analytickit.agent.services.token_manager import TokenManager
from analytickit.agent.services.web2_aggregator import Web2Aggregator
from analytickit.agent.services.web3_aggregator import Web3Aggregator

logger = logging.getLogger(__name__)


class AggregationPipeline:
    """Orchestrates the full aggregation pipeline for a team on a given date."""

    def __init__(self, team_id: int, target_date: datetime = None):
        self.team_id = team_id
        self.target_date = target_date or datetime.now(timezone.utc)
        self.token_manager = TokenManager()

    def run(self) -> AggregationSnapshot:
        """Run the full aggregation pipeline and save a snapshot."""
        web2 = Web2Aggregator(self.team_id, self.target_date, days=1).aggregate()
        web3 = Web3Aggregator(self.team_id, self.target_date, days=1).aggregate()
        cross_linked = CrossLinker(self.team_id, self.target_date, days=1).link()

        rolling_7d = self._build_rolling_summary(days=7)
        rolling_30d = self._build_rolling_summary(days=30)

        full_summary = {
            "web2_summary": web2,
            "web3_summary": web3,
            "cross_linked_summary": cross_linked,
            "rolling_7d_summary": rolling_7d,
            "rolling_30d_summary": rolling_30d,
        }
        trimmed = self.token_manager.fit_to_budget(full_summary)
        token_count = self.token_manager.count_tokens(json.dumps(trimmed, default=str))

        snapshot, _ = AggregationSnapshot.objects.update_or_create(
            team_id=self.team_id,
            date=self.target_date.date(),
            defaults={
                "web2_summary": web2,
                "web3_summary": web3,
                "cross_linked_summary": cross_linked,
                "rolling_7d_summary": rolling_7d,
                "rolling_30d_summary": rolling_30d,
                "token_count": token_count,
            },
        )

        logger.info(
            "Aggregation snapshot saved for team %s on %s (%d tokens)",
            self.team_id,
            self.target_date.date(),
            token_count,
        )
        return snapshot

    def _build_rolling_summary(self, days: int) -> Optional[Dict[str, Any]]:
        """Build a rolling comparison by looking at past snapshots."""
        past_snapshots = AggregationSnapshot.objects.filter(
            team_id=self.team_id,
            date__gte=(self.target_date - timedelta(days=days)).date(),
            date__lt=self.target_date.date(),
        ).order_by("date")

        if not past_snapshots.exists():
            return None

        # Aggregate key metrics across the rolling window
        total_visitors = 0
        total_events = 0
        total_wallet_logins = 0
        total_txns = 0
        total_txn_volume_eth = 0.0

        for snap in past_snapshots:
            w2 = snap.web2_summary or {}
            w3 = snap.web3_summary or {}
            total_visitors += w2.get("unique_visitors", 0)
            total_events += w2.get("total_events", 0)
            total_wallet_logins += w2.get("wallet_logins", 0)
            total_txns += w3.get("total_transactions", 0)
            total_txn_volume_eth += w3.get("total_txn_volume_eth", 0.0)

        count = past_snapshots.count()
        return {
            "days": days,
            "snapshots_available": count,
            "avg_daily_visitors": round(total_visitors / count) if count else 0,
            "avg_daily_events": round(total_events / count) if count else 0,
            "avg_daily_wallet_logins": round(total_wallet_logins / count) if count else 0,
            "avg_daily_txns": round(total_txns / count) if count else 0,
            "avg_daily_txn_volume_eth": round(total_txn_volume_eth / count, 6) if count else 0.0,
            "total_visitors": total_visitors,
            "total_txns": total_txns,
        }
