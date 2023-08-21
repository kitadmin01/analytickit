from analytickit.tasks.test.test_calculate_event_property_usage import calculate_event_property_usage_test_factory
from analytickit.test.base import ClickhouseTestMixin, _create_event


class CalculateEventPropertyUsage(
    ClickhouseTestMixin, calculate_event_property_usage_test_factory(_create_event),  # type: ignore
):
    pass
