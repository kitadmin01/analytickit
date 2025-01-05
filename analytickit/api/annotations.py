from rest_framework import viewsets
from rest_framework.response import Response

class AnnotationsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({'results': []}) 