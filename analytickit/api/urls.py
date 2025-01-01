from django.urls import path
from .endpoints import (
    AnnotationsViewSet,
    BillingViewSet,
    PluginsViewSet,
    PluginConfigsViewSet,
)

urlpatterns = [
    path('api/annotations/', AnnotationsViewSet.as_view({'get': 'list'})),
    path('api/billing/@current/', BillingViewSet.as_view({'get': 'retrieve'})),
    path('api/plugins/', PluginsViewSet.as_view({'get': 'list'})),
    path('api/plugin_configs/', PluginConfigsViewSet.as_view({'get': 'list'})),
] 