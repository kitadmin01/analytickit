#!/bin/bash
#This script runs every day early morning 12 AM to get the new Ethereum S3 Key from AWS
# 0 1 * * * ./analytickit/crypto/run_crypto.sh>> ./analytickit/crypto/cron.log 2>&1


# Path to your python interpreter
PYTHON_PATH="python"
PYTHONPATH="./"

export PYTHONPATH=$PYTHONPATH:.
#export DEBUG=1

#sleep 60
echo "Starting python script"

# Path to your python script
SCRIPT_PATH=./analytickit/crypto/txn_anz.py

# Run the python script
$PYTHON_PATH $SCRIPT_PATH
 