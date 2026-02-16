from django.contrib import admin

from analytickit.agent.models import AggregationSnapshot, Recommendation


@admin.register(AggregationSnapshot)
class AggregationSnapshotAdmin(admin.ModelAdmin):
    list_display = ("team", "date", "token_count", "created_at")
    list_filter = ("date",)
    readonly_fields = ("created_at",)


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ("team", "date", "category", "severity", "title", "is_acted_on")
    list_filter = ("date", "category", "severity", "is_acted_on")
    readonly_fields = ("created_at",)
