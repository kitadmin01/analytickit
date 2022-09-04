from analytickit.infi.clickhouse_orm import migrations

from analytickit.models.person.sql import PERSON_STATIC_COHORT_TABLE_SQL

operations = [
    migrations.RunSQL(PERSON_STATIC_COHORT_TABLE_SQL()),
]
