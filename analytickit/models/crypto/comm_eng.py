"""
Created on Aug 04 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""

from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta



class S3File(models.Model):
    key_name = models.TextField(unique=True)  # Assuming that each keyname is unique.
    creation_ts = models.DateTimeField(auto_now_add=True)  # The date and time when the filename was added to the database.
    update_ts = models.DateTimeField(auto_now_add=True)  # The date and time when the filename was updated to the database.

    def __str__(self):
        return self.key_name

    @classmethod
    def get_all_s3files(cls):
        return S3File.objects.all()
    
    @classmethod
    def get_all_key_names(cls):
        return list(cls.objects.values_list('key_name', flat=True))
    
    @classmethod
    def get_previous_day_key_name(cls):
        # Calculate the previous day's date and return as a list
        prev_day = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        key_pattern = f"/date={prev_day}/"

        # Fetch all keys that have the previous day's date in their name
        previous_day_keys = cls.objects.filter(key_name__contains=key_pattern)

        return [key.key_name for key in previous_day_keys]
    
    @classmethod
    def any_record_exists(cls):
        return cls.objects.exists()



class CommunityEngagement(models.Model):
    """
    Stores campaign details from UI
    """
    team = models.ForeignKey(
        'analytickit.Team',  
        on_delete=models.CASCADE,
        related_name='community_engagements',
        related_query_name='community_engagement'
    )
    campaign_name = models.CharField(max_length=50)
    token_address = models.CharField(max_length=42)
    CONTRACT_TYPES = [
        ("ERC-20", "ERC-20"),
        ("ERC-721", "ERC-721"),
        ("ERC-777", "ERC-777"),
    ]
    contract_type = models.CharField(max_length=10, choices=CONTRACT_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    creation_ts = models.DateTimeField(auto_now_add=True) 
    update_ts = models.DateTimeField(auto_now_add=True) 
    contract_address = models.CharField(max_length=42)

    def __str__(self):
        return self.campaign_name

    @classmethod
    def get_campaign_records_today(cls):
        today = datetime.now().date()
        return cls.objects.filter(start_date__lte=today, end_date__gte=today)

    def is_first_campaign_analytic(self):
        """
        Returns True if the CommunityEngagement instance has no related 
        CampaignAnalytic at all, otherwise False.
        """
        return not CampaignAnalytic.objects.filter(community_engagement=self).exists()


class CampaignAnalytic(models.Model):
    """
    Stores campaign analytics calculated from S3
    Time Series Data (e.g., Daily Metrics) are stored in regular data types. 
    Distribution and Frequency Data stored in JSON
    """
    community_engagement = models.ForeignKey(CommunityEngagement, on_delete=models.CASCADE, null=True)
    creation_ts = models.DateTimeField(auto_now_add=True) 
    update_ts = models.DateTimeField(auto_now_add=True) 
    active_users = models.IntegerField(null=True)
    total_contract_calls = models.IntegerField(null=True)
    function_calls_count = models.JSONField(null=True)
    tot_tokens_transferred = models.DecimalField(max_digits=30, decimal_places=10, null=True)
    referral_count = models.IntegerField(null=True)
    last_modified = models.DateTimeField(auto_now=True, null=True)
    tot_txns = models.IntegerField(null=True)
    ave_gas_used = models.DecimalField(max_digits=20, decimal_places=5, null=True)

    # New fields
    transaction_value_distribution = models.JSONField(null=True)  # Store distribution data as JSON
    ave_txn_fee = models.DecimalField(max_digits=20, decimal_places=5, null=True)
    tot_txn_from_address = models.JSONField(null=True)  # Store counts of transactions from specific addresses as JSON
    tot_txn_to_address = models.JSONField(null=True)  # Store counts of transactions to specific addresses as JSON
    freq_txn = models.JSONField(null=True)  # Store frequency data based on day/time as JSON
    token_transfer_volume = models.DecimalField(max_digits=30, decimal_places=10, null=True)
    token_transfer_value = models.DecimalField(max_digits=30, decimal_places=10, null=True)
    most_active_token_addresses = models.JSONField(null=True)  # Store addresses and their activity level as JSON
    ave_token_transfer_value = models.DecimalField(max_digits=30, decimal_places=10, null=True)
    token_flow = models.JSONField(null=True)  # Store flow data between addresses as JSON
    token_transfer_value_distribution = models.JSONField(null=True)  # Store distribution data as JSON

    @classmethod
    def get_or_create_for_today(cls, community_engagement=None):
        # Get today's start and end time.
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = timezone.now().replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Try to get the object for today or create a new one
        filters = {
            "creation_ts__range": (today_start, today_end)
        }
        if community_engagement:
            filters["community_engagement"] = community_engagement

        obj, created = cls.objects.get_or_create(**filters)
        
        return obj


