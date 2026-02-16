from datetime import date

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from analytickit.agent.models import AggregationSnapshot, Recommendation
from analytickit.agent.serializers import AggregationSnapshotSerializer, RecommendationSerializer


class RecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        team = self.request.user.team
        if not team:
            return Recommendation.objects.none()
        qs = Recommendation.objects.filter(team=team)

        filter_date = self.request.query_params.get("date")
        if filter_date:
            qs = qs.filter(date=filter_date)

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        return qs

    @action(detail=False, methods=["get"])
    def latest(self, request):
        team = request.user.team
        if not team:
            return Response({"error": "No team found"}, status=status.HTTP_400_BAD_REQUEST)

        latest_date = Recommendation.objects.filter(team=team).values_list("date", flat=True).order_by("-date").first()
        if not latest_date:
            return Response({"results": []})

        qs = Recommendation.objects.filter(team=team, date=latest_date)
        serializer = self.get_serializer(qs, many=True)
        return Response({"results": serializer.data, "date": latest_date})

    @action(detail=True, methods=["post"])
    def acted(self, request, pk=None):
        team = request.user.team
        if not team:
            return Response({"error": "No team found"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rec = Recommendation.objects.get(pk=pk, team=team)
        except Recommendation.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        rec.is_acted_on = True
        rec.acted_on_at = timezone.now()
        rec.save(update_fields=["is_acted_on", "acted_on_at"])
        serializer = self.get_serializer(rec)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        team = request.user.team
        if not team:
            return Response({"error": "No team found"}, status=status.HTTP_400_BAD_REQUEST)

        today = date.today()
        last_7_days = Recommendation.objects.filter(
            team=team,
            date__gte=(
                today.replace(day=today.day - 7) if today.day > 7 else today.replace(month=today.month - 1, day=28)
            ),
        )
        return Response(
            {
                "total": last_7_days.count(),
                "by_category": {
                    cat.value: last_7_days.filter(category=cat.value).count() for cat in Recommendation.Category
                },
                "by_severity": {
                    sev.value: last_7_days.filter(severity=sev.value).count() for sev in Recommendation.Severity
                },
                "acted_on": last_7_days.filter(is_acted_on=True).count(),
            }
        )

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Manually trigger recommendation generation (rate limited)."""
        team = request.user.team
        if not team:
            return Response({"error": "No team found"}, status=status.HTTP_400_BAD_REQUEST)

        from analytickit.agent.tasks import generate_daily_recommendations

        generate_daily_recommendations.delay(team.id)
        return Response({"status": "queued", "message": "Recommendation generation has been queued."})


class AggregationSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AggregationSnapshotSerializer

    def get_queryset(self):
        team = self.request.user.team
        if not team:
            return AggregationSnapshot.objects.none()

        qs = AggregationSnapshot.objects.filter(team=team)

        filter_date = self.request.query_params.get("date")
        if filter_date:
            qs = qs.filter(date=filter_date)

        return qs
