from analytickit.settings import EE_AVAILABLE

if EE_AVAILABLE:
    from dpa.clickhouse.queries.groups_join_query import GroupsJoinQuery
else:
    from analytickit.queries.groups_join_query.groups_join_query import GroupsJoinQuery  # type: ignore
