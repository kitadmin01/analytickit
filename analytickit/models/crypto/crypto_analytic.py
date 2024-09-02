import secrets
import string
from typing import Optional

from django.db import models
from django.utils import timezone
from django.db.models.signals import pre_save
from django.dispatch import receiver

def generate_short_id():
    return "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))

class CryptoAnalytic(models.Model):
    name: models.CharField = models.CharField(max_length=400, null=True, blank=True)
    description: models.CharField = models.CharField(max_length=400, null=True, blank=True)
    team: models.ForeignKey = models.ForeignKey("Team", on_delete=models.CASCADE)
    filters: models.JSONField = models.JSONField(default=dict)
    filters_hash: models.CharField = models.CharField(max_length=400, null=True, blank=True)
    deleted: models.BooleanField = models.BooleanField(default=False)
    saved: models.BooleanField = models.BooleanField(default=False)
    created_at: models.DateTimeField = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    last_refresh: models.DateTimeField = models.DateTimeField(blank=True, null=True)
    created_by: models.ForeignKey = models.ForeignKey("User", on_delete=models.SET_NULL, null=True, blank=True)
    short_id: models.CharField = models.CharField(max_length=12, blank=True, default=generate_short_id)
    last_modified_at: models.DateTimeField = models.DateTimeField(default=timezone.now)
    last_modified_by: models.ForeignKey = models.ForeignKey(
        "User", on_delete=models.SET_NULL, null=True, blank=True, related_name="modified_crypto_analytics",
    )

    # Adding dashboard_id and dive_dashboard_id similar to Insight model
    dashboard: models.ForeignKey = models.ForeignKey(
        "Dashboard", related_name="crypto_items", on_delete=models.CASCADE, null=True, blank=True,
    )
    dive_dashboard: models.ForeignKey = models.ForeignKey("Dashboard", on_delete=models.SET_NULL, null=True, blank=True)

    @property
    def url(self):
        return f"/crypto_analytics/{self.short_id}"

@receiver(pre_save, sender=CryptoAnalytic)
def crypto_analytic_saving(sender, instance: CryptoAnalytic, **kwargs):
    update_fields = kwargs.get("update_fields")
    if update_fields in [frozenset({"filters_hash"}), frozenset({"last_refresh"}), frozenset({"filters"})]:
        return

    if instance.filters and instance.filters != {}:
        instance.filters_hash = generate_crypto_insight_cache_key(instance)


class CryptoInsightViewed(models.Model):
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["team", "user", "crypto_analytic"], name="unique_crypto_insightviewed"),
        ]
        indexes = [
            models.Index(fields=["team_id", "user_id", "-last_viewed_at"]),
        ]

    team: models.ForeignKey = models.ForeignKey("Team", on_delete=models.CASCADE)
    user: models.ForeignKey = models.ForeignKey("User", on_delete=models.CASCADE)
    crypto_analytic: models.ForeignKey = models.ForeignKey("CryptoAnalytic", on_delete=models.CASCADE)
    last_viewed_at: models.DateTimeField = models.DateTimeField()

def generate_crypto_insight_cache_key(crypto_analytic: CryptoAnalytic) -> str:
    # Implement cache key generation logic specific to CryptoAnalytic
    pass
