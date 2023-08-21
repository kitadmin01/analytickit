from django.db import models


class CommunityEngagement(models.Model):
    team_id = models.IntegerField()
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
    date = models.DateField()
    contract_address = models.CharField(max_length=42)
    active_users = models.IntegerField()
    total_contract_calls = models.IntegerField()
    average_gas_used = models.DecimalField(max_digits=20, decimal_places=5)
    function_calls_count = models.JSONField()
    tot_tokens_transferred = models.DecimalField(max_digits=30, decimal_places=10)
    referral_count = models.IntegerField()
    last_modified = models.DateTimeField(auto_now=True)
    tot_txns = models.IntegerField()
    ave_gas_used = models.DecimalField(max_digits=20, decimal_places=5)

    # New fields
    transaction_value_distribution = models.JSONField()  # Store distribution data as JSON
    ave_txn_fee = models.DecimalField(max_digits=20, decimal_places=5)
    tot_txn_from_address = models.JSONField()  # Store counts of transactions from specific addresses as JSON
    tot_txn_to_address = models.JSONField()  # Store counts of transactions to specific addresses as JSON
    freq_txn = models.JSONField()  # Store frequency data based on day/time as JSON
    token_transfer_volume = models.DecimalField(max_digits=30, decimal_places=10)
    token_transfer_value = models.DecimalField(max_digits=30, decimal_places=10)
    most_active_token_addresses = models.JSONField()  # Store addresses and their activity level as JSON
    ave_token_transfer_value = models.DecimalField(max_digits=30, decimal_places=10)
    token_flow = models.JSONField()  # Store flow data between addresses as JSON
    token_transfer_value_distribution = models.JSONField()  # Store distribution data as JSON

    def __str__(self):
        return self.campaign_name
