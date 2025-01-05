from analytickit.queries.stickiness.stickiness import Stickiness
from dpa.clickhouse.queries.stickiness.stickiness_actors import ClickhouseStickinessActors
from dpa.clickhouse.queries.stickiness.stickiness_event_query import ClickhouseStickinessEventsQuery


class ClickhouseStickiness(Stickiness):
    event_query_class = ClickhouseStickinessEventsQuery
    actor_query_class = ClickhouseStickinessActors
