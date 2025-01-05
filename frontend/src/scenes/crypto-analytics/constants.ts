// frontend/src/scenes/crypto-analytics/constants.ts
export const FILTER_RANGES = {
    token_type: {
        options: ['Active', 'Inactive', 'ERC20', 'ERC721'],
        label: 'Token Type',
    },
    active_users: {
        ranges: [
            { label: 'Low Activity', min: 0, max: 1000 },
            { label: 'Medium Activity', min: 1001, max: 5000 },
            { label: 'High Activity', min: 5001, max: 10000 },
            { label: 'Very High Activity', min: 10001, max: null },
        ],
        label: 'Active Users',
    },
    total_contract_calls: {
        ranges: [
            { label: 'Low Activity', min: 0, max: 100 },
            { label: 'Medium Activity', min: 101, max: 500 },
            { label: 'High Activity', min: 501, max: 1000 },
            { label: 'Very High Activity', min: 1001, max: null },
        ],
        label: 'Total Contract Calls',
    },
    tot_tokens_transferred: {
        ranges: [
            { label: 'Low Volume', min: 0, max: 1000 },
            { label: 'Medium Volume', min: 1001, max: 10000 },
            { label: 'High Volume', min: 10001, max: 100000 },
            { label: 'Very High Volume', min: 100001, max: null },
        ],
        label: 'Total Tokens Transferred',
    },
    ave_gas_used: {
        ranges: [
            { label: 'Low Gas Usage', min: 0, max: 20000 },
            { label: 'Medium Gas Usage', min: 20001, max: 50000 },
            { label: 'High Gas Usage', min: 50001, max: 100000 },
            { label: 'Very High Gas Usage', min: 100001, max: null },
        ],
        label: 'Average Gas Used',
    },
    // ... continue with other ranges
}

export const TRANSACTION_VALUE_RANGES = [
    { label: 'Micro Transactions', min: 0, max: 0.01 },
    { label: 'Small Transactions', min: 0.01, max: 0.1 },
    { label: 'Medium Transactions', min: 0.1, max: 1 },
    { label: 'Large Transactions', min: 1, max: 10 },
    { label: 'Very Large Transactions', min: 10, max: 50 },
    { label: 'Huge Transactions', min: 50, max: 100 },
    { label: 'Massive Transactions', min: 100, max: 500 },
    { label: 'Colossal Transactions', min: 500, max: 1000 },
    { label: 'Gargantuan Transactions', min: 1000, max: 5000 },
    { label: 'Titanic Transactions', min: 5000, max: null },
]

export const DATE_RANGE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_24_hours', label: 'Last 24 Hours' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_14_days', label: 'Last 14 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_60_days', label: 'Last 60 Days' },
]

export const DAY_RANGE_OPTIONS = [
    { value: 'hour', label: 'hour' },
    { value: 'day', label: 'day' },
    { value: 'week', label: 'week' },
    { value: 'month', label: 'month' },
]

export const ACTIVE_USER_TYPES = [
    { value: 'daily_active', label: 'Daily Active Users' },
    { value: 'weekly_active', label: 'Weekly Active Users' },
    { value: 'monthly_active', label: 'Monthly Active Users' },
]

export const DATE_RANGES = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' },
]

export const DAY_RANGES = [
    { value: '1', label: '1 day' },
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
]
