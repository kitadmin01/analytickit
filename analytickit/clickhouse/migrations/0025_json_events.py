from analytickit.infi.clickhouse_orm import migrations

from analytickit.models.event.sql import EVENTS_TABLE_JSON_MV_SQL, KAFKA_EVENTS_TABLE_JSON_SQL

operations = [
    migrations.RunSQL(KAFKA_EVENTS_TABLE_JSON_SQL()),
    migrations.RunSQL(EVENTS_TABLE_JSON_MV_SQL()),
]
