import React from 'react'
import { Tooltip } from 'antd'

interface MetricTooltipProps {
    children: React.ReactNode
}

export const TotalVisitsTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Total number of page views and visits to your website">
        {children}
    </Tooltip>
)

export const TotalEngagementTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Total number of user interactions including logins, signups, and wallet connections">
        {children}
    </Tooltip>
)

export const TotalConversionsTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Total number of successful Web3 transactions and conversions">
        {children}
    </Tooltip>
)

export const ConversionRateTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Percentage of visits that resulted in successful Web3 transactions">
        {children}
    </Tooltip>
)

export const AwarenessTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Initial stage: Users visiting your website">
        {children}
    </Tooltip>
)

export const EngagementTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Middle stage: Users interacting with your platform">
        {children}
    </Tooltip>
)

export const ConversionTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Final stage: Users completing Web3 transactions">
        {children}
    </Tooltip>
)

export const TotalValueTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Sum of all transaction values in USD">
        {children}
    </Tooltip>
)

export const AverageValueTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Average transaction value in USD">
        {children}
    </Tooltip>
)

export const MedianValueTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Middle value of all transactions in USD">
        {children}
    </Tooltip>
)

export const StdDevValueTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Standard deviation of transaction values in USD">
        {children}
    </Tooltip>
)

export const AverageTimeTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Average time from first visit to successful transaction">
        {children}
    </Tooltip>
)

export const MedianTimeTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Middle value of time from visit to transaction">
        {children}
    </Tooltip>
)

export const CampaignTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Marketing campaign name from UTM parameters">
        {children}
    </Tooltip>
)

export const SourcesTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Traffic sources (e.g., Google, Facebook) from UTM parameters">
        {children}
    </Tooltip>
)

export const MediumTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Marketing medium (e.g., cpc, banner) from UTM parameters">
        {children}
    </Tooltip>
)

export const LocationsTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Geographic locations of visitors">
        {children}
    </Tooltip>
)

export const WalletAddressesTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Unique wallet addresses that interacted with your platform">
        {children}
    </Tooltip>
)

export const WoWTooltip: React.FC<MetricTooltipProps> = ({ children }) => (
    <Tooltip title="Week-over-Week percentage change">
        {children}
    </Tooltip>
) 