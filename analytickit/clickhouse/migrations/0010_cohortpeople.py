from infi.clickhouse_orm import migrations

from analytickit.models.cohort.sql import CREATE_COHORTPEOPLE_TABLE_SQL

operations = [migrations.RunSQL(CREATE_COHORTPEOPLE_TABLE_SQL())]
