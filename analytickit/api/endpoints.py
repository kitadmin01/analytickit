from rest_framework import viewsets
from rest_framework.response import Response

class AnnotationsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({'results': []})

class BillingViewSet(viewsets.ViewSet):
    def retrieve(self, request):
        return Response({
            'results': [],
            'available_features': [],
            'plan': {'name': 'Free'},
        })

class PluginsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({'results': []})

class PluginConfigsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({'results': []})

class VersionViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({
            'version': '1.0.0',
            'latest': True
        }) 