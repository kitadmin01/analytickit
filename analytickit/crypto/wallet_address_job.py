import os
import django
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

    def get_wallet_login_events():
        """
        This method returns unique crypto_wallet_public_address that are sent from the browser to Clickhouse DB along with 
        tiemstamp, and team_id. team_id represents the logged in user's Project/Campaign. 
        """
        # Calculate the previous day's date
        previous_day = timezone.now().date() - datetime.timedelta(days=51)
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

        # Execute the query
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
        events_json = WalletAddressJob.get_wallet_login_events()
        events = json.loads(events_json)

        # Retrieve S3 data for a specific wallet address
        s3_retriever = S3Retriever("")  # Initialize with appropriate config
        date = timezone.now().date() - datetime.timedelta(days=1)
        s3_results = s3_retriever.get_data_for_wallet_address("0x17fb866f05d0798fd73f0d3e373e1f9d07e14e25", date)

        for event in events:
            timestamp = datetime.datetime.fromisoformat(event['timestamp'])
            team_id = event['team_id']
            wallet_address = event['crypto_wallet_public_address']

            # Assuming you have a method to get the team instance from team_id
            team = WalletAddressJob.get_team_instance(team_id)  

            # Initialize empty lists for transaction and token transfer data
            txn_data = []
            token_transfer_data = []

            # Aggregate data from s3_results
            for key, value in s3_results.items():
                if 'transactions' in key:
                    txn_data.extend(value)
                elif 'token_transfers' in key:
                    token_transfer_data.extend(value)
            # Create or update the VisitorWalletAddress instance
            VisitorWalletAddress.objects.update_or_create(
                visitor_wallet_address=wallet_address,
                visitor_wallet_address_ts=timestamp,
                defaults={
                    'team': team,
                    'txn_data': txn_data,
                    'token_transfer_data': token_transfer_data
                }
            )


if __name__ == "__main__":

    wallet_job = WalletAddressJob
    wallet_job.insert_wallet_login_events()


    #events_json = wallet_job.get_wallet_login_events()
    #print(events_json)

    #public address 0x17fb866f05d0798fd73f0d3e373e1f9d07e14e25 on date=2023-12-13 in S3
    s3_retriever = S3Retriever("")
    date =  timezone.now().date() - datetime.timedelta(days=1)
    print("date=",date)
    results = s3_retriever.get_data_for_wallet_address("0x17fb866f05d0798fd73f0d3e373e1f9d07e14e25", date)
    print("results=",results)


