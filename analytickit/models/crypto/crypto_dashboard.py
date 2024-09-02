from typing import Any, Dict, cast

from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

class CryptoDashboard(models.Model):
    class CreationMode(models.TextChoices):
        DEFAULT = "default", "Default"
        TEMPLATE = "template", "Template"
        DUPLICATE = "duplicate", "Duplicate"

    class RestrictionLevel(models.IntegerChoices):
        EVERYONE_IN_PROJECT_CAN_EDIT = 21, "Everyone in the project can edit"
        ONLY_COLLABORATORS_CAN_EDIT = 37, "Only those invited to this dashboard can edit"

    class PrivilegeLevel(models.IntegerChoices):
        CAN_VIEW = 21, "Can view dashboard"
        CAN_EDIT = 37, "Can edit dashboard"

    name: models.CharField = models.CharField(max_length=400, null=True, blank=True)
    description: models.TextField = models.TextField(blank=True)
    team: models.ForeignKey = models.ForeignKey("Team", on_delete=models.CASCADE)
    pinned: models.BooleanField = models.BooleanField(default=False)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True, blank=True)
    created_by: models.ForeignKey = models.ForeignKey("User", on_delete=models.SET_NULL, null=True, blank=True)
    deleted: models.BooleanField = models.BooleanField(default=False)
    last_accessed_at: models.DateTimeField = models.DateTimeField(blank=True, null=True)
    filters: models.JSONField = models.JSONField(default=dict)
    creation_mode: models.CharField = models.CharField(max_length=16, default="default", choices=CreationMode.choices)
    restriction_level: models.PositiveSmallIntegerField = models.PositiveSmallIntegerField(
        default=RestrictionLevel.EVERYONE_IN_PROJECT_CAN_EDIT, choices=RestrictionLevel.choices,
    )
    crypto_insights = models.ManyToManyField(
        "CryptoAnalytic", related_name="crypto_dashboards", through="CryptoDashboardTile", blank=True
    )

    @property
    def url(self):
        return f"/crypto_dashboard/{self.id}"

    @property
    def effective_restriction_level(self) -> RestrictionLevel:
        return self.restriction_level

    def get_effective_privilege_level(self, user_id: int) -> PrivilegeLevel:
        if self.effective_restriction_level == self.RestrictionLevel.EVERYONE_IN_PROJECT_CAN_EDIT:
            return self.PrivilegeLevel.CAN_EDIT

        return self.PrivilegeLevel.CAN_VIEW

    def can_user_restrict(self, user_id: int) -> bool:
      # Sync conditions with frontend hasInherentRestrictionsRights
      from analytickit.models.organization import OrganizationMembership

      # The owner (aka creator) has full permissions
      if user_id == self.created_by_id:
            return True
      effective_project_membership_level = self.team.get_effective_membership_level(user_id)
      return (
      effective_project_membership_level is not None
      and effective_project_membership_level >= OrganizationMembership.Level.ADMIN
      )

    def can_user_edit(self, user_id: int) -> bool:
        return self.get_effective_privilege_level(user_id) >= self.PrivilegeLevel.CAN_EDIT

    def get_analytics_metadata(self) -> Dict[str, Any]:
        return {
            "pinned": self.pinned,
            "item_count": self.crypto_insights.count(),
            "created_at": self.created_at,
            "has_description": self.description != "",
        }
