from datetime import date

from django.test import TestCase

from analytickit.agent.models import AggregationSnapshot, Recommendation
from analytickit.models import Organization, Team


class TestAggregationSnapshot(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.team = Team.objects.create(organization=self.org, name="Test Team")

    def test_create_snapshot(self):
        snap = AggregationSnapshot.objects.create(
            team=self.team,
            date=date(2025, 2, 1),
            web2_summary={"unique_visitors": 100},
            web3_summary={"unique_wallets_active": 5},
            cross_linked_summary={"wallets_with_both_web2_and_web3": 1},
            token_count=500,
        )
        self.assertEqual(snap.team, self.team)
        self.assertEqual(snap.date, date(2025, 2, 1))
        self.assertEqual(snap.web2_summary["unique_visitors"], 100)

    def test_unique_together_constraint(self):
        AggregationSnapshot.objects.create(
            team=self.team,
            date=date(2025, 2, 1),
            web2_summary={},
            web3_summary={},
            cross_linked_summary={},
        )
        with self.assertRaises(Exception):
            AggregationSnapshot.objects.create(
                team=self.team,
                date=date(2025, 2, 1),
                web2_summary={},
                web3_summary={},
                cross_linked_summary={},
            )


class TestRecommendation(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.team = Team.objects.create(organization=self.org, name="Test Team")

    def test_create_recommendation(self):
        rec = Recommendation.objects.create(
            team=self.team,
            date=date(2025, 2, 1),
            category="engagement",
            severity="warning",
            title="Wallet login rate dropped 15%",
            detail="Compared to 7-day average...",
            suggested_action="Review Bing campaign targeting",
            metric_references=["wallet_login_rate", "traffic_sources"],
            openai_model="gpt-4o-mini",
            openai_tokens_used=150,
        )
        self.assertEqual(str(rec), "[warning] Wallet login rate dropped 15%")
        self.assertFalse(rec.is_acted_on)
        self.assertIsNone(rec.acted_on_at)

    def test_category_choices(self):
        self.assertIn("engagement", [c.value for c in Recommendation.Category])
        self.assertIn("anomaly", [c.value for c in Recommendation.Category])

    def test_severity_choices(self):
        self.assertIn("info", [c.value for c in Recommendation.Severity])
        self.assertIn("action_required", [c.value for c in Recommendation.Severity])

    def test_ordering(self):
        Recommendation.objects.create(
            team=self.team,
            date=date(2025, 2, 1),
            category="engagement",
            severity="info",
            title="Info rec",
            detail="",
            suggested_action="",
            openai_model="gpt-4o-mini",
        )
        Recommendation.objects.create(
            team=self.team,
            date=date(2025, 2, 2),
            category="engagement",
            severity="action_required",
            title="Action rec",
            detail="",
            suggested_action="",
            openai_model="gpt-4o-mini",
        )
        recs = list(Recommendation.objects.all())
        self.assertEqual(recs[0].date, date(2025, 2, 2))
