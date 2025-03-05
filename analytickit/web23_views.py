from django.http import JsonResponse
from datetime import datetime
from django.utils.timezone import now

def simple_web23_view(request, team_id=None):
    """
    A simple view function for Web23 funnel data.
    """
    from analytickit.api.web23.wallet_queries import UserFunnelAnalysis
    
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
            team_id=int(team_id) if team_id else 1,
            from_timestamp=from_date,
            days=days
        )
        
        # Generate funnel data
        funnel_data = funnel.generate_funnel_data()
        
        return JsonResponse(funnel_data)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500) 