from datetime import date

from django.test import TestCase
from rest_framework.test import APIClient

from analytickit.agent.models import AggregationSnapshot, Recommendation
from analytickit.models import Organization, Team, User


class TestRecommendationAPI(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.team = Team.objects.create(organization=self.org, name="Test Team")
        self.user = User.objects.create_user(
            email="test@test.com",
            password="testpass123",
        )
        self.user.join(organization=self.org, level=1)
        self.user.current_team = self.team
        self.user.save()

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.rec = Recommendation.objects.create(
            team=self.team,
            date=date(2025, 2, 1),
            category="engagement",
            severity="warning",
            title="Wallet login rate dropped 15%",
            detail="Compared to 7-day average...",
            suggested_action="Review Bing campaign targeting",
            metric_references=["wallet_login_rate"],
            openai_model="gpt-4o-mini",
            openai_tokens_used=150,
        )

    def test_list_recommendations(self):
        response = self.client.get("/api/recommendations/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 1)

    def test_filter_by_date(self):
        response = self.client.get("/api/recommendations/?date=2025-02-01")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 1)

        response = self.client.get("/api/recommendations/?date=2025-02-02")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_filter_by_category(self):
        response = self.client.get("/api/recommendations/?category=engagement")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 1)

        response = self.client.get("/api/recommendations/?category=campaign")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_latest_recommendations(self):
        response = self.client.get("/api/recommendations/latest/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("results", data)
        self.assertEqual(len(data["results"]), 1)

    def test_mark_as_acted(self):
        response = self.client.post(f"/api/recommendations/{self.rec.id}/acted/")
        self.assertEqual(response.status_code, 200)
        self.rec.refresh_from_db()
        self.assertTrue(self.rec.is_acted_on)
        self.assertIsNotNone(self.rec.acted_on_at)

    def test_recommendations_scoped_to_team(self):
        other_org = Organization.objects.create(name="Other Org")
        other_team = Team.objects.create(organization=other_org, name="Other Team")
        Recommendation.objects.create(
            team=other_team,
            date=date(2025, 2, 1),
            category="engagement",
            severity="info",
            title="Other team rec",
            detail="",
            suggested_action="",
            openai_model="gpt-4o-mini",
        )
        response = self.client.get("/api/recommendations/")
        self.assertEqual(len(response.json()["results"]), 1)  # Only own team's rec


class TestAggregationSnapshotAPI(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.team = Team.objects.create(organization=self.org, name="Test Team")
        self.user = User.objects.create_user(
            email="test2@test.com",
            password="testpass123",
        )
        self.user.join(organization=self.org, level=1)
        self.user.current_team = self.team
        self.user.save()

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.snapshot = AggregationSnapshot.objects.create(
            team=self.team,
            date=date(2025, 2, 1),
            web2_summary={"unique_visitors": 100},
            web3_summary={"unique_wallets_active": 5},
            cross_linked_summary={"wallets_with_both_web2_and_web3": 1},
            token_count=500,
        )

    def test_list_snapshots(self):
        response = self.client.get("/api/aggregation-snapshots/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 1)
