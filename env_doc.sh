#!/bin/bash
   export SECRET_KEY="6b01eee4f945ca25045b5aab440b953461faf08693a9abbf1166dc7c6b9772da"
   export DATABASE_URL="postgres://analytickit:analytickit@localhost:5432/analytickit"
   export REDIS_URL="redis://localhost"
   export CLICKHOUSE_HOST="localhost"
   export CLICKHOUSE_SECURE="False"
   export CLICKHOUSE_VERIFY="False"
   export TEST="1"
   export OBJECT_STORAGE_ENABLED="True"
   export OBJECT_STORAGE_ENDPOINT="http://localhost:19000"
   export OBJECT_STORAGE_ACCESS_KEY_ID="object_storage_root_user"
   export OBJECT_STORAGE_SECRET_ACCESS_KEY="object_storage_root_password"