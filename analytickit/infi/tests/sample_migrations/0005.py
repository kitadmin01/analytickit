from analytickit.infi.clickhouse_orm import migrations
from ..test_migrations import *

operations = [
    migrations.AlterTable(Model3)
]