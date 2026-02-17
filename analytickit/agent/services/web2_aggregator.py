import json
import logging
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from analytickit.client import sync_execute

logger = logging.getLogger(__name__)


class Web2Aggregator:
    """Aggregates web2 event data from ClickHouse for a team over a date range."""

    def __init__(self, team_id: int, target_date: datetime = None, days: int = 1):
        self.team_id = team_id
        self.target_date = target_date or datetime.now(timezone.utc)
        self.days = days
        self.from_date = self.target_date - timedelta(days=days)

    def aggregate(self) -> Dict[str, Any]:
        events = self._fetch_events()
        if not events:
            return self._empty_summary()

        return {
            "date": self.target_date.strftime("%Y-%m-%d"),
            "unique_visitors": self._count_unique_visitors(events),
            "new_visitors": self._count_new_visitors(events),
            "returning_visitors": self._count_returning_visitors(events),
            "total_events": len(events),
            "wallet_logins": self._count_wallet_logins(events),
            "wallet_login_rate": self._calc_wallet_login_rate(events),
            "top_pages": self._get_top_pages(events),
            "traffic_sources": self._get_traffic_sources(events),
            "geo_distribution": self._get_geo_distribution(events),
            "device_breakdown": self._get_device_breakdown(events),
            "browser_breakdown": self._get_browser_breakdown(events),
        }

    def _fetch_events(self) -> List[Dict[str, Any]]:
        query = """
            SELECT
                event,
                properties,
                distinct_id,
                timestamp
            FROM events
            WHERE team_id = %(team_id)s
              AND timestamp >= toDateTime(%(from_date)s)
              AND timestamp < toDateTime(%(to_date)s)
            ORDER BY timestamp
        """
        params = {
            "team_id": self.team_id,
            "from_date": self.from_date,
            "to_date": self.target_date,
        }
        try:
            rows = sync_execute(query, params)
        except Exception as e:
            logger.error("Failed to fetch web2 events for team %s: %s", self.team_id, e)
            return []

        events = []
        for row in rows:
            props = row[1]
            if isinstance(props, str):
                try:
                    props = json.loads(props)
                except json.JSONDecodeError:
                    props = {}
            events.append(
                {
                    "event": row[0],
                    "properties": props or {},
                    "distinct_id": row[2],
                    "timestamp": row[3],
                }
            )
        return events

    def _count_unique_visitors(self, events: List[Dict]) -> int:
        return len({e["distinct_id"] for e in events})

    def _count_wallet_logins(self, events: List[Dict]) -> int:
        return sum(1 for e in events if e["event"] == "WalletLogin")

    def _count_new_visitors(self, events: List[Dict]) -> int:
        # Approximate: visitors whose first event in the window is a $pageview
        first_seen = {}
        for e in events:
            did = e["distinct_id"]
            if did not in first_seen:
                first_seen[did] = e
        # Heuristic: if the first event is within the first hour of the window, likely new
        cutoff = self.from_date + timedelta(hours=1)
        return sum(1 for e in first_seen.values() if e["timestamp"] <= cutoff)

    def _count_returning_visitors(self, events: List[Dict]) -> int:
        unique = self._count_unique_visitors(events)
        new = self._count_new_visitors(events)
        return max(0, unique - new)

    def _calc_wallet_login_rate(self, events: List[Dict]) -> float:
        unique = self._count_unique_visitors(events)
        if unique == 0:
            return 0.0
        return round(self._count_wallet_logins(events) / unique, 3)

    def _get_top_pages(self, events: List[Dict], limit: int = 10) -> List[Dict[str, Any]]:
        page_views = defaultdict(lambda: {"views": 0, "unique": set()})
        for e in events:
            if e["event"] in ("$pageview", "pageview"):
                path = e["properties"].get("$current_url", "unknown")
                page_views[path]["views"] += 1
                page_views[path]["unique"].add(e["distinct_id"])

        sorted_pages = sorted(page_views.items(), key=lambda x: x[1]["views"], reverse=True)[:limit]
        return [{"path": path, "views": data["views"], "unique": len(data["unique"])} for path, data in sorted_pages]

    def _get_traffic_sources(self, events: List[Dict], limit: int = 10) -> List[Dict[str, Any]]:
        sources = defaultdict(lambda: {"visitors": set()})
        for e in events:
            props = e["properties"]
            source = props.get("utm_source") or props.get("$referring_domain") or "direct"
            medium = props.get("utm_medium", "")
            campaign = props.get("utm_campaign", "")
            key = (source, medium, campaign)
            sources[key]["visitors"].add(e["distinct_id"])

        sorted_sources = sorted(sources.items(), key=lambda x: len(x[1]["visitors"]), reverse=True)[:limit]
        result = []
        for (source, medium, campaign), data in sorted_sources:
            entry = {"source": source, "medium": medium, "visitors": len(data["visitors"])}
            if campaign:
                entry["campaign"] = campaign
            result.append(entry)
        return result

    def _get_geo_distribution(self, events: List[Dict], limit: int = 10) -> List[Dict[str, Any]]:
        geo = defaultdict(lambda: {"visitors": set()})
        for e in events:
            props = e["properties"]
            country = props.get("$geoip_country_code", "")
            state = props.get("$geoip_subdivision_1_name", "")
            city = props.get("$geoip_city_name", "")
            if country:
                key = (country, state, city)
                geo[key]["visitors"].add(e["distinct_id"])

        sorted_geo = sorted(geo.items(), key=lambda x: len(x[1]["visitors"]), reverse=True)[:limit]
        return [{"country": k[0], "state": k[1], "city": k[2], "visitors": len(v["visitors"])} for k, v in sorted_geo]

    def _get_device_breakdown(self, events: List[Dict]) -> Dict[str, int]:
        devices = defaultdict(int)
        seen = set()
        for e in events:
            did = e["distinct_id"]
            if did not in seen:
                seen.add(did)
                device = e["properties"].get("$device_type", "Unknown")
                devices[device] += 1
        return dict(devices)

    def _get_browser_breakdown(self, events: List[Dict]) -> Dict[str, int]:
        browsers = defaultdict(int)
        seen = set()
        for e in events:
            did = e["distinct_id"]
            if did not in seen:
                seen.add(did)
                browser = e["properties"].get("$browser", "Unknown")
                browsers[browser] += 1
        return dict(browsers)

    def _empty_summary(self) -> Dict[str, Any]:
        return {
            "date": self.target_date.strftime("%Y-%m-%d"),
            "unique_visitors": 0,
            "new_visitors": 0,
            "returning_visitors": 0,
            "total_events": 0,
            "wallet_logins": 0,
            "wallet_login_rate": 0.0,
            "top_pages": [],
            "traffic_sources": [],
            "geo_distribution": [],
            "device_breakdown": {},
            "browser_breakdown": {},
        }
