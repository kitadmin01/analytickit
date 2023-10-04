"""
Created on Aug 25 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""

from django.shortcuts import get_object_or_404
from rest_framework import response, serializers, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, filters, status, response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404





from analytickit.models.crypto.comm_eng import CommunityEngagement
from analytickit.models.crypto.comm_eng import CampaignAnalytic

class CommunityEngagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityEngagement
        fields = [
            "id",
            "team_id",
            "campaign_name",
            "token_address",
            "contract_type",
            "start_date",
            "end_date",
            "creation_ts",
            "update_ts",
            "contract_address"

        ]

class CampaignAnalyticSerializer(serializers.ModelSerializer):
    community_engagement = CommunityEngagementSerializer()

    class Meta:
        model = CampaignAnalytic
        fields = [
            "id",
            "community_engagement",
            "creation_ts",
            "update_ts",
            "active_users",
            "total_contract_calls",
            "function_calls_count",
            "tot_tokens_transferred",
            "referral_count",
            "last_modified",
            "tot_txns",
            "ave_gas_used",
            "transaction_value_distribution",
            "ave_txn_fee",
            "tot_txn_from_address",
            "tot_txn_to_address",
            "freq_txn",
            "token_transfer_volume",
            "token_transfer_value",
            "most_active_token_addresses",
            "ave_token_transfer_value",
            "token_flow",
            "token_transfer_value_distribution",
        ]

# Custom Pagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000

class CommunityEngagementViewSet(viewsets.ModelViewSet):
    queryset = CommunityEngagement.objects.all()
    serializer_class = CommunityEngagementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['campaign_name', 'token_address']
    ordering_fields = ['creation_ts', 'update_ts']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # You can add filters here if needed
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs["pk"]
        engagement = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(engagement, context={"request": request})
        return response.Response(serializer.data)

    # Custom action to retrieve CampaignAnalytic data for a specific CommunityEngagement instance
    @action(detail=True, methods=['get'])
    def campaign_analytic(self, request, pk=None):
        engagement = self.get_object()
        serializer = CampaignAnalyticSerializer(engagement.campaign_analytic, many=True)
        return response.Response(serializer.data)
