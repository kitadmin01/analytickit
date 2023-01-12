from django.db import models

from analytickit.models.dashboard import Dashboard
from analytickit.models.utils import UUIDModel, sane_repr


# We call models that grant a user access to some resource (which isn't a grouping of users) a "privilege"
class DashboardPrivilege(UUIDModel):
    dashboard: models.ForeignKey = models.ForeignKey(
        "analytickit.Dashboard", on_delete=models.CASCADE, related_name="privileges", related_query_name="privilege",
    )
    user: models.ForeignKey = models.ForeignKey(
        "analytickit.User",
        on_delete=models.CASCADE,
        related_name="explicit_dashboard_privileges",
        related_query_name="explicit_dashboard_privilege",
    )
    level: models.PositiveSmallIntegerField = models.PositiveSmallIntegerField(
        choices=Dashboard.RestrictionLevel.choices
    )
    added_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["dashboard", "user"], name="unique_explicit_dashboard_privilege"),
        ]

    __repr__ = sane_repr("dashboard", "user", "level")
