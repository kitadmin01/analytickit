#!/usr/bin/env python3

"""
Created on Aug 26 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"

"""
import os
import django
# uses /home/mani/sass/analytickit/dpa/settings.py, theis is needed before you can run this program
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytickit.settings')
# Need this to initialize Django 
django.setup()


from logger_config import logger
import datetime
from analytickit.models.crypto.comm_eng import CommunityEngagement,CampaignAnalytic,S3File
from analytickit.crypto.s3_ret import S3Retriever
from analytickit.crypto.metric_cal import MetricCalculator 
from django.db import transaction, IntegrityError
import gc


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
        com_engs = CommunityEngagement.get_campaign_records_today()

        s3_keys =  S3File.get_all_key_names()
        # filtered_keys used for testing only
        '''filtered_keys = [
            key for key in s3_keys 
            if datetime.datetime.strptime(key.split('date=')[1].split('/')[0], "%Y-%m-%d") >= datetime.datetime(2023, 8, 27)
        ]
        s3_keys = filtered_keys'''

        BATCH_SIZE = 100  # Define batch size
        s3_keys_batches = [s3_keys[i:i + BATCH_SIZE] for i in range(0, len(s3_keys), BATCH_SIZE)]

        for campaign in com_engs:
            if campaign.is_first_campaign_analytic is not True:
                s3_key_batches = [S3File.get_all_key_names()[i:i + BATCH_SIZE] for i in range(0, len(S3File.get_all_key_names()), BATCH_SIZE)]
            else:
                s3_key_batches = [S3File.get_previous_day_key_name()[i:i + BATCH_SIZE] for i in range(0, len(S3File.get_previous_day_key_name()), BATCH_SIZE)]

            # Now, process each batch of s3 keys separately
            for s3_key_batch in s3_key_batches:
                eth_jsons = self.s3_retriever.get_blockchain_data(
                    campaign.contract_address,
                    campaign.token_address,
                    s3_key_batch
                )        
            logger.info("logging_event", eth_jsons=eth_jsons)

            # create a new or get existsing camp_analytic for today. Only one
            # camp_analytic per day.
            camp_analytic = CampaignAnalytic. get_or_create_for_today(campaign)
                        
            met_cal = MetricCalculator(eth_jsons,campaign.contract_address, campaign.token_address)
            camp_analytic.active_users = met_cal.calculate_dau()
            camp_analytic.total_contract_calls = met_cal.calculate_contract_calls()
            camp_analytic.function_calls_count =  met_cal.calculate_function_calls_count()
            camp_analytic.tot_tokens_transferred = met_cal.calculate_total_tokens_transferred()
            camp_analytic.tot_txns = met_cal.calculate_total_transactions()
            camp_analytic.ave_gas_used = met_cal.calculate_average_gas_used()
            camp_analytic.transaction_value_distribution = met_cal.calculate_transaction_value_distribution()
            camp_analytic.ave_txn_fee = met_cal.calculate_average_transaction_fee()
            camp_analytic.tot_txn_from_address = met_cal.calculate_total_transactions_from_address()

            camp_analytic.tot_txn_to_address = met_cal.calculate_total_transactions_to_address()
            camp_analytic.freq_txn = met_cal.frequency_of_transactions()
            camp_analytic.token_transfer_volume = met_cal.calculate_token_transfer_volume()
            camp_analytic.token_transfer_value = met_cal.calculate_token_transfer_value()
            camp_analytic.most_active_token_addresses = met_cal.most_active_token_addresses()
            camp_analytic.ave_token_transfer_value = met_cal.calculate_average_token_transfer_value()
            camp_analytic.token_flow = met_cal.calculate_token_flow()
            camp_analytic.token_transfer_value_distribution = met_cal.calculate_token_transfer_value_distribution()


            logger.info("camp_analytic.active_users",active_users=camp_analytic.active_users)
            camp_analytic.save()

            del eth_jsons  # Delete large variables to free memory
            gc.collect()   # Force garbage collection
                
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
        Retrieves the latest S3File creation timestamp from the DB, adds one day, 
        fetches the S3 files for that new date, and then stores them in the database.
        """
        if latest_s3file := S3File.objects.order_by('-creation_ts').first():
            next_date = latest_s3file.creation_ts + datetime.timedelta(days=1)
            new_files = self.s3_retriever.fetch_keys_for_date(next_date.date())

            for key_name in new_files:
                S3File.objects.get_or_create(key_name=key_name)

            return f"{len(new_files)} files fetched and stored for date {next_date.date()}."

        else:
            # If no entries in the DB, you might want to fetch for a default start date or handle this scenario differently
            logger.info("No entries found in the DB.")
            return "No files fetched."
            
                




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
