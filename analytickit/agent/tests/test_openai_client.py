import json
from unittest.mock import MagicMock, patch

from django.test import TestCase

from analytickit.agent.services.openai_client import OpenAIClient


class TestOpenAIClient(TestCase):
    def setUp(self):
        self.client = OpenAIClient(model="gpt-4o-mini", api_key="test-key")

    def test_parse_response_valid(self):
        content = json.dumps(
            {
                "recommendations": [
                    {
                        "category": "engagement",
                        "severity": "warning",
                        "title": "Test recommendation",
                        "detail": "Detail here",
                        "suggested_action": "Do something",
                        "metric_references": ["wallet_login_rate"],
                    }
                ]
            }
        )
        result = self.client._parse_response(content)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["category"], "engagement")

    def test_parse_response_invalid_json(self):
        result = self.client._parse_response("not json {{{")
        self.assertEqual(result, [])

    def test_parse_response_missing_fields(self):
        content = json.dumps(
            {
                "recommendations": [
                    {"category": "engagement", "title": "Missing fields"},
                ]
            }
        )
        result = self.client._parse_response(content)
        self.assertEqual(len(result), 0)

    def test_parse_response_empty_recommendations(self):
        content = json.dumps({"recommendations": []})
        result = self.client._parse_response(content)
        self.assertEqual(result, [])

    def test_parse_response_not_a_list(self):
        content = json.dumps({"recommendations": "not a list"})
        result = self.client._parse_response(content)
        self.assertEqual(result, [])

    @patch("analytickit.agent.services.openai_client.openai")
    def test_generate_recommendations_success(self, mock_openai_module):
        mock_client = MagicMock()
        self.client.client = mock_client

        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content=json.dumps(
                        {
                            "recommendations": [
                                {
                                    "category": "engagement",
                                    "severity": "info",
                                    "title": "Test",
                                    "detail": "Detail",
                                    "suggested_action": "Action",
                                    "metric_references": [],
                                }
                            ]
                        }
                    )
                )
            )
        ]
        mock_response.usage = MagicMock(total_tokens=500)
        mock_client.chat.completions.create.return_value = mock_response

        recs, tokens = self.client.generate_recommendations("system", "user")
        self.assertEqual(len(recs), 1)
        self.assertEqual(tokens, 500)

    def test_generate_recommendations_no_client(self):
        client = OpenAIClient(api_key="")
        client.client = None
        with self.assertRaises(RuntimeError):
            client.generate_recommendations("system", "user")

    def test_parse_multiple_recommendations(self):
        content = json.dumps(
            {
                "recommendations": [
                    {
                        "category": "engagement",
                        "severity": "warning",
                        "title": "Rec 1",
                        "detail": "d1",
                        "suggested_action": "a1",
                    },
                    {
                        "category": "transaction",
                        "severity": "action_required",
                        "title": "Rec 2",
                        "detail": "d2",
                        "suggested_action": "a2",
                    },
                    {"incomplete": True},  # Should be skipped
                ]
            }
        )
        result = self.client._parse_response(content)
        self.assertEqual(len(result), 2)
