from datetime import date

from django.test import TestCase

from analytickit.agent.models import AggregationSnapshot, Recommendation
from analytickit.agent.serializers import AggregationSnapshotSerializer, RecommendationSerializer
from analytickit.models import Organization, Team


class TestRecommendationSerializer(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.team = Team.objects.create(organization=self.org, name="Test Team")
        self.rec = Recommendation.objects.create(
            team=self.team,
            date=date(2025, 2, 1),
            category="engagement",
            severity="warning",
            title="Test rec",
            detail="Detail",
            suggested_action="Action",
            metric_references=["metric1"],
            openai_model="gpt-4o-mini",
            openai_tokens_used=100,
        )

    def test_serializes_all_fields(self):
        serializer = RecommendationSerializer(self.rec)
        data = serializer.data
        self.assertEqual(data["title"], "Test rec")
        self.assertEqual(data["category"], "engagement")
        self.assertEqual(data["severity"], "warning")
        self.assertIn("id", data)
        self.assertIn("created_at", data)

    def test_read_only_fields(self):
        serializer = RecommendationSerializer(
            self.rec,
            data={"title": "Changed", "category": "campaign"},
            partial=True,
        )
        self.assertTrue(serializer.is_valid())
        # title and category are read_only so should not change
        instance = serializer.save()
        self.assertEqual(instance.title, "Test rec")


class TestAggregationSnapshotSerializer(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.team = Team.objects.create(organization=self.org, name="Test Team")
        self.snap = AggregationSnapshot.objects.create(
            team=self.team,
            date=date(2025, 2, 1),
            web2_summary={"unique_visitors": 100},
            web3_summary={},
            cross_linked_summary={},
            token_count=500,
        )

    def test_serializes_all_fields(self):
        serializer = AggregationSnapshotSerializer(self.snap)
        data = serializer.data
        self.assertEqual(data["token_count"], 500)
        self.assertIn("web2_summary", data)
        self.assertIn("created_at", data)
