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
            from_date=from_date,
            days=days
        )
        
        # Generate funnel data
        funnel_data = funnel.get_funnel_data()
        
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
            
            # Parse query parameters
            from_date_str = request.query_params.get('from_date')
            days = int(request.query_params.get('days', 30))
            
            # Parse from_date or use current date
            if from_date_str:
                from_date = datetime.strptime(from_date_str, '%Y-%m-%d')
            else:
                from_date = now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Format from_date as string
            from_date_str = from_date.strftime('%Y-%m-%d')
            
            # Create funnel analysis instance
            funnel = UserFunnelAnalysis(
                team_id=int(team_id),
                from_date=from_date_str,
                days=days
            )
            
            # Generate funnel data
            funnel_data = funnel.get_funnel_data()
            
            return Response(funnel_data)
            
        except Exception as e:
            import traceback
            error_details = {
                "error": str(e),
                "traceback": traceback.format_exc()
            }
            return Response(
                error_details,
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def list(self, request):
        """
        List all Web2 to Web3 funnel analysis data.
        """
        return self.get_funnel_data(request)
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        Retrieve Web2 to Web3 funnel analysis data for a specific team.
        """
        team_id = pk
        return self.get_funnel_data(request, team_id=team_id)
        
    @action(detail=False, methods=['GET'], url_path='debug')
    def debug(self, request):
        """
        Debug endpoint to check available events for a team.
        """
        try:
            team_id = request.query_params.get('team_id')
            if not team_id:
                if request.user.team:
                    team_id = request.user.team.id
                else:
                    return Response({"error": "No team_id provided"}, status=400)
            
            from_date_str = request.query_params.get('from_date')
            days = int(request.query_params.get('days', 30))
            
            if from_date_str:
                from_date = datetime.strptime(from_date_str, '%Y-%m-%d')
            else:
                from_date = now().replace(hour=0, minute=0, second=0, microsecond=0)
                
            # Use the check_events_data function to get available events
            from analytickit.api.web23.wallet_queries import check_events_data
            events_data = check_events_data(int(team_id), from_date, days)
            
            return Response({
                "team_id": team_id,
                "from_date": from_date.strftime('%Y-%m-%d'),
                "days": days,
                "events_data": events_data
            })
            
        except Exception as e:
            import traceback
            return Response({
                "error": str(e),
                "traceback": traceback.format_exc()
            }, status=500)


@api_view(['GET'])
def test_endpoint(request):
    """
    Simple test endpoint to verify URL routing.
    """
    return Response({"status": "ok", "message": "Test endpoint is working"}) 