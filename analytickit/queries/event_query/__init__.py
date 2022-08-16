from analytickit.settings import EE_AVAILABLE

if EE_AVAILABLE:
    from ee.clickhouse.queries.event_query import EnterpriseEventQuery as EventQuery
else:
    from analytickit.queries.event_query.event_query import EventQuery  # type: ignore
