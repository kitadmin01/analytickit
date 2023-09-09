"""
Created on Aug 25 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""



from typing import List, Dict
import structlog
import boto3
import json
from enum import Enum
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta


logger = structlog.get_logger(__name__)

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
        start_date = datetime(2020, 8, 1)

        all_files = []

        while start_date <= current_date:
            for prefix in prefixes:
                folder_prefix = base_prefix + prefix + '/date=' + start_date.strftime("%Y-%m-%d")
                response = self.s3.list_objects_v2(Bucket=self.bucket_name, Prefix=folder_prefix)

                if 'Contents' in response:
                    all_files.extend(file['Key'] for file in response['Contents'])
            start_date += timedelta(days=1)

        return all_files
    

    def fetch_files_for_date(self, target_date):
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
        """
        This function gets the data from the S3 bucket for the given contract address and token address using the provided S3 keys.
        """
        bucket = 'aws-public-blockchain'
        s3 = boto3.client('s3')
        results = {}

        with ThreadPoolExecutor() as executor:
            future_to_key = {executor.submit(self.get_data_for_key, key, bucket, contract_address, token_address): key for key in s3_keys}
            
            for future in concurrent.futures.as_completed(future_to_key):
                orig_key = future_to_key[future]
                try:
                    data = future.result()
                    for key, value in data.items(): # Since get_data_for_key now returns a dictionary
                        if key in results:
                            results[key].append(value)
                        else:
                            results[key] = [value]
                except Exception as exc:
                    logger.error(f'{orig_key} generated an exception: {exc}')

        return results



    def get_data_for_key(self, key, bucket, contract_address, token_address):
        s3 = boto3.client('s3')
        logger.info("Processing file:", key)

        # Predefined categories
        categories = ['token_transfers', 'transactions', 'logs', 'blocks', 'contracts', 'traces']

        category_key = next(
            (category for category in categories if category in key), None
        )
        # If the key doesn't belong to any category, return an empty dictionary
        if not category_key:
            return {}

        query = f"SELECT * FROM S3Object s WHERE s.token_address = '{token_address}' OR s.receipt_contract_address = '{contract_address}' OR s.from_address = '{contract_address}' OR s.to_address = '{contract_address}'"
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
                    parsed_record = json.loads(record, parse_float=str)

        # Return dictionary with category key and parsed_record as value
        return {category_key: parsed_record}

    