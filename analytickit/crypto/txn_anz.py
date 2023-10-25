#!/usr/bin/env python3

"""
Created on Aug 26 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"

"""
import os
import django
import sys
# uses /home/mani/sass/analytickit/dpa/settings.py, this is needed before you can run this program
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytickit.settings')
# Need this to initialize Django 
django.setup()
sys.path.append('./analytickit/crypto') # needed for pytest


from logger_config import logger
from analytickit.models.crypto.comm_eng import CommunityEngagement,CampaignAnalytic,S3File
from analytickit.crypto.s3_ret import S3Retriever
from analytickit.crypto.metric_cal import MetricCalculator 
from django.db import transaction, IntegrityError
import gc
import json
from decimal import Decimal
import re
import datetime
from datetime import datetime, timedelta, date
from django.utils.timezone import make_aware

class TxnAnalyzer:
   

    def __init__(self, config):
        self.config = config
        self.s3_retriever = S3Retriever(config)
        logger.info("created TxnAnalyzer")



    def perform_campaign_analysis(self):
        """
        This function gets the campaign records from DB, for each campaign it gets the transaction data from S3
        and calculates the DAU for the campaign. 
        Store both Time Series Data and distribution/frequeney (JSON) every day in new row.
        This allows you to observe daily distributions. Then, for cumulative distribution over a longer period, 
        we can aggregate these daily distributions as necessary.

        :return:
        """
        # get valid campaings that falls today's date in between campaing start_date and end_date
        com_engs = CommunityEngagement.get_campaign_records_today()

        s3_keys =  S3File.get_all_key_names()
        # filtered_keys used for testing only
        filtered_keys = [
            key for key in s3_keys 
            # for now get previous 10 days worh of data from S3, instead of going and getting all the data since 2015.
            if datetime.strptime(key.split('date=')[1].split('/')[0], "%Y-%m-%d").date() >= (date.today() - timedelta(days=1))

        ]
        s3_keys = filtered_keys

        BATCH_SIZE = 100  # Define batch size
        s3_keys_batches_filtered = [s3_keys[i:i + BATCH_SIZE] for i in range(0, len(s3_keys), BATCH_SIZE)]

        for campaign in com_engs:           
            # check if a campaign analytic exist. If exist, then we need to get s3_key only for today. If not then we're running
            # the campaign for the first time and get all the s3_keys since 2020
            if campaign.has_associated_campaign_analytic() is not True:
                s3_key_batches = [S3File.get_all_key_names()[i:i + BATCH_SIZE] for i in range(0, len(S3File.get_all_key_names()), BATCH_SIZE)]
            else:
                s3_key_batches = [S3File.get_previous_day_key_name()[i:i + BATCH_SIZE] for i in range(0, len(S3File.get_previous_day_key_name()), BATCH_SIZE)]

            s3_key_batches = s3_keys_batches_filtered # for now use the filtered batches to get data for the previous 10 days from today
            # create a new or get existsing camp_analytic for today. Only one
            # camp_analytic per day.
            # camp_analytic = CampaignAnalytic. get_or_create_for_today(campaign)
            camp_analytic = CampaignAnalytic.get_or_create_campaign_analytic_for_today(campaign)
            # Now, process each batch of s3 keys separately
            for s3_key_batch in s3_key_batches:
                eth_jsons = self.s3_retriever.get_blockchain_data(
                    campaign.contract_address,
                    campaign.token_address,
                    s3_key_batch
                )        
                logger.info("logging_event", eth_jsons=eth_jsons)
                # create MetricCalculator            
                met_cal = MetricCalculator(eth_jsons,campaign.contract_address, campaign.token_address)

                camp_analytic.active_users = met_cal.calculate_dau()
                camp_analytic.total_contract_calls = met_cal.calculate_contract_calls()

                # Assuming that calculate_function_calls_count() returns a dict, not a JSON string
                camp_analytic.function_calls_count = met_cal.calculate_function_calls_count()

                camp_analytic.tot_tokens_transferred = met_cal.calculate_total_tokens_transferred()
                camp_analytic.tot_txns = met_cal.calculate_total_transactions()
                camp_analytic.ave_gas_used = met_cal.calculate_average_gas_used()

                # Assuming that calculate_transaction_value_distribution() returns a dict, not a JSON string
                camp_analytic.transaction_value_distribution = met_cal.calculate_transaction_value_distribution()

                camp_analytic.ave_txn_fee = met_cal.calculate_average_transaction_fee()

                # Assuming that calculate_total_transactions_from_address() returns a dict, not a JSON string
                camp_analytic.tot_txn_from_address = met_cal.calculate_total_transactions_from_address()

                # Assuming that calculate_total_transactions_to_address() returns a dict, not a JSON string
                camp_analytic.tot_txn_to_address = met_cal.calculate_total_transactions_to_address()

                # The rest of the code assumes that the methods return appropriate types
                # (dicts, lists, or other JSON-serializable types, not JSON strings)

                camp_analytic.freq_txn = met_cal.frequency_of_transactions()
                camp_analytic.token_transfer_volume = met_cal.calculate_token_transfer_volume()
                camp_analytic.token_transfer_value = met_cal.calculate_token_transfer_value()

                # Assuming that most_active_token_addresses() returns a dict, not a JSON string
                camp_analytic.most_active_token_addresses = met_cal.most_active_token_addresses()

                new_value = met_cal.calculate_average_token_transfer_value()
                camp_analytic.ave_token_transfer_value = Decimal(str(new_value))

                # Assuming that calculate_token_flow() returns a list or other JSON-serializable type
                camp_analytic.token_flow = met_cal.calculate_token_flow()

                # Assuming that calculate_token_transfer_value_distribution() returns a dict
                camp_analytic.token_transfer_value_distribution = met_cal.calculate_token_transfer_value_distribution()

                #new fields 
                camp_analytic.average_effective_gas_price = met_cal.average_effective_gas_price()
                camp_analytic.median_effective_gas_price = met_cal.median_effective_gas_price()
                camp_analytic.gas_price_min,  camp_analytic.gas_price_max = met_cal.gas_price_range()
               
                camp_analytic.total_daily_fees = met_cal.total_daily_fees()
                # camp_analytic.change_in_average_gas_price = met_cal.change_in_average_gas_price(campaign.get_all_changes_in_avg_gas_price())
                camp_analytic.transactions_by_gas_price_range = met_cal.transactions_count_by_gas_price_range()
                camp_analytic.daily_percentile_data = met_cal.daily_percentile_analysis()
                camp_analytic.transactions_relative_prev_day = met_cal.transactions_relative_to_previous_day_avg()
                camp_analytic.gas_price_histogram_data = met_cal.gas_price_histogram()
                camp_analytic.daily_standard_deviation = met_cal.daily_standard_deviation()
                camp_analytic.cumulative_gas_used = met_cal.cumulative_gas_used()
                camp_analytic.cumulative_transaction_fees = met_cal.cumulative_transaction_fees()
                camp_analytic.cumulative_avg_gas_price = met_cal.cumulative_avg_gas_price()
                camp_analytic.cumulative_transactions_count = met_cal.cumulative_transactions_count()
    



                del eth_jsons  # Delete large variables to free memory
                gc.collect()   # Force garbage collection

                # No need for explicit JSON serialization here, as Django handles it
                camp_analytic.most_active_token_addresses = dict(sorted(
                    camp_analytic.most_active_token_addresses.items(),
                    key=lambda x: x[1],
                    reverse=True
                ))
                            
                logger.info("camp_analytic.active_users", active_users=camp_analytic.active_users)
                camp_analytic.save()

                
    def retrieve_store_all_keys(self):
        """
        Uses the s3_retriever to get all the Ethereum S3 keys since 2020 and then stores them in the DB.
        This will be run only once to store all the keys until the the day it was run. Next day only the 
        store_keys_for_next_day fn will be run to store next day key.
        """
        keys = self.s3_retriever.fetch_keys_since_2020()
        for key_name in keys:
            try:
                with transaction.atomic():
                    s3file, created = S3File.objects.get_or_create(key_name=key_name) # Make sure the attribute name is correct
                    if created:
                        logger.info(f"Created new entry for key_name: {key_name}")
                    else:
                        # If the file already existed, we just update the 'update_ts' timestamp
                        s3file.save()
                        logger.info(f"Updated timestamp for key_name: {key_name}")
            except IntegrityError:
                logger.error(f"IntegrityError for key_name: {key_name}")
            except Exception as e:
                logger.error(f"Exception while processing key_name {key_name}: {e}")

            
    def store_keys_for_next_day(self):
        """
        Retrieves the latest S3File key_name, sort in desc to get the latest key and
        find the date from it. If the date is say Jan 5th and the current date is 10th
        then it is missing 4 days of keys in DB, we need to bring those keys from S3
        """

        # Extract the latest date from key_name in the S3File table.
        latest_s3file = S3File.objects.order_by('-creation_ts').first()
        
        # Extract the date from the key_name using a regular expression.
        date_match = re.search(r'date=(\d{4}-\d{2}-\d{2})', latest_s3file.key_name) if latest_s3file else None
        
        if date_match:
            latest_date = datetime.strptime(date_match.group(1), '%Y-%m-%d').date()
        else:
            # Handle no latest date found (either return or set a default date as per your use case)
            return "No latest date found in key_name."
        
        # Identify the missing dates between the latest date and today.
        today = datetime.now().date()
        missing_dates = [latest_date + timedelta(days=i) for i in range(1, (today - latest_date).days)]
        
        fetched_files_count = 0
        
        for missing_date in missing_dates:
            # Fetch and store keys from S3 for missing dates.
            new_files = self.s3_retriever.fetch_keys_for_date(missing_date)
            
            for key_name in new_files:
                S3File.objects.get_or_create(key_name=key_name, 
                                             creation_ts=make_aware(datetime.combine(missing_date, datetime.min.time())))
            
            fetched_files_count += len(new_files)
            
            # Log or print information about fetched files.
            print(f"{len(new_files)} files fetched and stored for date {missing_date}.")
        
        return f"{fetched_files_count} files fetched and stored for missing dates."              




if __name__ == "__main__":
    analyzer = TxnAnalyzer("")

    if S3File.any_record_exists() is not True:
        # if no signle S3File record exist, fetch all the keys from S3
        
        analyzer.retrieve_store_all_keys()
    else:
        # retrieve and store the key for the next day
        analyzer.store_keys_for_next_day()

    # start the campaign analysis
    analyzer.perform_campaign_analysis()
