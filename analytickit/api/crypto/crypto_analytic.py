from rest_framework import viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from analytickit.models.crypto.crypto_analytic import CryptoAnalytic
from analytickit.models.crypto.comm_eng import CampaignAnalytic

class CryptoAnalyticSerializer(serializers.ModelSerializer):
    class Meta:
        model = CryptoAnalytic
        fields = [
            'id',
            'team_id',
            'name',
            'description',
            'creation_ts',
            'update_ts',
            # Add other fields from your model
        ]
        read_only_fields = ['id', 'creation_ts', 'update_ts']

class CryptoAnalyticViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        analytics = CryptoAnalytic.objects.filter(
            team_id=request.user.current_team_id
        ).order_by('-creation_ts')
        serializer = CryptoAnalyticSerializer(analytics, many=True)
        return Response(serializer.data)

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