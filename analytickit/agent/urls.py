from rest_framework.routers import DefaultRouter

from analytickit.agent.views import AggregationSnapshotViewSet, RecommendationViewSet

router = DefaultRouter()
router.register(r"recommendations", RecommendationViewSet, basename="recommendation")
router.register(r"aggregation-snapshots", AggregationSnapshotViewSet, basename="aggregation-snapshot")

urlpatterns = router.urls
