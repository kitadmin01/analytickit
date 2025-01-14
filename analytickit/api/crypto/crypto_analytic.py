from rest_framework import viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from django.utils.timezone import now
from typing import Dict, Any
from analytickit.models.crypto.crypto_analytic import CryptoAnalytic
from analytickit.models.crypto.comm_eng import CampaignAnalytic
from analytickit.api.shared import UserBasicSerializer
from analytickit.models import Team

class CryptoAnalyticSerializer(serializers.ModelSerializer):
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
            "dashboard",
            "dive_dashboard",
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
        return super().update(instance, validated_data)

    def get_result(self, crypto_analytic: CryptoAnalytic):
        if not crypto_analytic.filters:
            return None
        return None

    def get_last_refresh(self, crypto_analytic: CryptoAnalytic):
        return crypto_analytic.last_refresh

    def get_effective_privilege_level(self, crypto_analytic: CryptoAnalytic):
        return None
    
    def validate_filters(self, value):
        expected_filters = {
            "token_type": {
                "type": "string",
                "required": False,
                "allowed_values": [
                    "Active",
                    "Inactive",
                    "ERC20",
                    "ERC721",
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
        return value

class CryptoAnalyticViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CryptoAnalyticSerializer
    renderer_classes = [JSONRenderer]
    
    def get_queryset(self):
        return CryptoAnalytic.objects.filter(
            team_id=self.request.user.current_team_id
        ).order_by('-created_at')

    @action(detail=False, methods=['GET'], url_path='type/active_users')
    def get_active_users(self, request):
        try:
            analytics = CampaignAnalytic.objects.filter(
                community_engagement__team_id=request.user.current_team_id
            ).order_by('creation_ts')
            
            return Response({
                'results': list(analytics.values('creation_ts', 'active_users'))
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_graph_data(self, request):
        campaign_id = request.query_params.get('campaign_id', 2)
        analytics = CampaignAnalytic.objects.filter(
            community_engagement_id=campaign_id
        ).order_by('creation_ts')
        
        return Response({
            'data': list(analytics.values('creation_ts', 'active_users'))
        }) 