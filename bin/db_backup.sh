#!/bin/bash
# Script to backup PostgreSQL and ClickHouse databases and upload to S3

# Install PostgreSQL client, ClickHouse client, and AWS CLI
apt-get update && apt-get install -y postgresql-client clickhouse-client awscli


# Set environment variables for local test
if [ "$DEBUG" = "1" ]; then
    # Set environment variables for local testing
    echo "setting envs"
    export AWS_ACCESS_KEY_ID=""
    export AWS_SECRET_ACCESS_KEY=""
    export ANALYTICKIT_POSTGRES_HOST="localhost"
    export ANALYTICKIT_POSTGRES_PORT="5432"
    export ANALYTICKIT_DB_USER="analytickit"
    export ANALYTICKIT_DB_NAME="analytickit"
    export ANALYTICKIT_DB_PASSWORD="analytickit"
    export CLICKHOUSE_HOST="localhost"
    export CLICKHOUSE_PORT="9000"
    export CLICKHOUSE_USER="default"
    export CLICKHOUSE_PASSWORD=""
    export CLICKHOUSE_DATABASE="default"
fi

# Ensure all required variables are set
required_vars=(ANALYTICKIT_POSTGRES_HOST ANALYTICKIT_POSTGRES_PORT ANALYTICKIT_DB_USER ANALYTICKIT_DB_NAME ANALYTICKIT_DB_PASSWORD CLICKHOUSE_HOST CLICKHOUSE_PORT CLICKHOUSE_USER CLICKHOUSE_PASSWORD CLICKHOUSE_DATABASE)
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set. Exiting."
        exit 1
    fi
done

# Backup PostgreSQL Database
echo "Starting PostgreSQL backup"
PG_BACKUP_FILE="postgres_backup_$(date +%F).sql"
pg_dump -h $ANALYTICKIT_POSTGRES_HOST -p $ANALYTICKIT_POSTGRES_PORT -U $ANALYTICKIT_DB_USER $ANALYTICKIT_DB_NAME > $PG_BACKUP_FILE
echo "Ending PostgreSQL backup"


# Backup ClickHouse Database
echo "Starting ClickHouse backup"
CLICKHOUSE_BACKUP_FILE="clickhouse_backup_$(date +%F).sql"
echo "Backup file: $CLICKHOUSE_BACKUP_FILE"

# Ensure the backup file does not contain invalid characters or spaces
if [[ -z "$CLICKHOUSE_BACKUP_FILE" ]]; then
    echo "Error: CLICKHOUSE_BACKUP_FILE is not set. Exiting."
    exit 1
fi

# Get a list of tables
TABLES=$(clickhouse-client --host $CLICKHOUSE_HOST --port $CLICKHOUSE_PORT --user $CLICKHOUSE_USER --query "SHOW TABLES FROM $CLICKHOUSE_DATABASE")

# Backup each table
for TABLE in $TABLES; do
    # Check if the table is a Kafka engine table
    ENGINE=$(clickhouse-client --host $CLICKHOUSE_HOST --port $CLICKHOUSE_PORT --user $CLICKHOUSE_USER --query "SELECT engine FROM system.tables WHERE database = '$CLICKHOUSE_DATABASE' AND name = '$TABLE'")
    if [[ $ENGINE != *"Kafka"* ]]; then
        echo "Backing up $TABLE"
        clickhouse-client --host $CLICKHOUSE_HOST --port $CLICKHOUSE_PORT --user $CLICKHOUSE_USER --database $CLICKHOUSE_DATABASE --query "SELECT * FROM $TABLE FORMAT TSV" >> $CLICKHOUSE_BACKUP_FILE
    else
        echo "Skipping $TABLE (Kafka table)"
    fi
done

# Upload backups to S3
S3_BUCKET_POSTGRESS="s3://kitbackup/postgres_backup/"
S3_BUCKET_CLICKHOUSE="s3://kitbackup/clickhouse_backup/"

# Upload backups to S3
echo "Uploading $PG_BACKUP_FILE to S3"
aws s3 cp "$PG_BACKUP_FILE" "${S3_BUCKET_POSTGRESS}${PG_BACKUP_FILE}"
echo "Uploading $CLICKHOUSE_BACKUP_FILE to S3"
aws s3 cp "$CLICKHOUSE_BACKUP_FILE" "${S3_BUCKET_CLICKHOUSE}${CLICKHOUSE_BACKUP_FILE}"

# Clean up local backup files
echo "Removing local backup files"
rm -v "$PG_BACKUP_FILE"
rm -v "$CLICKHOUSE_BACKUP_FILE"

echo "Backup process completed"
