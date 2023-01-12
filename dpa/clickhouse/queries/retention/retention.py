from analytickit.queries.retention.retention import Retention
from dpa.clickhouse.queries.retention.retention_actors import (
    ClickhouseRetentionActors,
    ClickhouseRetentionActorsByPeriod,
)
from dpa.clickhouse.queries.retention.retention_event_query import ClickhouseRetentionEventsQuery


class ClickhouseRetention(Retention):
    event_query = ClickhouseRetentionEventsQuery
    actors_query = ClickhouseRetentionActors
    actors_by_period_query = ClickhouseRetentionActorsByPeriod
