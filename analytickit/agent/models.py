from django.contrib.postgres.fields import JSONField
from django.db import models


class AggregationSnapshot(models.Model):
    """Daily pre-computed summary of web2+web3 data per team."""

    team = models.ForeignKey("analytickit.Team", on_delete=models.CASCADE, db_index=True)
    date = models.DateField(db_index=True)
    web2_summary = JSONField(default=dict, help_text="Aggregated web2 metrics")
    web3_summary = JSONField(default=dict, help_text="Aggregated web3 metrics")
    cross_linked_summary = JSONField(default=dict, help_text="Cross-linked web2+web3 metrics")
    rolling_7d_summary = JSONField(null=True, blank=True, help_text="7-day rolling comparison")
    rolling_30d_summary = JSONField(null=True, blank=True, help_text="30-day rolling comparison")
    token_count = models.IntegerField(default=0, help_text="Estimated tokens for this snapshot")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("team", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"Snapshot for team {self.team_id} on {self.date}"


class Recommendation(models.Model):
    """AI-generated recommendation stored per team per day."""

    class Category(models.TextChoices):
        ENGAGEMENT = "engagement", "Engagement"
        TRANSACTION = "transaction", "Transaction Health"
        CAMPAIGN = "campaign", "Campaign Attribution"
        CHURN = "churn", "Churn Risk"
        GROWTH = "growth", "Growth Opportunity"
        ANOMALY = "anomaly", "Anomaly Detection"

    class Severity(models.TextChoices):
        INFO = "info", "Informational"
        WARNING = "warning", "Warning"
        ACTION_REQUIRED = "action_required", "Action Required"

    team = models.ForeignKey("analytickit.Team", on_delete=models.CASCADE, db_index=True)
    date = models.DateField(db_index=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    severity = models.CharField(max_length=20, choices=Severity.choices)
    title = models.CharField(max_length=255)
    detail = models.TextField()
    suggested_action = models.TextField()
    metric_references = JSONField(default=list, help_text="List of metric keys this rec references")
    is_acted_on = models.BooleanField(default=False)
    acted_on_at = models.DateTimeField(null=True, blank=True)
    openai_model = models.CharField(max_length=50, help_text="Model used to generate this")
    openai_tokens_used = models.IntegerField(default=0)
    snapshot = models.ForeignKey(AggregationSnapshot, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-severity"]
        indexes = [
            models.Index(fields=["team", "date"]),
            models.Index(fields=["team", "category"]),
        ]

    def __str__(self):
        return f"[{self.severity}] {self.title}"
