from analytickit.settings import EE_AVAILABLE

if EE_AVAILABLE:
    from ee.clickhouse.queries.retention.retention import ClickhouseRetention as Retention
    from ee.clickhouse.queries.retention.retention_actors import ClickhouseRetentionActors as RetentionActors
else:
    from analytickit.queries.retention.actors_query import RetentionActors  # type: ignore
    from analytickit.queries.retention.retention import Retention  # type: ignore

from .retention import build_returning_event_query, build_target_event_query
