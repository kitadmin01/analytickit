from django.test import TestCase

from analytickit.agent.services.token_manager import TokenManager


class TestTokenManager(TestCase):
    def setUp(self):
        self.tm = TokenManager(max_tokens=500)

    def test_count_tokens_returns_positive(self):
        count = self.tm.count_tokens("Hello world, this is a test.")
        self.assertGreater(count, 0)

    def test_count_tokens_empty_string(self):
        count = self.tm.count_tokens("")
        self.assertEqual(count, 0)

    def test_fit_to_budget_no_trimming_needed(self):
        summary = {"web2_summary": {"unique_visitors": 10}}
        result = self.tm.fit_to_budget(summary, max_tokens=10000)
        self.assertEqual(result, summary)

    def test_fit_to_budget_trims_top_pages(self):
        pages = [{"path": f"/page-{i}", "views": 100 - i, "unique": 50 - i} for i in range(20)]
        summary = {
            "web2_summary": {"top_pages": pages, "traffic_sources": []},
            "web3_summary": {},
        }
        result = self.tm.fit_to_budget(summary, max_tokens=200)
        self.assertLessEqual(len(result.get("web2_summary", {}).get("top_pages", [])), 5)

    def test_fit_to_budget_removes_rolling_30d(self):
        summary = {
            "web2_summary": {
                "top_pages": [{"path": f"/p{i}", "views": i} for i in range(20)],
                "traffic_sources": [{"source": f"s{i}"} for i in range(20)],
                "geo_distribution": [],
            },
            "web3_summary": {"wallet_segments": {"whales": ["0x" + "a" * 40] * 50, "regular": [], "micro": []}},
            "rolling_7d_summary": {"days": 7},
            "rolling_30d_summary": {"days": 30, "data": "x" * 500},
        }
        result = self.tm.fit_to_budget(summary, max_tokens=150)
        self.assertNotIn("rolling_30d_summary", result)
