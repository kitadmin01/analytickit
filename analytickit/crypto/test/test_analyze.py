"""
Created on Aug 26 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""


import pytest
from django.utils import timezone
from analytickit.models.crypto.comm_eng import CommunityEngagement, CampaignAnalytic, S3File
import logging
from django.test import override_settings

logger = logging.getLogger(__name__)

@override_settings(
    LOGGING={
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'loggers': {
            'django.db.backends': {
                'handlers': ['console'],
                'level': 'DEBUG',
                'propagate': False,
            },
        },
    }
)


@pytest.mark.skip(reason="This test is skipped for now.")
@pytest.mark.django_db
def test_perform_campaign_analysis(txn_analyzer):
    # Create a campaign object and save it to the test database
    campaign = CommunityEngagement.objects.create(
        team_id=1,
        campaign_name='Test Campaign',
        token_address='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        contract_type='ERC-20',
        start_date=timezone.now().date(),
        end_date=timezone.now().date(),
        creation_ts=timezone.now(),
        update_ts=timezone.now(),
        contract_address='0xeaf3e9481af515c7bc4ddecf9125be9c48',
    )
    # Create a CampaignAnalytic object and save it to the test database
    campaign_analytic = CampaignAnalytic.objects.create(
        community_engagement=campaign,
        creation_ts=timezone.now(),
        update_ts=timezone.now(),
        active_users=5,
        total_contract_calls=10,
        average_gas_used=10000,
        function_calls_count={"transfer": 10},
        tot_tokens_transferred=100,
        referral_count=5,
        tot_txns=10,
        ave_gas_used=10000,
        transaction_value_distribution={"0-10": 5},
        ave_txn_fee=0.01,
        tot_txn_from_address={"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": 5},
        tot_txn_to_address={"0xeaf3e9481af515c7bc4ddecf9125be9c48": 5},
        freq_txn={"morning": 5},
        token_transfer_volume=100,
        token_transfer_value=100,
        most_active_token_addresses={"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": 5},
        ave_token_transfer_value=10,
        token_flow={"in": 50, "out": 50},
        token_transfer_value_distribution={"0-10": 5},
    )

    # Call the perform_campaign_analysis method
    txn_analyzer.perform_campaign_analysis()

    # Get the updated campaign_analytic object from the test database
    updated_campaign_analytic = CampaignAnalytic.objects.get(pk=campaign_analytic.pk)

    # Assert that the active_users field was updated correctly
    assert updated_campaign_analytic.active_users == 1
    
    campaign.delete()
    campaign_analytic.delete()


@pytest.mark.skip(reason="This test is skipped for now.")
@pytest.mark.django_db
def test_retrieve_store_all_keys_in_db(txn_analyzer):
    logger.info("Starting test_store_keys_in_db")



    # Fetch the initial count of S3File records in the DB
    initial_count = S3File.objects.count()

    # Invoke the method to fetch and store the next day's S3 keys
    txn_analyzer.retrieve_store_all_keys()

    # Fetch the new count of S3File records in the DB
    new_count = S3File.objects.count()

    # Assert that the count of S3File records has increased
    assert new_count > initial_count, "No new keys were stored in the DB."

    # Optional: If you want to clean up the newly added records (use with caution)
    # S3File.objects.filter(creation_ts__gt=timezone.now() - timedelta(days=1)).delete()


