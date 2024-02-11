import os
import django
from django.db import transaction
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytickit.settings')
django.setup()
sys.path.append('./analytickit/crypto')  

from analytickit.crypto.s3_ret import S3Retriever



from analytickit.client import sync_execute
import datetime
import json
from django.utils import timezone
from analytickit.models.crypto.wallet_address import VisitorWalletAddress
from django.core.exceptions import ObjectDoesNotExist
from analytickit.models.team import Team 
from wallet_address_metric import WalletAddressMetricCal

class WalletAddressJob:


    def get_wallet_login_events(testing=False, start_of_day_test=None, end_of_day_test=None):
        """
        This method returns unique crypto_wallet_public_address that are sent from the browser to Clickhouse DB along with 
        timestamp, and team_id. team_id represents the logged in user's Project/Campaign. 

        Args:
        - testing (bool): If true, the function uses the custom timestamp range provided.
        - start_of_day_test (datetime): The custom start timestamp for testing.
        - end_of_day_test (datetime): The custom end timestamp for testing.
        """
        if testing and start_of_day_test is not None and end_of_day_test is not None:
            start_of_day = start_of_day_test
            end_of_day = end_of_day_test
        else:
            # Calculate the previous day's date
            previous_day = timezone.now().date() - datetime.timedelta(days=1)
            start_of_day = datetime.datetime.combine(previous_day, datetime.time.min, tzinfo=timezone.utc)
            end_of_day = datetime.datetime.combine(previous_day, datetime.time.max, tzinfo=timezone.utc)

        # SQL query to select relevant data
        query = """
        SELECT 
            timestamp, 
            team_id, 
            JSONExtractString(properties, '$crypto_wallet_public_address') as crypto_wallet_public_address
        FROM events 
        WHERE event = 'WalletLogin' 
            AND timestamp >= %(start_of_day)s 
            AND timestamp <= %(end_of_day)s
        """

        # Assume sync_execute is defined elsewhere and executes the SQL query
        results = sync_execute(
            query,
            {"start_of_day": start_of_day, "end_of_day": end_of_day}
        )

        # Use a set to track unique wallet addresses
        unique_addresses = set()
        unique_results = []

        for row in results:
            wallet_address = row[2]
            if wallet_address not in unique_addresses:
                unique_addresses.add(wallet_address)
                unique_results.append({'timestamp': row[0].isoformat(), 'team_id': row[1], 'crypto_wallet_public_address': wallet_address})

        # Convert the unique result to JSON
        result_json = json.dumps(unique_results)

        return result_json

    
    def get_team_instance(team_id):
        """
        Retrieve the Team instance from the team_id.
        """
        try:
            return Team.objects.get(id=team_id)
        except ObjectDoesNotExist:
            # Handle the case where the Team does not exist
            # You can log this situation or handle it as per your application's requirements
            return None
    

    def insert_wallet_login_events():
        # events_json = WalletAddressJob.get_wallet_login_events(testing=True, start_of_day_test='2023-02-09 00:00:00', end_of_day_test='2024-01-09 00:00:00')
        events_json = WalletAddressJob.get_wallet_login_events()
        events = json.loads(events_json)

        s3_retriever = S3Retriever("")  # Initialize with appropriate config
        date = timezone.now().date() - datetime.timedelta(days=1)

        for event in events:
            wallet_address = event['crypto_wallet_public_address']
            s3_results = s3_retriever.get_data_for_wallet_address(wallet_address, date)
            timestamp = datetime.datetime.fromisoformat(event['timestamp'])
            team_id = event['team_id']
            team = WalletAddressJob.get_team_instance(team_id)

            txn_data = []
            token_transfer_data = []

            for key, value in s3_results.items():
                if 'transactions' in key:
                    txn_data.extend(value)
                elif 'token_transfers' in key:
                    token_transfer_data.extend(value)

            # Only proceed if txn_data or token_transfer_data is not empty
            if txn_data or token_transfer_data:
                obj, created = VisitorWalletAddress.objects.get_or_create(
                    visitor_wallet_address=wallet_address,
                    defaults={
                        'visitor_wallet_address_ts': timestamp,
                        'team': team,
                        'txn_data': txn_data if txn_data else ['placeholder to avoid null'],  # Provide default non-null value
                        'token_transfer_data': token_transfer_data if token_transfer_data else ['placeholder to avoid null']  # Provide default non-null value
                    }
                )
                if not created:
                    obj.visitor_wallet_address_ts = timestamp
                    obj.team = team
                    obj.txn_data = txn_data if txn_data else obj.txn_data  # Preserve existing data if no new data
                    obj.token_transfer_data = token_transfer_data if token_transfer_data else obj.token_transfer_data  # Preserve existing data if no new data
                    obj.save()


if __name__ == "__main__":
    print("started WalletAddressJob")
    wallet_job = WalletAddressJob
    wallet_job.insert_wallet_login_events()
    print("completed WalletAddressJob")



