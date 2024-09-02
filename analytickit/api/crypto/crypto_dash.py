import json
import logging
from typing import Any, Dict, Optional, Type, cast

from django.db.models import Prefetch, QuerySet, Subquery, OuterRef, Count
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework import exceptions, response, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from analytickit.models import Team, User
from analytickit.models.crypto.crypto_analytic import CryptoAnalytic, CryptoInsightViewed
from analytickit.models.crypto.crypto_dashboard import CryptoDashboard
from analytickit.models.crypto.crypto_tile import CryptoDashboardTile
from analytickit.permissions import ProjectMembershipNecessaryPermissions, TeamMemberAccessPermission
from analytickit.api.shared import UserBasicSerializer


class CanEditCryptoDashboard(BasePermission):
    message = "You don't have edit permissions for this crypto dashboard."

    def has_object_permission(self, request: Request, view, dashboard) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return dashboard.can_user_edit(cast(User, request.user).id)


class CryptoDashboardSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    created_by = UserBasicSerializer(read_only=True)
    effective_privilege_level = serializers.SerializerMethodField()

    class Meta:
        model = CryptoDashboard
        fields = [
            "id",
            "name",
            "description",
            "pinned",
            "items",
            "created_at",
            "created_by",
            "deleted",
            "creation_mode",
            "filters",
            "restriction_level",
            "effective_privilege_level",
        ]
        read_only_fields = ["creation_mode", "effective_privilege_level"]

    def create(self, validated_data: Dict, *args: Any, **kwargs: Any) -> CryptoDashboard:
        request = self.context["request"]
        team = Team.objects.get(id=self.context["team_id"])  # Access the team from the context
        validated_data["created_by"] = request.user
        dashboard = CryptoDashboard.objects.create(team=team, **validated_data)
        return dashboard

    def update(self, instance: CryptoDashboard, validated_data: Dict, *args: Any, **kwargs: Any) -> CryptoDashboard:
        user = cast(User, self.context["request"].user)
        can_user_restrict = instance.can_user_restrict(user.id)
        if "restriction_level" in validated_data and not can_user_restrict:
            raise exceptions.PermissionDenied(
                "Only the dashboard owner and project admins have the restriction rights required to change the dashboard's restriction level."
            )

        instance = super().update(instance, validated_data)

        if validated_data.get("deleted", False):
            CryptoDashboardTile.objects.filter(crypto_dashboard__id=instance.id).delete()

        return instance

    def get_items(self, dashboard: CryptoDashboard):
        if self.context["view"].action == "list":
            return None

        tiles = (
            CryptoDashboardTile.objects.filter(crypto_dashboard=dashboard)
            .select_related("crypto_analytic__created_by", "crypto_analytic__last_modified_by", "crypto_analytic__team__organization")
            .order_by("crypto_analytic__created_at")
        )

        insights = []
        for tile in tiles:
            if tile.crypto_analytic:
                insight = tile.crypto_analytic
                layouts = tile.layouts
                if isinstance(layouts, str):
                    layouts = json.loads(layouts)
                color = tile.color
                insights.append({
                    "id": insight.id,
                    "layouts": layouts,
                    "color": color,
                })

        return insights

    def get_effective_privilege_level(self, dashboard: CryptoDashboard) -> CryptoDashboard.PrivilegeLevel:
        return dashboard.get_effective_privilege_level(self.context["request"].user.id)


class CryptoAnalyticBasicSerializer(serializers.ModelSerializer):
    created_by = UserBasicSerializer(read_only=True)

    class Meta:
        model = CryptoAnalytic
        fields = [
            "id",
            "short_id",
            "name",
            "filters",
            "description",
            "last_refresh",
            "saved",
            "updated_at",
            "created_by",
            "created_at",
            "last_modified_at",
            "dashboard",
            "dive_dashboard",  # Add dive_dashboard here
        ]
        read_only_fields = ("short_id", "updated_at", "last_refresh")


class CryptoAnalyticSerializer(CryptoAnalyticBasicSerializer):
    result = serializers.SerializerMethodField()
    last_refresh = serializers.SerializerMethodField(
        read_only=True,
        help_text="The datetime this crypto analytic's results were generated.",
    )
    created_by = UserBasicSerializer(read_only=True)
    last_modified_by = UserBasicSerializer(read_only=True)
    effective_privilege_level = serializers.SerializerMethodField()

    class Meta:
        model = CryptoAnalytic
        fields = [
            "id",
            "short_id",
            "name",
            "filters",
            "filters_hash",
            "deleted",
            "last_refresh",
            "result",
            "created_at",
            "created_by",
            "description",
            "updated_at",
            "last_modified_at",
            "last_modified_by",
            "effective_privilege_level",
            "dashboard",  # Ensure dashboard is included
            "dive_dashboard",  # Ensure dive_dashboard is included
        ]
        read_only_fields = (
            "created_at",
            "created_by",
            "last_modified_at",
            "last_modified_by",
            "short_id",
            "updated_at",
            "effective_privilege_level",
        )

    def create(self, validated_data: Dict, *args: Any, **kwargs: Any) -> CryptoAnalytic:
        request = self.context["request"]
        team = Team.objects.get(id=self.context["team_id"])

        created_by = validated_data.pop("created_by", request.user)
        crypto_analytic = CryptoAnalytic.objects.create(
            team=team, created_by=created_by, **validated_data
        )

        return crypto_analytic

    def update(self, instance: CryptoAnalytic, validated_data: Dict, **kwargs) -> CryptoAnalytic:
        instance.last_modified_at = now()
        instance.last_modified_by = self.context["request"].user

        updated_crypto_analytic = super().update(instance, validated_data)
        return updated_crypto_analytic

    def get_result(self, crypto_analytic: CryptoAnalytic):
        if not crypto_analytic.filters:
            return None
        # Logic to return cached results or perform calculations as needed
        return None

    def get_last_refresh(self, crypto_analytic: CryptoAnalytic):
        return crypto_analytic.last_refresh

    def get_effective_privilege_level(self, crypto_analytic: CryptoAnalytic):
        # Logic to return the privilege level
        return None


class CryptoDashboardsViewSet(viewsets.ModelViewSet):
    queryset = CryptoDashboard.objects.order_by("name")
    serializer_class = CryptoDashboardSerializer
    permission_classes = [
        IsAuthenticated,
        CanEditCryptoDashboard,
        ProjectMembershipNecessaryPermissions,
        TeamMemberAccessPermission,
    ]

    def initial(self, request, *args, **kwargs):
        self.team = self.get_team(request)
        super().initial(request, *args, **kwargs)

    def get_team(self, request):
        return request.user.team  # Assuming the team is associated with the user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["team_id"] = self.team.id
        return context

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        if not self.action.endswith("update"):
            queryset = queryset.filter(deleted=False)

        queryset = (
            queryset.prefetch_related("team__organization", "created_by")
            .prefetch_related(
                Prefetch(
                    "crypto_insights",
                    queryset=CryptoAnalytic.objects.filter(deleted=False).order_by("created_at")
                )
            )
        )
        return queryset

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> response.Response:
        pk = kwargs.get("pk")
        queryset = self.get_queryset()
        dashboard = get_object_or_404(queryset, pk=pk)
        dashboard.last_accessed_at = now()
        dashboard.save(update_fields=["last_accessed_at"])
        serializer = CryptoDashboardSerializer(dashboard, context={"view": self, "request": request})
        return response.Response(serializer.data)

    @action(methods=["POST"], detail=True)
    def viewed(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        CryptoInsightViewed.objects.update_or_create(
            team=self.team, user=request.user, crypto_analytic=self.get_object(), defaults={"last_viewed_at": now()}
        )
        return Response(status=status.HTTP_201_CREATED)
