import json
from datetime import date
from typing import Any, Dict, List, Optional

from analytickit.agent.constants import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE


class PromptBuilder:
    """Constructs prompts for the OpenAI API from aggregated data."""

    def build_system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def build_user_prompt(
        self,
        target_date: date,
        web2_summary: Dict[str, Any],
        web3_summary: Dict[str, Any],
        cross_linked_summary: Dict[str, Any],
        rolling_7d_summary: Optional[Dict[str, Any]] = None,
        previous_recommendations: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        prev_recs_text = "None"
        if previous_recommendations:
            prev_recs_text = json.dumps(
                [
                    {"title": r.get("title", ""), "category": r.get("category", "")}
                    for r in previous_recommendations[:5]
                ],
                indent=2,
            )

        return USER_PROMPT_TEMPLATE.format(
            date=target_date.isoformat(),
            web2_summary=json.dumps(web2_summary, indent=2, default=str),
            web3_summary=json.dumps(web3_summary, indent=2, default=str),
            cross_linked_summary=json.dumps(cross_linked_summary, indent=2, default=str),
            rolling_7d_summary=(
                json.dumps(rolling_7d_summary, indent=2, default=str)
                if rolling_7d_summary
                else "No historical data available yet."
            ),
            previous_recommendations=prev_recs_text,
        )
