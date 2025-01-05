"""
Created on Aug 25 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""



from typing import List, Dict
from logger_config import logger
import boto3
import json
from enum import Enum
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
import gc
import traceback


class S3_RECORD(Enum):
    FULL = "full"
    TODAY = "today"



class S3Retriever:


    def __init__(self, config):
        self.config = config
        self.s3 = boto3.client('s3')
        self.bucket_name="aws-public-blockchain"

    def execute_s3_select(self, bucket, key, sql_expression):

        r = self.s3.select_object_content(
            Bucket=bucket,
            Key=key,
            ExpressionType='SQL',
            Expression=sql_expression,
            InputSerialization={'Parquet': {}},
            OutputSerialization={'JSON': {}}
        )
        return [
            event['Records']['Payload']
            for event in r['Payload']
            if 'Records' in event
        ]

    def fetch_keys_since_2020(self):
        """
        Retrieves all the keys since 2020 from the S3 bucket and returns them. This function will be run
        only once to store all the keys in DB
        """
        prefixes = ['token_transfers', 'transactions', 'logs', 'blocks', 'contracts', 'traces']
        base_prefix = 'v1.0/eth/'

        # Fetch filenames between 2020 and today
        current_date = datetime.now()
        start_date = datetime(2020, 1, 1)

        all_files = []

        while start_date <= current_date:
            for prefix in prefixes:
                folder_prefix = base_prefix + prefix + '/date=' + start_date.strftime("%Y-%m-%d")
                response = self.s3.list_objects_v2(Bucket=self.bucket_name, Prefix=folder_prefix)

                if 'Contents' in response:
                    all_files.extend(file['Key'] for file in response['Contents'])
            start_date += timedelta(days=1)

        return all_files
    

    def fetch_keys_for_date(self, target_date):
        """
        Retrieves all the keys for a specific date from the S3 bucket and returns them. This function 
        will be run every day once at 12 AM.
        """
        base_prefix = 'v1.0/eth/'
        prefixes = ['token_transfers', 'transactions', 'logs', 'blocks', 'contracts', 'traces']
        
        files_for_date = []

        for prefix in prefixes:
            folder_prefix = base_prefix + prefix + '/date=' + target_date.strftime("%Y-%m-%d")
            response = self.s3.list_objects_v2(Bucket=self.bucket_name, Prefix=folder_prefix)

            if 'Contents' in response:
                files_for_date.extend(file['Key'] for file in response['Contents'])
        
        return files_for_date
    
    def get_blockchain_data(self, contract_address: str, token_address: str, s3_keys: List[str]) -> Dict[str, List[Dict]]:
        bucket = 'aws-public-blockchain'
        results = {}

        BATCH_SIZE = 10  # Adjust batch size according to your memory capability.
        s3_keys_batches = [s3_keys[i:i + BATCH_SIZE] for i in range(0, len(s3_keys), BATCH_SIZE)]
        
        # Using a context manager for ThreadPoolExecutor to ensure threads are cleaned up promptly
        with ThreadPoolExecutor(max_workers=5) as executor:  # Limiting the max_workers can prevent excessive memory usage.
            future_to_batch = {executor.submit(self.get_data_for_batch, batch, bucket, contract_address, token_address): batch for batch in s3_keys_batches}
            
            for future in as_completed(future_to_batch):
                orig_batch = future_to_batch[future]
                try:
                    data_generators = future.result()
                    for data_generator in data_generators:
                        key, value = data_generator
                        logger.debug(f"Key: {key}, Value: {value}")  # Replaced print with logging to better control output and avoid potential I/O issues.
                        
                        if not isinstance(value, dict):
                            logger.warning(f'S3 SQL didn’t find record in key {key}: {orig_batch}')
                            continue
                        results.setdefault(key, []).append(value)
                except Exception as exc:
                    logger.error(f"Exception with batch {orig_batch}: {exc}", exc_info=True)  # Using exc_info instead of traceback for logging.

        gc.collect()  # Forced garbage collection
        return results
    
    def get_data_for_batch(self, key_batch, bucket, contract_address, token_address):
        for key in key_batch:
            yield from self.get_data_for_key(key, bucket, contract_address, token_address)

    def get_data_for_key(self, key, bucket, contract_address, token_address):
        s3 = boto3.client('s3')
        categories = ['token_transfers', 'transactions']
        category_key = next((category for category in categories if category in key), None)

        if not category_key:
            return
        
        logger.info("Processing file: %s", key)

        # Convert addresses to lowercase before executing the query
        contract_address_lower = contract_address.lower()
        token_address_lower = token_address.lower()

        query = f"SELECT * FROM S3Object s WHERE s.receipt_contract_address = '{contract_address_lower}' OR s.from_address = '{contract_address_lower}' OR s.to_address = '{contract_address_lower}' OR s.token_address = '{token_address_lower}' "
        content_response = s3.select_object_content(
            Bucket=bucket,
            Key=key,
            Expression=query,
            ExpressionType='SQL',
            InputSerialization={'Parquet': {}},
            OutputSerialization={'JSON': {}}
        )
        
        buffer = ""
        for event in content_response['Payload']:
            if 'Records' in event:
                buffer += event['Records']['Payload'].decode('utf-8')
                while '\n' in buffer:
                    record, buffer = buffer.split('\n', 1)
                    try:
                        record_dict = json.loads(record, parse_float=str)
                        yield (key, record_dict)
                    except json.JSONDecodeError as je:
                        logger.error(f"Error decoding JSON: {je}, Raw record: {record}")
                    except Exception as e:
                        logger.error(f"Unexpected error: {e}")
    

    '''
    Following functions are implemented for WalletAddressJob
    '''
    def get_data_for_wallet_address(self, wallet_address: str, target_date: datetime) -> Dict[str, List[Dict]]:
            """
            Retrieves data that matches the given wallet address for token transfer and transaction data.
            """
            # Get S3 keys for the date
            s3_keys = self.fetch_keys_for_date(target_date)

            # Filter data for the specific wallet address
            return self.get_blockchain_data_for_wallet_address(wallet_address, s3_keys)

    def get_blockchain_data_for_wallet_address(self, wallet_address: str, s3_keys: List[str]) -> Dict[str, List[Dict]]:
        bucket = 'aws-public-blockchain'
        results = {}

        BATCH_SIZE = 10  # Adjust batch size according to your memory capability.
        s3_keys_batches = [s3_keys[i:i + BATCH_SIZE] for i in range(0, len(s3_keys), BATCH_SIZE)]
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_batch = {executor.submit(self.get_data_for_wallet_address_batch, batch, bucket, wallet_address): batch for batch in s3_keys_batches}
            
            for future in as_completed(future_to_batch):
                orig_batch = future_to_batch[future]
                try:
                    data_generators = future.result()
                    for data_generator in data_generators:
                        key, value = data_generator
                        logger.debug(f"Key: {key}, Value: {value}")
                        
                        if not isinstance(value, dict):
                            logger.warning(f'S3 SQL didn’t find record in key {key}: {orig_batch}')
                            continue
                        results.setdefault(key, []).append(value)
                except Exception as exc:
                    logger.error(f"Exception with batch {orig_batch}: {exc}", exc_info=True)

        gc.collect()
        return results

    def get_data_for_wallet_address_batch(self, key_batch, bucket, wallet_address):
        for key in key_batch:
            yield from self.get_data_for_wallet_address_key(key, bucket, wallet_address)

    def get_data_for_wallet_address_key(self, key, bucket, wallet_address):
        s3 = boto3.client('s3')
        categories = ['token_transfers', 'transactions']
        category_key = next((category for category in categories if category in key), None)

        if not category_key:
            return
        
        logger.info("Processing file: %s", key)

        query = f"SELECT * FROM S3Object s WHERE s.from_address = '{wallet_address}' OR s.to_address = '{wallet_address}'"
        content_response = s3.select_object_content(
            Bucket=bucket,
            Key=key,
            Expression=query,
            ExpressionType='SQL',
            InputSerialization={'Parquet': {}},
            OutputSerialization={'JSON': {}}
        )

        buffer = ""
        for event in content_response['Payload']:
            if 'Records' in event:
                buffer += event['Records']['Payload'].decode('utf-8')
                while '\n' in buffer:
                    record, buffer = buffer.split('\n', 1)
                    try:
                        record_dict = json.loads(record, parse_float=str)
                        yield (key, record_dict)
                    except json.JSONDecodeError as je:
                        logger.error(f"Error decoding JSON: {je}, Raw record: {record}")
                    except Exception as e:
                        logger.error(f"Unexpected error: {e}")



    