from typing import Union

from analytickit.models.filters.filter import Filter
from analytickit.models.filters.path_filter import PathFilter
from analytickit.models.filters.retention_filter import RetentionFilter
from analytickit.models.filters.stickiness_filter import StickinessFilter

FilterType = Union[Filter, PathFilter, RetentionFilter, StickinessFilter]
