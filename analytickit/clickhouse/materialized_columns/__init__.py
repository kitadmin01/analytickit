from analytickit.settings import EE_AVAILABLE

if EE_AVAILABLE:
    from dpa.clickhouse.materialized_columns.columns import *
else:
    from .column import *
