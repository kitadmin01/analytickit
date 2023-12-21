#!/bin/bash
#This script runs every day early morning 12 AM to get the new Ethereum S3 Key from AWS
# 0 1 * * * ./analytickit/crypto/run_crypto.sh>> ./analytickit/crypto/cron.log 2>&1


# Path to your python interpreter
PYTHON_PATH="python"
PYTHONPATH="./"

export PYTHONPATH=$PYTHONPATH:.
#export DEBUG=1

echo "Starting python script -- Community Engagement job"

# Job 1 - Path to your python script to run Community Engagement job
COMM_ENG_SCRIPT_PATH=./analytickit/crypto/txn_anz.py

# Job 2 - Path to your python script to run Wallet Address job
WALL_ADD_SCRIPT_PATH=./analytickit/crypto/wallet_address_job.py

# Run the python script for Community Engagement job
$PYTHON_PATH $COMM_ENG_SCRIPT_PATH

echo "Starting python script -- Wallet Address job"

# Run the python script for Wallet Address job
$PYTHON_PATH $WALL_ADD_SCRIPT_PATH
 