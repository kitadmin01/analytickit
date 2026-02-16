from datetime import date

from django.test import TestCase

from analytickit.agent.constants import SYSTEM_PROMPT
from analytickit.agent.services.prompt_builder import PromptBuilder


class TestPromptBuilder(TestCase):
    def setUp(self):
        self.builder = PromptBuilder()

    def test_system_prompt(self):
        prompt = self.builder.build_system_prompt()
        self.assertEqual(prompt, SYSTEM_PROMPT)
        self.assertIn("JSON", prompt)
        self.assertIn("recommendations", prompt)

    def test_user_prompt_basic(self):
        prompt = self.builder.build_user_prompt(
            target_date=date(2025, 2, 1),
            web2_summary={"unique_visitors": 100},
            web3_summary={"unique_wallets_active": 5},
            cross_linked_summary={"wallets_with_both_web2_and_web3": 1},
        )
        self.assertIn("2025-02-01", prompt)
        self.assertIn("100", prompt)
        self.assertIn("unique_wallets_active", prompt)

    def test_user_prompt_with_previous_recs(self):
        prompt = self.builder.build_user_prompt(
            target_date=date(2025, 2, 1),
            web2_summary={},
            web3_summary={},
            cross_linked_summary={},
            previous_recommendations=[
                {"title": "Fix campaign targeting", "category": "campaign"},
            ],
        )
        self.assertIn("Fix campaign targeting", prompt)

    def test_user_prompt_with_rolling_data(self):
        prompt = self.builder.build_user_prompt(
            target_date=date(2025, 2, 1),
            web2_summary={},
            web3_summary={},
            cross_linked_summary={},
            rolling_7d_summary={"avg_daily_visitors": 50},
        )
        self.assertIn("avg_daily_visitors", prompt)
