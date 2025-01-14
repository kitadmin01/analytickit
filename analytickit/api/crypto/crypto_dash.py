import json
import logging
from typing import Any, Dict, Optional, Type, cast

from django.db.models import Prefetch, QuerySet, Subquery, OuterRef, Count
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework import exceptions, response, serializers, viewsets, status
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
from analytickit.models.crypto.comm_eng import CampaignAnalytic

logger = logging.getLogger(__name__)


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
        team = Team.objects.get(id=self.context["team_id"])
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


class CryptoDashboardsViewSet(viewsets.ModelViewSet):
    serializer_class = CryptoDashboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CryptoAnalytic.objects.filter(
            team_id=self.request.user.current_team_id
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            logger.debug(f"Found {queryset.count()} dashboards")

            return Response({
                'results': [{
                    'id': item.id,
                    'name': item.name,
                    'description': item.description or '',
                    'pinned': False,
                    'created_at': item.created_at.isoformat() if item.created_at else None,
                    'created_by': {
                        'id': request.user.id,
                        'uuid': str(request.user.uuid),
                        'distinct_id': request.user.distinct_id,
                        'first_name': request.user.first_name,
                        'email': request.user.email
                    },
                    'is_shared': False,
                    'deleted': False,
                    'filters': item.filters or {},
                    'creation_mode': 'default',
                    'restriction_level': 0,
                    'effective_restriction_level': 0,
                    'effective_privilege_level': 21,
                    'items': [],
                    'tags': [],
                    'last_modified_at': item.last_modified_at.isoformat() if item.last_modified_at else None,
                    'last_modified_by': {
                        'id': request.user.id,
                        'uuid': str(request.user.uuid),
                        'distinct_id': request.user.distinct_id,
                        'first_name': request.user.first_name,
                        'email': request.user.email
                    }
                } for item in queryset],
                'count': queryset.count(),
                'current': 1,
                'next': None,
                'previous': None,
                'total_pages': 1
            })
        except Exception as e:
            logger.error(f"Error in list dashboards: {str(e)}")
            return Response({
                'results': [],
                'count': 0,
                'current': 1,
                'next': None,
                'previous': None,
                'total_pages': 1
            })

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            analytic = CryptoAnalytic.objects.create(
                team_id=request.user.current_team_id,
                name=data.get('name', ''),
                description=data.get('description', ''),
                filters=data.get('filters', {})
            )
            
            return Response({
                'id': analytic.id,
                'name': analytic.name,
                'description': analytic.description,
                'created_at': analytic.created_at.isoformat(),
                'created_by': {
                    'id': request.user.id,
                    'uuid': str(request.user.uuid),
                    'distinct_id': request.user.distinct_id,
                    'first_name': request.user.first_name,
                    'email': request.user.email
                },
                'pinned': False,
                'filters': analytic.filters,
                'creation_mode': 'default',
                'restriction_level': 0
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating dashboard: {str(e)}")
            return Response(
                {'detail': 'Could not create dashboard'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def retrieve(self, request, pk=None):
        try:
            item = self.get_queryset().get(pk=pk)
            data = {
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'created_at': item.created_at,
                'filters': item.filters,
                'created_by': request.user.id,
                'last_modified_at': item.last_modified_at,
                'last_modified_by': request.user.id,
            }
            return Response(data)
        except CryptoAnalytic.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
