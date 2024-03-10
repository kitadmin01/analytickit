#!/bin/bash

# Define your database name
DATABASE_NAME="analytickit"

# Define backup directory
BACKUP_DIR="./clickhouse_backup_$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Get the list of tables
tables=$(clickhouse-client --port 8123 -q "SHOW TABLES FROM $DATABASE_NAME")

# Export each table's schema and data
for table in $tables; do
    echo "Backing up schema for $table"
    clickhouse-client --port 8123 --query="SHOW CREATE TABLE $DATABASE_NAME.$table FORMAT TSV" > "$BACKUP_DIR/$table.schema.sql"

    echo "Backing up data for $table"
    clickhouse-client --port 8123 --query="SELECT * FROM $DATABASE_NAME.$table FORMAT TSV" > "$BACKUP_DIR/$table.data.tsv"
done

echo "Backup completed"
