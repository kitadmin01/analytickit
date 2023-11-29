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
from rest_framework.response import Response




from analytickit.models.crypto.comm_eng import CommunityEngagement
from analytickit.models.crypto.comm_eng import CampaignAnalytic



class CommunityEngagementSerializer(serializers.ModelSerializer):

    class Meta:
        model = CommunityEngagement
        fields = [
            "id",
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
        # get the current_team_id of the user
        team_id = request.user.current_team_id
              
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            # Manually set the team after validating the serializer
            instance = serializer.save(team_id=team_id)
            return response.Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)
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
    def analytic(self, request, pk=None):
        engagement = self.get_object()
        # Use the reverse relation to get associated CampaignAnalytic objects
        campaign_analytics = engagement.campaignanalytic_set.all()
        serializer = CampaignAnalyticSerializer(campaign_analytics, many=True)
        return response.Response(serializer.data)

    @action(detail=False, methods=['GET'], url_path='check-eligibility')
    def check_eligibility(self, request):
        team_id = request.query_params.get('team_id')
        if not team_id:
            return Response({"error": "team_id parameter is required"}, status=400)
        
        is_eligible = CommunityEngagement.is_engagement_eligible_for_team(team_id)
        return Response({"is_eligible": is_eligible})
    
    def destroy(self, request, *args, **kwargs):
        """
        Deletes a CommunityEngagement instance.
        """
        instance = get_object_or_404(self.get_queryset(), pk=kwargs.get('pk'))
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        """
        Perform the destruction of the instance.
        """
        instance.delete()