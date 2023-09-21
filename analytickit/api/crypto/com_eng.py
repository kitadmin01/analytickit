"""
Created on Aug 25 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""

from django.shortcuts import get_object_or_404
from rest_framework import response, serializers, status, viewsets
from rest_framework.permissions import IsAuthenticated

from analytickit.models.crypto.comm_eng import CommunityEngagement


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
            "date",
            "contract_address",
            "active_users",
            "total_contract_calls",
            "average_gas_used",
            "function_calls_count",
            "tot_tokens_transferred",
            "referral_count",
            "last_modified",
            "tot_txns",
            "ave_gas_used",
        ]


class CommunityEngagementViewSet(viewsets.ModelViewSet):
    queryset = CommunityEngagement.objects.all()
    serializer_class = CommunityEngagementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # You can add filters here if needed
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        serializer = CommunityEngagementSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = CommunityEngagementSerializer(instance, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs["pk"]
        engagement = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = CommunityEngagementSerializer(engagement, context={"request": request})
        return response.Response(serializer.data)
