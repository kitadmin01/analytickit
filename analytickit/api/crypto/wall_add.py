from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from analytickit.crypto.wallet_address_metric import WalletAddressMetricCal
from analytickit.models.crypto.wallet_address import VisitorWalletAddress
from rest_framework import serializers



'''
If I use VisitorWallatAddressViewSet(viewsets.ViewSet), it is not working. I need to use
viewsets.ModelViewSet and create VisitorWalletAddressSerializer unnecessarily to make it work. If not
I keep getting  /api/wallet-address/8/ Not found. Fix it later.
'''


class VisitorWalletAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorWalletAddress
        fields = [
            'id',
            'visitor_wallet_address',
            'visitor_wallet_address_ts',
            'creation_ts',
            'update_ts',
            'community_engagement',
            'team',
            'txn_data',
            'token_transfer_data'
        ]
        read_only_fields = ['id', 'creation_ts', 'update_ts']



class VisitorWallatAddressModelViewSet(viewsets.ModelViewSet):
    queryset = VisitorWalletAddress.objects.all() 
    serializer_class = VisitorWalletAddressSerializer


    def list(self, request, *args, **kwargs):
        '''
        This method is called by default when /api/wallet-address-metrics is called from UI due to ModelViewSet
        So this method calls get_metrics when team_id is passed on the parameter due route issue in urls.py and __init__.py
        '''
        team_id = request.query_params.get('team_id')
        if team_id:
            return self.get_metrics(request)
        else:
            return Response({"message": "Please specify a team_id to view metrics."})


    def get_metrics(self, request):
        team_id = request.query_params.get('team_id')
        if not team_id:
            return Response({"error": "Team ID is required"}, status=400)

        metric_calculator = WalletAddressMetricCal(team_id)
        metrics = {
            "transaction_volume_and_value": metric_calculator.calculate_transaction_volume_and_value(),
            "token_holdings_and_transfers": metric_calculator.calculate_token_holdings_and_transfers(),
            "gas_usage_and_costs": metric_calculator.calculate_gas_usage_and_costs(),
            "active_periods": metric_calculator.calculate_active_periods(),
            "smart_contract_interactions": metric_calculator.calculate_smart_contract_interactions(),
            "nft_transactions": metric_calculator.calculate_nft_transactions(),
            "network_analysis": metric_calculator.calculate_network_analysis(),
            "historical_trends": metric_calculator.calculate_historical_trends(),
            "cross_contract_analysis": metric_calculator.calculate_cross_contract_analysis(),
            "whale_tracking": metric_calculator.track_whales(threshold_value=1000000),  # Example threshold
            "token_diversity": metric_calculator.calculate_token_diversity()
        }
        return Response({'data': metrics})

# Add this viewset to your Django URLs configuration


