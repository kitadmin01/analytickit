import re

from django.contrib.postgres.fields import JSONField
from django.db import models

ETHEREUM_ADDRESS_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")


class VisitorWalletAddress(models.Model):
    visitor_wallet_address = models.CharField(max_length=42)  # Typical length of an Ethereum address
    visitor_wallet_address_ts = models.DateTimeField()
    creation_ts = models.DateTimeField(auto_now_add=True)
    update_ts = models.DateTimeField(auto_now=True)
    community_engagement = models.ForeignKey("CommunityEngagement", on_delete=models.SET_NULL, null=True, blank=True)
    team = models.ForeignKey(
        "analytickit.Team",
        on_delete=models.CASCADE,
        related_name="user_blockchain_data",
        related_query_name="user_blockchain_datum",
    )
    txn_data = JSONField()  # Field to store transaction data
    token_transfer_data = JSONField()  # Field to store token transfer data

    def save(self, *args, **kwargs):
        if self.visitor_wallet_address:
            self.visitor_wallet_address = self.visitor_wallet_address.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.visitor_wallet_address
