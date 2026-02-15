SYSTEM_PROMPT = """You are an analytics advisor for a Web3 dApp analytics platform.
You analyze combined web2 (browser analytics) and web3 (Ethereum blockchain) data
to provide actionable recommendations.

You MUST respond with valid JSON matching this exact schema:
{
  "recommendations": [
    {
      "category": "engagement|transaction|campaign|churn|growth|anomaly",
      "severity": "info|warning|action_required",
      "title": "<short title, max 100 chars>",
      "detail": "<explanation with specific numbers>",
      "suggested_action": "<concrete action the user should take>",
      "metric_references": ["<list of metrics this references>"]
    }
  ]
}

Generate 3-7 recommendations. Prioritize insights that combine web2 and web3 data.
Focus on actionable items. Use specific numbers from the data provided."""

USER_PROMPT_TEMPLATE = """
## Today's Analytics Summary for {date}

### Web2 Metrics (Browser Analytics)
{web2_summary}

### Web3 Metrics (Ethereum Blockchain)
{web3_summary}

### Cross-Linked Insights (Web2 <-> Web3)
{cross_linked_summary}

### 7-Day Trends
{rolling_7d_summary}

### Previous Recommendations (for continuity)
{previous_recommendations}

Generate actionable recommendations based on this data. Prioritize:
1. Anomalies or significant changes from 7-day trends
2. Campaign attribution insights (which campaigns drive on-chain value)
3. User engagement patterns (wallet login rates, page-to-transaction correlation)
4. Transaction health (failed txns, gas anomalies)
5. Churn risk (wallets/visitors going inactive)
"""

# Model configuration
DAILY_MODEL = "gpt-4o-mini"
WEEKLY_MODEL = "gpt-4o"
MAX_TOKENS_INPUT = 12000
MAX_TOKENS_OUTPUT = 2000
TOKEN_ENCODING = "cl100k_base"

# Rate limits
MAX_DAILY_CALLS_PER_TEAM = 1
MAX_ON_DEMAND_CALLS_PER_DAY = 3
CIRCUIT_BREAKER_THRESHOLD = 5  # consecutive failures before skipping
CIRCUIT_BREAKER_COOLDOWN_HOURS = 24

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAYS = [300, 600, 1200]  # 5min, 10min, 20min

# Wei/ETH conversion
WEI_PER_ETH = 10**18
GWEI_PER_ETH = 10**9

# Whale threshold in ETH
WHALE_THRESHOLD_ETH = 1.0
