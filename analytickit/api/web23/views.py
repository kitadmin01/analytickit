from typing import Any
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from analytickit.api.web23.wallet_queries import UserFunnelAnalysis
from analytickit.models import Team


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def funnel_data(request, team_id):
    """
    Get Web2 to Web3 funnel analysis data for the specified team.
    """
    try:
        # Parse query parameters
        from_date_str = request.GET.get('from_date')
        days = int(request.GET.get('days', 30))
        
        # Parse from_date or use current date
        if from_date_str:
            from_date = datetime.strptime(from_date_str, '%Y-%m-%d')
        else:
            from_date = now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Create funnel analysis instance
        funnel = UserFunnelAnalysis(
            team_id=int(team_id),
            from_timestamp=from_date,
            days=days
        )
        
        # Generate funnel data
        funnel_data = funnel.generate_funnel_data()
        
        return Response(funnel_data)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class Web23FunnelViewSet(ViewSet):
    """
    ViewSet for Web2 to Web3 funnel analysis data.
    """
    permission_classes = [IsAuthenticated]

    def get_funnel_data(self, request, team_id=None):
        """
        Get Web2 to Web3 funnel analysis data for the specified team.
        """
        try:
            # Get team_id from URL parameter or query parameter
            if team_id is None:
                team_id = request.query_params.get('team_id')
            
            # If team_id is still None, use the user's current team
            if team_id is None:
                if request.user.team is None:
                    return Response(
                        {"error": "You don't have an active team. Please create one first."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                team_id = request.user.team.id
            else:
                # Convert team_id to integer for comparison
                team_id = int(team_id)
                
                # Check if the requested team_id matches the user's team_id
                if request.user.team is None or team_id != request.user.team.id:
                    return Response(
                        {"error": "No funnel data available for this team."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Parse query parameters
            from_date_str = request.GET.get('from_date')
            days = int(request.GET.get('days', 30))
            
            # Parse from_date or use current date
            if from_date_str:
                from_date = datetime.strptime(from_date_str, '%Y-%m-%d')
            else:
                from_date = now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Create funnel analysis instance
            funnel = UserFunnelAnalysis(
                team_id=int(team_id),
                from_timestamp=from_date,
                days=days
            )
            
            # Generate funnel data
            funnel_data = funnel.generate_funnel_data()
            
            return Response(funnel_data)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def list(self, request):
        """
        List all Web2 to Web3 funnel analysis data.
        """
        return self.get_funnel_data(request)
    
    def retrieve(self, request, pk=None):
        """
        Retrieve Web2 to Web3 funnel analysis data for a specific team.
        """
        return self.get_funnel_data(request, team_id=pk)


@api_view(['GET'])
def test_endpoint(request):
    """
    Simple test endpoint to verify URL routing.
    """
    return Response({"status": "ok", "message": "Test endpoint is working"}) 