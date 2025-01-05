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
            "created_by",
            "created_at",
            "last_modified_at",
            "dashboard",
            "dive_dashboard",  # Add dive_dashboard here
        ]
        read_only_fields = ("short_id", "last_refresh")


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
    
    def validate_filters(self, value):
            """
            Validate the filters JSON to ensure it conforms to the expected structure and ranges.
            """
            expected_filters = {
                "token_type": {
                    "type": "string",
                    "required": False,
                    "allowed_values": [
                        "Active",
                        "Inactive",
                        "ERC20",
                        "ERC721",
                        # Add other token types as needed
                    ],
                },
                "active_users": {
                    "type": "integer",
                    "required": False,
                    "ranges": [
                        {"label": "Low Activity", "min": 0, "max": 1000},
                        {"label": "Medium Activity", "min": 1001, "max": 5000},
                        {"label": "High Activity", "min": 5001, "max": 10000},
                        {"label": "Very High Activity", "min": 10001, "max": None},
                    ],
                },
                # Define other filter categories similarly...
                # Example for ave_gas_used
                "ave_gas_used": {
                    "type": "integer",
                    "required": False,
                    "ranges": [
                        {"label": "Low Gas Usage", "min": 0, "max": 20000},
                        {"label": "Medium Gas Usage", "min": 20001, "max": 50000},
                        {"label": "High Gas Usage", "min": 50001, "max": 100000},
                        {"label": "Very High Gas Usage", "min": 100001, "max": None},
                    ],
                },
                # Add all other filter categories as per your requirements
            }

            for filter_key, filter_rules in expected_filters.items():
                if filter_key in value:
                    filter_value = value[filter_key]
                    if filter_rules["type"] == "string":
                        if filter_rules.get("allowed_values") and filter_value not in filter_rules["allowed_values"]:
                            raise serializers.ValidationError(
                                f"Invalid value for {filter_key}. Allowed values are: {filter_rules['allowed_values']}"
                            )
                    elif filter_rules["type"] == "integer":
                        if not isinstance(filter_value, int):
                            raise serializers.ValidationError(f"{filter_key} must be an integer.")
                        # Additional range validations can be implemented here if needed
            return value

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request else None
        validated_data["created_by"] = user
        validated_data["last_modified_by"] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        user = request.user if request else None
        instance.last_modified_by = user
        return super().update(instance, validated_data)


class CryptoAnalyticViewSet(viewsets.ViewSet):
    def get_queryset(self):
        return CryptoAnalytic.objects.filter(
            team_id=self.request.user.current_team_id
        )

    def create(self, request):
        data = request.data
        analytic = CryptoAnalytic.objects.create(
            team_id=request.user.current_team_id,
            title=data.get('title'),
            description=data.get('description'),
            metric_type=data.get('metric'),
            date_range=data.get('date_range'),
            day_range=data.get('day_range'),
            campaign_id=data.get('campaign_id', 2)  # Default to 2 for now
        )
        return Response({'id': analytic.id}, status=201)

    def get_graph_data(self, request):
        campaign_id = request.query_params.get('campaign_id', 2)
        # Get graph data from CampaignAnalytic
        analytics = CampaignAnalytic.objects.filter(
            community_engagement_id=campaign_id
        ).order_by('creation_ts')
        
        return Response({
            'data': list(analytics.values('creation_ts', 'active_users'))
        })


class CryptoDashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CryptoAnalytic
        fields = [
            'id',
            'name',
            'description',
            'filters',
            'created_at',
            'last_modified_at',
            'team_id',
            'created_by',
            'last_modified_by'
        ]
        read_only_fields = ['id', 'created_at', 'last_modified_at', 'team_id']


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
