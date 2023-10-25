"""
Created on Aug 04 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""

from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta, date
from django.utils.timezone import make_aware


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
    
    def get_campaign_analytics(self):
        """
        Returns all CampaignAnalytic objects associated with this CommunityEngagement
        """
        return self.campaignanalytic_set.all()



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
        query = cls.objects.filter(start_date__lte=today, end_date__gte=today)
        query_str = str(query.query)
        return query

    @classmethod
    def is_engagement_eligible_for_team(cls, team_id):
        """
        Checks if a CommunityEngagement exists for the given team_id where today's date
        is in between start_date and end_date.
        
        Args:
        - team_id (int): The ID of the team to check for.

        Returns:
        - bool: True if no such engagement exists, False otherwise.
        """
        today = date.today()
        exists = cls.objects.filter(
            team=team_id,
            start_date__lte=today,
            end_date__gte=today
        ).exists()
        return not exists

    def has_associated_campaign_analytic(self):
        """
        Returns True if the CommunityEngagement instance has at least one related 
        CampaignAnalytic, otherwise False.
        """
        return CampaignAnalytic.objects.filter(community_engagement=self).exists()

    def get_all_changes_in_avg_gas_price(self):
        """
        Returns all change_in_average_gas_price values from associated CampaignAnalytic objects.
        """
        return [analytic.change_in_average_gas_price for analytic in self.campaignanalytic_set.all()]



class CampaignAnalytic(models.Model):
    """
    Stores campaign analytics calculated from S3
    Time Series Data (e.g., Daily Metrics) are stored in regular data types. 
    Distribution and Frequency Data stored in JSON
    """
    community_engagement = models.ForeignKey(CommunityEngagement, on_delete=models.CASCADE, null=True)
    creation_ts = models.DateTimeField(auto_now_add=True) 
    update_ts = models.DateTimeField(auto_now_add=True) 
    active_users = models.IntegerField(default=0)
    total_contract_calls = models.IntegerField(default=0)
    function_calls_count = models.JSONField(default=dict)
    tot_tokens_transferred = models.DecimalField(max_digits=30, decimal_places=10, default=0)
    last_modified = models.DateTimeField(auto_now=True, null=True)
    tot_txns = models.IntegerField(default=0)
    ave_gas_used = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    transaction_value_distribution = models.JSONField(default=dict)  # Store distribution data as JSON
    ave_txn_fee = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    tot_txn_from_address = models.JSONField(default=dict)  # Store counts of transactions from specific addresses as JSON
    tot_txn_to_address = models.JSONField(default=dict)  # Store counts of transactions to specific addresses as JSON
    freq_txn = models.JSONField(default=dict)  # Store frequency data based on day/time as JSON
    token_transfer_volume = models.DecimalField(max_digits=30, decimal_places=10, default=0)
    token_transfer_value = models.DecimalField(max_digits=30, decimal_places=10, default=0)
    most_active_token_addresses = models.JSONField(default=dict)  # Store addresses and their activity level as JSON
    ave_token_transfer_value = models.DecimalField(max_digits=30, decimal_places=10, default=0)
    token_flow = models.JSONField(default=dict)  # Store flow data between addresses as JSON
    token_transfer_value_distribution = models.JSONField(default=dict)  # Store distribution data as JSON

    # New fieldss for storing various metrics from receipt_effective_gas_price
    average_effective_gas_price = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    median_effective_gas_price = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    gas_price_min = models.DecimalField(max_digits=20, decimal_places=5, default=0)  # Part of gas_price_range
    gas_price_max = models.DecimalField(max_digits=20, decimal_places=5, default=0)  # Part of gas_price_range
    total_daily_fees = models.DecimalField(max_digits=30, decimal_places=10, default=0)
    change_in_average_gas_price = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    
    # Since transactions_count_by_gas_price_range, daily_percentile_analysis, transactions_relative_to_previous_day_avg, 
    # gas_price_histogram encapsulate various subfields, using JSONFields
    transactions_by_gas_price_range = models.JSONField(default=dict)
    daily_percentile_data = models.JSONField(default=dict)
    transactions_relative_prev_day = models.JSONField(default=dict)
    gas_price_histogram_data = models.JSONField(default=dict)
    
    daily_standard_deviation = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    
    # Cumulative data might benefit from individual fields for simplicity and frequent querying
    cumulative_gas_used = models.DecimalField(max_digits=30, decimal_places=10, default=0)
    cumulative_transaction_fees = models.DecimalField(max_digits=30, decimal_places=10, default=0)
    cumulative_avg_gas_price = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    cumulative_transactions_count = models.IntegerField(default=0)



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
    
    @classmethod
    def  get_or_create_campaign_analytic_for_today(cls, community_engagement):
        """
        Returns a CampaignAnalytic instance for the given community_engagement and today's date.
        Creates a new instance if it doesn't exist, otherwise returns the existing instance.
        """
        today = make_aware(datetime.now()).date()
        # Try to get the existing instance
        campaign_analytic = cls.objects.filter(
            community_engagement=community_engagement, 
            creation_ts__date=today
        ).first()
        # If it doesn't exist, create a new one
        if not campaign_analytic:
            campaign_analytic = cls.objects.create(community_engagement=community_engagement)
        
        return campaign_analytic


