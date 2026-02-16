import json
import logging
import os
import time
from typing import Any, Dict, List, Tuple

from analytickit.agent.constants import DAILY_MODEL, MAX_RETRIES, MAX_TOKENS_OUTPUT, RETRY_DELAYS

logger = logging.getLogger(__name__)

try:
    import openai
except ImportError:
    openai = None
    logger.warning("openai package not installed.")


class OpenAIClient:
    """Wrapper for OpenAI API calls with retry logic and error handling."""

    def __init__(self, model: str = None, api_key: str = None):
        self.model = model or DAILY_MODEL
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
        if openai and self.api_key:
            self.client = openai.OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def generate_recommendations(self, system_prompt: str, user_prompt: str) -> Tuple[List[Dict[str, Any]], int]:
        """
        Call OpenAI and return parsed recommendations and tokens used.

        Returns:
            Tuple of (list of recommendation dicts, total tokens used)
        """
        if not self.client:
            raise RuntimeError("OpenAI client not configured. Set OPENAI_API_KEY env var.")

        response = self._call_with_retry(system_prompt, user_prompt)
        content = response.choices[0].message.content
        tokens_used = response.usage.total_tokens if response.usage else 0

        recommendations = self._parse_response(content)
        return recommendations, tokens_used

    def _call_with_retry(self, system_prompt: str, user_prompt: str):
        last_exc = None
        for attempt in range(MAX_RETRIES):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    max_tokens=MAX_TOKENS_OUTPUT,
                    temperature=0.7,
                    response_format={"type": "json_object"},
                )
                return response
            except Exception as e:
                last_exc = e
                error_name = type(e).__name__
                if "RateLimitError" in error_name or "APITimeoutError" in error_name:
                    delay = RETRY_DELAYS[attempt] if attempt < len(RETRY_DELAYS) else RETRY_DELAYS[-1]
                    logger.warning(
                        "OpenAI %s on attempt %d, retrying in %ds: %s",
                        error_name,
                        attempt + 1,
                        delay,
                        e,
                    )
                    time.sleep(delay)
                else:
                    logger.error("OpenAI error on attempt %d: %s", attempt + 1, e)
                    raise

        raise last_exc

    def _parse_response(self, content: str) -> List[Dict[str, Any]]:
        """Parse the JSON response from OpenAI into recommendation dicts."""
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error("Failed to parse OpenAI response as JSON: %s", e)
            return []

        recommendations = data.get("recommendations", [])
        if not isinstance(recommendations, list):
            logger.error("OpenAI response 'recommendations' is not a list")
            return []

        valid = []
        for rec in recommendations:
            if not isinstance(rec, dict):
                continue
            if all(k in rec for k in ("category", "severity", "title", "detail", "suggested_action")):
                valid.append(rec)
            else:
                logger.warning("Skipping recommendation with missing fields: %s", rec.keys())

        return valid
