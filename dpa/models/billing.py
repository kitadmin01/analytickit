from django.db import models


class Billing(models.Model):
    user = models.ForeignKey("analytickit.User", on_delete=models.CASCADE, related_name="billing_info")

    # Plan details
    plan_name = models.CharField(max_length=255, default="Free Plan")
    is_metered_billing = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Price for the plan
    event_allowance = models.PositiveIntegerField(default=50000)  # Total number of events allocated for the plan
    event_allocation = models.PositiveIntegerField(default=0)  # Number of events allocated for the plan

    # Billing cycle details
    billing_period_starts = models.DateField(null=True, blank=True)
    billing_period_ends = models.DateField(null=True, blank=True)

    # Usage details
    current_usage = models.PositiveIntegerField(default=0)  # Number of events used so far
    current_bill_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Subscription details
    subscription_url = models.URLField(max_length=500, null=True, blank=True)

    # Billing limit details
    billing_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    billing_limit_exceeded = models.BooleanField(default=False)

    # Tier details (assuming a simple tier system for now)
    tier_name = models.CharField(max_length=255, null=True, blank=True)
    price_per_event = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    number_of_events_in_tier = models.PositiveIntegerField(null=True, blank=True)

    # Other details
    should_setup_billing = models.BooleanField(default=True)
    is_billing_active = models.BooleanField(default=False)
    should_display_current_bill = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Billing"
        verbose_name_plural = "Billings"

    def __str__(self):
        return f"Billing for {self.user.email}"
