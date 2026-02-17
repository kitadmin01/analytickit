# AI Recommendations Agent - Backend Architecture

## Overview

The AI Recommendations Agent generates daily actionable insights by aggregating Web2 (browser analytics from ClickHouse) and Web3 (Ethereum blockchain data from PostgreSQL), sending a compact summary to OpenAI, and storing structured recommendations. It runs as a Celery task, scheduled daily at 6 AM UTC.

---

## Database Models

### `agent_aggregationsnapshot`

Daily pre-computed summary of web2+web3 data per team.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | AutoField | PK | |
| `team_id` | ForeignKey(Team) | CASCADE, indexed | Customer team |
| `date` | DateField | indexed | Aggregation date |
| `web2_summary` | JSONField | default={} | Aggregated browser analytics |
| `web3_summary` | JSONField | default={} | Aggregated blockchain data |
| `cross_linked_summary` | JSONField | default={} | Joined web2+web3 metrics |
| `rolling_7d_summary` | JSONField | nullable | 7-day rolling averages |
| `rolling_30d_summary` | JSONField | nullable | 30-day rolling averages |
| `token_count` | IntegerField | default=0 | Estimated tokens for this snapshot |
| `created_at` | DateTimeField | auto | Record creation time |

**Constraints:** `unique_together = ("team", "date")`
**Ordering:** `["-date"]`

### `agent_recommendation`

AI-generated recommendation stored per team per day.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | AutoField | PK | |
| `team_id` | ForeignKey(Team) | CASCADE, indexed | Customer team |
| `date` | DateField | indexed | Recommendation date |
| `category` | CharField(20) | choices | One of: `engagement`, `transaction`, `campaign`, `churn`, `growth`, `anomaly` |
| `severity` | CharField(20) | choices | One of: `info`, `warning`, `action_required` |
| `title` | CharField(255) | | Short recommendation title |
| `detail` | TextField | | Detailed explanation with specific numbers |
| `suggested_action` | TextField | | Concrete action the user should take |
| `metric_references` | JSONField | default=[] | List of metric keys this references |
| `is_acted_on` | BooleanField | default=False | Whether user acted on this |
| `acted_on_at` | DateTimeField | nullable | When user marked it acted on |
| `openai_model` | CharField(50) | | Model used (e.g., gpt-4o-mini) |
| `openai_tokens_used` | IntegerField | default=0 | Tokens consumed for this recommendation |
| `snapshot_id` | ForeignKey(AggregationSnapshot) | SET_NULL, nullable | Source snapshot |
| `created_at` | DateTimeField | auto | Record creation time |

**Ordering:** `["-date", "-severity"]`
**Indexes:** `(team, date)`, `(team, category)`

---

## REST API Endpoints

All endpoints require authentication. Responses are scoped to the authenticated user's `current_team_id`.

### Recommendations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/recommendations/` | List recommendations (paginated). Optional query params: `date` (YYYY-MM-DD), `category` |
| GET | `/api/recommendations/{id}/` | Retrieve a single recommendation |
| GET | `/api/recommendations/latest/` | Get the most recent day's recommendations. Returns `{"results": [...], "date": "YYYY-MM-DD"}` |
| POST | `/api/recommendations/{id}/acted/` | Mark a recommendation as acted on. Sets `is_acted_on=True` and `acted_on_at=now()` |
| GET | `/api/recommendations/summary/` | 7-day summary: total count, breakdown by category and severity, acted_on count |
| POST | `/api/recommendations/generate/` | Manually trigger recommendation generation (queues a Celery task) |

**List Response Format:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "date": "2026-02-17",
      "category": "engagement",
      "severity": "action_required",
      "title": "Low Wallet Login Rate",
      "detail": "The wallet login rate is only 0.6%...",
      "suggested_action": "Implement a user-friendly onboarding...",
      "metric_references": ["wallet_login_rate", "unique_visitors"],
      "is_acted_on": false,
      "acted_on_at": null,
      "openai_model": "gpt-4o-mini",
      "openai_tokens_used": 463,
      "created_at": "2026-02-17T16:45:00Z"
    }
  ]
}
```

### Aggregation Snapshots

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/aggregation-snapshots/` | List snapshots. Optional query param: `date` |
| GET | `/api/aggregation-snapshots/{id}/` | Retrieve a single snapshot with full web2/web3/cross-linked data |

---

## Aggregation Pipeline

The pipeline runs in sequence for a given `team_id` and `target_date`:

```
1. Web2Aggregator  ──→  web2_summary     (ClickHouse events table)
2. Web3Aggregator  ──→  web3_summary     (PostgreSQL analytickit_visitorwalletaddress)
3. CrossLinker     ──→  cross_linked     (joins web2 wallet logins with web3 txns)
4. Rolling 7d/30d  ──→  rolling summary  (averages from past AggregationSnapshot records)
5. TokenManager    ──→  trim to budget   (fits summary within 12,000 token budget)
6. Save            ──→  AggregationSnapshot record (upsert on team+date)
```

### Web2 Aggregator

**Data Source:** ClickHouse `events` table
**Query Filter:** `team_id`, `timestamp` within `[from_date, target_date)`

**Metrics Produced:**

| Metric | Description |
|--------|-------------|
| `unique_visitors` | Count of distinct `distinct_id` values |
| `new_visitors` | Visitors whose first event is within the first hour of the window |
| `returning_visitors` | `unique_visitors - new_visitors` |
| `total_events` | Total event count |
| `wallet_logins` | Count of `WalletLogin` events |
| `wallet_login_rate` | `wallet_logins / unique_visitors` |
| `top_pages` | Top 10 pages by view count (path, views, unique visitors) |
| `traffic_sources` | Top 10 sources by visitor count (source, medium, campaign, visitors) |
| `geo_distribution` | Top 10 locations by visitor count (country, state, city, visitors) |
| `device_breakdown` | Dict of device type to visitor count |
| `browser_breakdown` | Dict of browser name to visitor count |

### Web3 Aggregator

**Data Source:** PostgreSQL `analytickit_visitorwalletaddress` table
**Query Filter:** `team_id`, `visitor_wallet_address_ts >= from_date`
**Transaction Filtering:** Parses `txn_data` and `token_transfer_data` JSON strings, filters by date range

| Metric | Description |
|--------|-------------|
| `unique_wallets_active` | Count of wallets in the period |
| `new_wallets` / `returning_wallets` | Based on `creation_ts` vs `from_date` |
| `total_transactions` | Transaction count in date range |
| `successful_transactions` / `failed_transactions` | Based on `receipt_status` (1=success, 0=fail) |
| `total_txn_volume_wei` / `total_txn_volume_eth` | Sum of transaction `value` fields |
| `avg_gas_used` | Mean `receipt_gas_used` across transactions |
| `avg_gas_price_gwei` | Mean `gas_price` converted to Gwei |
| `total_token_transfers` | Count of ERC-20 token transfers |
| `total_token_volume_wei` | Sum of token transfer values |
| `unique_token_addresses` | Distinct token contract addresses |
| `top_interacting_contracts` | Top 10 `to_address` by transaction count |
| `wallet_segments` | Categorized as `whales` (>=1 ETH), `regular` (>=0.01 ETH), `micro` (<0.01 ETH) |
| `input_method_breakdown` | Transaction input signatures (`0x` = simple transfer, `0x18cbafe` = swap, etc.) |

### Cross Linker

**Data Sources:** ClickHouse (WalletLogin events) + PostgreSQL (wallet addresses)
**Join Key:** `$crypto_wallet_public_address` (web2) ↔ `visitor_wallet_address` (web3), both normalized to lowercase

| Metric | Description |
|--------|-------------|
| `wallets_with_both_web2_and_web3` | Wallets that appeared in both datasets |
| `wallets_web2_only` | Connected wallet on site but no on-chain activity |
| `wallets_web3_only` | On-chain activity but no website visit |
| `web2_to_web3_conversion_rate` | `both / web2_total` |
| `campaign_attribution` | For each UTM campaign: wallet_logins, on_chain_txns, txn_volume_eth |
| `page_to_txn_correlation` | Top 10 pages by on-chain conversion rate |

### Token Manager

Ensures the prompt stays within the 12,000-token budget by progressively trimming:

1. Reduce `top_pages` to top 5
2. Reduce `traffic_sources` to top 5
3. Convert `wallet_segments` from address lists to counts
4. Remove `rolling_30d_summary`
5. Reduce `geo_distribution` to top 3

Uses `tiktoken` (cl100k_base encoding) for accurate token counting, with a `len(text) // 4` fallback.

---

## OpenAI Integration

### Model Selection

| Tier | Model | When | Est. Cost/Team/Month |
|------|-------|------|---------------------|
| Daily | gpt-4o-mini | Every day | ~$0.30 |
| Weekly | gpt-4o | Every Monday | ~$0.50 |
| On-demand | gpt-4o-mini | Manual trigger (max 3/day) | ~$0.10 |

### Prompt Structure

- **System prompt:** Instructs the model to return valid JSON with 3-7 recommendations, each with category, severity, title, detail, suggested_action, and metric_references.
- **User prompt:** Contains the day's aggregated web2 summary, web3 summary, cross-linked insights, 7-day rolling trends, and previous recommendations for continuity.

### API Call Parameters

| Parameter | Value |
|-----------|-------|
| `max_tokens` | 2,000 |
| `temperature` | 0.7 |
| `response_format` | `{"type": "json_object"}` |

### Retry & Circuit Breaker

- **Retries:** 3 attempts with delays of 5min, 10min, 20min
- **Handles:** `RateLimitError`, `APITimeoutError`
- **Circuit breaker:** After 5 consecutive failures for a team, skips that team for 24 hours

---

## Celery Tasks

### `generate_daily_recommendations(team_id, model=None)`

Main task. Bound, max_retries=3, default_retry_delay=300s.

**Flow:**
1. Check circuit breaker cache key `agent_circuit_breaker_{team_id}`
2. Run `AggregationPipeline.run()` → saves `AggregationSnapshot`
3. Fetch last 5 recommendations for prompt context
4. Build prompts via `PromptBuilder`
5. Call OpenAI via `OpenAIClient.generate_recommendations()`
6. Parse response, create `Recommendation` records
7. On failure: increment failure count, retry or trigger circuit breaker

### `generate_daily_recommendations_all()`

Dispatcher task. Iterates all non-demo teams and queues `generate_daily_recommendations.delay(team.id)` for each.

**Celery Beat Schedule:**
```python
CELERY_BEAT_SCHEDULE = {
    'daily-recommendations': {
        'task': 'analytickit.agent.tasks.generate_daily_recommendations_all',
        'schedule': crontab(hour=6, minute=0),  # 6 AM UTC daily
    },
}
```

---

## File Structure

```
analytickit/agent/
├── __init__.py
├── admin.py               # Django admin registration
├── apps.py                # Django app config (AgentConfig)
├── constants.py           # Prompt templates, model config, rate limits
├── models.py              # AggregationSnapshot, Recommendation models
├── serializers.py         # DRF serializers
├── views.py               # API viewsets and actions
├── urls.py                # DRF router configuration
├── tasks.py               # Celery tasks (daily + dispatcher)
├── services/
│   ├── __init__.py
│   ├── aggregation.py     # AggregationPipeline orchestrator
│   ├── web2_aggregator.py # ClickHouse event aggregation
│   ├── web3_aggregator.py # PostgreSQL wallet/txn aggregation
│   ├── cross_linker.py    # Web2↔Web3 join logic
│   ├── openai_client.py   # OpenAI API wrapper with retry
│   ├── prompt_builder.py  # Prompt template construction
│   └── token_manager.py   # Token counting and budget trimming
└── migrations/
    └── 0001_initial.py    # Creates both tables with indexes
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for recommendation generation |

---

## Manual Trigger

From a worker pod:
```python
from analytickit.agent.tasks import generate_daily_recommendations
generate_daily_recommendations(team_id=2)
```

From the API (authenticated):
```
POST /api/recommendations/generate/
```
