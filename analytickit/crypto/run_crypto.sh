#!/bin/bash
#This script runs every day early morning 12 AM to get the new Ethereum S3 Key from AWS

# Path to your python interpreter
PYTHON_PATH="./kit3.8/bin/python"
PYTHONPATH="./"

export PYTHONPATH=$PYTHONPATH:.
export DEBUG=1

#sleep 60
echo "Starting python script"

# Path to your python script
SCRIPT_PATH=./analytickit/crypto/txn_anz.py

# Run the python script
$PYTHON_PATH $SCRIPT_PATH
