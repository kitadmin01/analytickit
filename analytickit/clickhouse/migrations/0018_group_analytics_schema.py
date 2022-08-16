from infi.clickhouse_orm import migrations

from analytickit.models.group.sql import GROUPS_TABLE_MV_SQL, GROUPS_TABLE_SQL, KAFKA_GROUPS_TABLE_SQL

operations = [
    migrations.RunSQL(GROUPS_TABLE_SQL()),
    migrations.RunSQL(KAFKA_GROUPS_TABLE_SQL()),
    migrations.RunSQL(GROUPS_TABLE_MV_SQL),
]
