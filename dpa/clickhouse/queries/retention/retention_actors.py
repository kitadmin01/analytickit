from analytickit.models.filters.mixins.utils import cached_property
from analytickit.queries.retention.actors_query import RetentionActors, RetentionActorsByPeriod
from dpa.clickhouse.queries.retention.retention_event_query import ClickhouseRetentionEventsQuery


class ClickhouseRetentionActors(RetentionActors):
    _retention_events_query = ClickhouseRetentionEventsQuery

    @cached_property
    def aggregation_group_type_index(self):
        return self._filter.aggregation_group_type_index


# Note: This class does not respect the entire flor from ActorBaseQuery because the result shape differs from other actor queries
class ClickhouseRetentionActorsByPeriod(RetentionActorsByPeriod):
    _retention_events_query = ClickhouseRetentionEventsQuery

    @cached_property
    def aggregation_group_type_index(self):
        return self._filter.aggregation_group_type_index
