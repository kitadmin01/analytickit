from rest_framework import viewsets
from rest_framework.response import Response

class BillingViewSet(viewsets.ViewSet):
    def retrieve(self, request):
        return Response({'results': []})

class PluginsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({'results': []})

class PluginConfigsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({'results': []}) 