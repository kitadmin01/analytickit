from rest_framework import serializers

from analytickit.agent.models import AggregationSnapshot, Recommendation


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = [
            "id",
            "date",
            "category",
            "severity",
            "title",
            "detail",
            "suggested_action",
            "metric_references",
            "is_acted_on",
            "acted_on_at",
            "openai_model",
            "openai_tokens_used",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "date",
            "category",
            "severity",
            "title",
            "detail",
            "suggested_action",
            "metric_references",
            "openai_model",
            "openai_tokens_used",
            "created_at",
        ]


class AggregationSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AggregationSnapshot
        fields = [
            "id",
            "date",
            "web2_summary",
            "web3_summary",
            "cross_linked_summary",
            "rolling_7d_summary",
            "rolling_30d_summary",
            "token_count",
            "created_at",
        ]
        read_only_fields = fields
