# isort: skip_file
from analytickit.settings import EE_AVAILABLE

if EE_AVAILABLE:
    from dpa.clickhouse.queries.column_optimizer import EnterpriseColumnOptimizer as ColumnOptimizer
else:
    from analytickit.queries.column_optimizer.foss_column_optimizer import (  # type: ignore
        FOSSColumnOptimizer as ColumnOptimizer,
    )
