import logging
from datetime import datetime, timezone

from celery import shared_task

from analytickit.agent.constants import (
    CIRCUIT_BREAKER_COOLDOWN_HOURS,
    CIRCUIT_BREAKER_THRESHOLD,
    DAILY_MODEL,
    MAX_RETRIES,
)

logger = logging.getLogger(__name__)

# In-memory circuit breaker state (per-worker)
_failure_counts = {}


@shared_task(bind=True, max_retries=MAX_RETRIES, default_retry_delay=300)
def generate_daily_recommendations(self, team_id: int, model: str = None):
    """Generate AI recommendations for a team. Runs daily via Celery Beat."""
    from django.core.cache import cache

    from analytickit.agent.models import Recommendation
    from analytickit.agent.services.aggregation import AggregationPipeline
    from analytickit.agent.services.openai_client import OpenAIClient
    from analytickit.agent.services.prompt_builder import PromptBuilder

    # Circuit breaker check
    circuit_key = f"agent_circuit_breaker_{team_id}"
    if cache.get(circuit_key):
        logger.warning("Circuit breaker active for team %s, skipping.", team_id)
        return

    try:
        now = datetime.now(timezone.utc)
        model = model or DAILY_MODEL

        # 1. Run aggregation pipeline
        pipeline = AggregationPipeline(team_id, now)
        snapshot = pipeline.run()

        # 2. Get previous recommendations for context
        prev_recs = list(
            Recommendation.objects.filter(team_id=team_id).order_by("-date")[:5].values("title", "category", "severity")
        )

        # 3. Build prompt
        builder = PromptBuilder()
        system_prompt = builder.build_system_prompt()
        user_prompt = builder.build_user_prompt(
            target_date=now.date(),
            web2_summary=snapshot.web2_summary,
            web3_summary=snapshot.web3_summary,
            cross_linked_summary=snapshot.cross_linked_summary,
            rolling_7d_summary=snapshot.rolling_7d_summary,
            previous_recommendations=prev_recs,
        )

        # 4. Call OpenAI
        client = OpenAIClient(model=model)
        recommendations, tokens_used = client.generate_recommendations(system_prompt, user_prompt)

        # 5. Save recommendations
        created = []
        for rec_data in recommendations:
            rec = Recommendation.objects.create(
                team_id=team_id,
                date=now.date(),
                category=rec_data.get("category", "engagement"),
                severity=rec_data.get("severity", "info"),
                title=rec_data.get("title", "")[:255],
                detail=rec_data.get("detail", ""),
                suggested_action=rec_data.get("suggested_action", ""),
                metric_references=rec_data.get("metric_references", []),
                openai_model=model,
                openai_tokens_used=tokens_used // max(len(recommendations), 1),
                snapshot=snapshot,
            )
            created.append(rec)

        # Reset failure count on success
        _failure_counts.pop(team_id, None)

        logger.info(
            "Generated %d recommendations for team %s using %d tokens (%s)",
            len(created),
            team_id,
            tokens_used,
            model,
        )

    except Exception as exc:
        # Track failures for circuit breaker
        _failure_counts[team_id] = _failure_counts.get(team_id, 0) + 1
        if _failure_counts[team_id] >= CIRCUIT_BREAKER_THRESHOLD:
            cache.set(circuit_key, True, timeout=CIRCUIT_BREAKER_COOLDOWN_HOURS * 3600)
            logger.error(
                "Circuit breaker triggered for team %s after %d failures.",
                team_id,
                _failure_counts[team_id],
            )
            _failure_counts.pop(team_id, None)
            return

        logger.error("Failed to generate recommendations for team %s: %s", team_id, exc)
        self.retry(exc=exc)


@shared_task
def generate_daily_recommendations_all():
    """Dispatch recommendation generation for all active teams."""
    from analytickit.models import Team

    teams = Team.objects.filter(is_demo=False)
    dispatched = 0
    for team in teams:
        generate_daily_recommendations.delay(team.id)
        dispatched += 1

    logger.info("Dispatched recommendation generation for %d teams.", dispatched)
