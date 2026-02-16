import json
import logging
from typing import Any, Dict

from analytickit.agent.constants import MAX_TOKENS_INPUT, TOKEN_ENCODING

logger = logging.getLogger(__name__)

try:
    import tiktoken
except ImportError:
    tiktoken = None
    logger.warning("tiktoken not installed. Token counting will use approximation.")


class TokenManager:
    """Manages token budget for OpenAI API calls."""

    def __init__(self, max_tokens: int = MAX_TOKENS_INPUT):
        self.max_tokens = max_tokens
        if tiktoken:
            self._encoding = tiktoken.get_encoding(TOKEN_ENCODING)
        else:
            self._encoding = None

    def count_tokens(self, text: str) -> int:
        if self._encoding:
            return len(self._encoding.encode(text))
        # Fallback approximation: ~4 chars per token
        return len(text) // 4

    def fit_to_budget(self, summary: Dict[str, Any], max_tokens: int = None) -> Dict[str, Any]:
        """Trim summary to fit within token budget using progressive reduction."""
        budget = max_tokens or self.max_tokens
        text = json.dumps(summary, default=str)
        current_tokens = self.count_tokens(text)

        if current_tokens <= budget:
            return summary

        result = dict(summary)

        # Step 1: Reduce top_pages to top 5
        if "web2_summary" in result and "top_pages" in result.get("web2_summary", {}):
            result["web2_summary"]["top_pages"] = result["web2_summary"]["top_pages"][:5]
            text = json.dumps(result, default=str)
            if self.count_tokens(text) <= budget:
                return result

        # Step 2: Reduce traffic_sources to top 5
        if "web2_summary" in result and "traffic_sources" in result.get("web2_summary", {}):
            result["web2_summary"]["traffic_sources"] = result["web2_summary"]["traffic_sources"][:5]
            text = json.dumps(result, default=str)
            if self.count_tokens(text) <= budget:
                return result

        # Step 3: Reduce wallet_segments to counts only
        if "web3_summary" in result and "wallet_segments" in result.get("web3_summary", {}):
            segments = result["web3_summary"]["wallet_segments"]
            result["web3_summary"]["wallet_segments"] = {
                k: len(v) if isinstance(v, list) else v for k, v in segments.items()
            }
            text = json.dumps(result, default=str)
            if self.count_tokens(text) <= budget:
                return result

        # Step 4: Remove rolling_30d, keep rolling_7d
        if "rolling_30d_summary" in result:
            result.pop("rolling_30d_summary", None)
            text = json.dumps(result, default=str)
            if self.count_tokens(text) <= budget:
                return result

        # Step 5: Trim geo_distribution
        if "web2_summary" in result and "geo_distribution" in result.get("web2_summary", {}):
            result["web2_summary"]["geo_distribution"] = result["web2_summary"]["geo_distribution"][:3]

        logger.info(
            "Summary trimmed from %d to %d tokens for team",
            current_tokens,
            self.count_tokens(json.dumps(result, default=str)),
        )
        return result
