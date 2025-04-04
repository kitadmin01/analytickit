import { kea } from 'kea'
import api from 'lib/api'
import { dayjs } from 'lib/dayjs'
import { insightLogic } from 'scenes/insights/insightLogic'
import { lemonToast } from 'lib/components/lemonToast'
import { teamLogic } from 'scenes/teamLogic'
import type { web23LogicType } from './web23LogicType'
import { InsightLogicProps } from '~/types'

export interface Web23FunnelData {
    metadata: {
        team_id: number
        from_date: string
        to_date: string
        days: number
        weeks: number
    }
    summary: {
        total_visits: number
        total_engagement: number
        total_conversions: number
        unique_wallets: number
        overall_conversion_rate: number
        awareness_to_engagement_rate: number
        engagement_to_conversion_rate: number
        avg_transaction_value: number
        median_transaction_value: number
        total_transaction_value: number
        std_dev_transaction_value: number
    }
    daily_metrics: Array<{
        date: string
        visits: number
        engagement: number
        transactions: number
    }>
    weekly_metrics: Array<{
        week: number
        date_range: string
        visits: number
        engagement: number
        transactions: number
        conversion_rate: number
        visits_wow?: number
        engagement_wow?: number
        transactions_wow?: number
        conversion_rate_wow?: number
        significant_change?: boolean
    }>
    campaign_performance: Record<
        string,
        {
            visits: number
            sources: Record<string, number>
            medium: Record<string, number>
            geo: Record<string, number>
        }
    >
    device_analytics: {
        devices: Record<string, number>
        browsers: Record<string, number>
        operating_systems: Record<string, number>
        screen_sizes: Record<string, number>
        device_conversion_rates: Record<string, number>
    }
    conversion_metrics: {
        referrer_distribution: Record<string, number>
        transaction_stats: {
            initiated: number
            successful: number
            failed: number
            avg_value: number
            median_value: number
            total_value: number
        }
    }
    time_to_conversion: {
        avg_minutes: number
        median_minutes: number
        distribution: Record<string, number>
    }
}

export const web23Logic = kea<web23LogicType>({
    path: ['scenes', 'web23', 'web23Logic'],
    props: {} as InsightLogicProps,
    key: (props) => {
        if (props.dashboardItemId === null || props.dashboardItemId === undefined) {
            return 'web23_dashboard'
        }
        return String(props.dashboardItemId)
    },

    connect: {
        values: [teamLogic, ['currentTeamId']],
    },

    actions: {
        setDateRange: (fromDate: string, toDate: string) => ({ fromDate, toDate }),
        setWalletAddress: (walletAddress: string | null) => ({ walletAddress }),
        setFunnelDataError: (error: string | null) => ({ error }),
    },

    reducers: {
        fromDate: [
            dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
            {
                setDateRange: (_, { fromDate }) => fromDate,
            },
        ],
        toDate: [
            dayjs().format('YYYY-MM-DD'),
            {
                setDateRange: (_, { toDate }) => toDate,
            },
        ],
        walletAddress: [
            null as string | null,
            {
                setWalletAddress: (_, { walletAddress }) => walletAddress,
            },
        ],
        funnelDataError: [
            null as string | null,
            {
                setFunnelDataError: (_, { error }) => error,
                loadFunnelDataSuccess: () => null,
            },
        ],
    },

    selectors: {
        insightProps: [() => [(_, props) => props], (props): InsightLogicProps => props],
        days: [
            (s) => [s.fromDate, s.toDate],
            (fromDate, toDate) => {
                return dayjs(toDate).diff(dayjs(fromDate), 'day') + 1
            },
        ],
    },

    loaders: ({ values, actions }) => ({
        funnelData: [
            null as Web23FunnelData | null,
            {
                loadFunnelData: async () => {
                    try {
                        // Get the team ID from the URL if available
                        const urlParams = new URLSearchParams(window.location.pathname);
                        const pathParts = window.location.pathname.split('/');
                        const teamIdFromUrl = pathParts[pathParts.length - 1];
                        
                        // Use the team ID from the URL or fall back to the current team ID
                        const teamId = teamIdFromUrl && !isNaN(Number(teamIdFromUrl)) 
                            ? teamIdFromUrl 
                            : values.currentTeamId;
                            
                        const response = await api.get(
                            `api/web23/${teamId}/?from_date=${
                                values.fromDate
                            }&days=${values.days}`
                        )
                        
                        actions.setFunnelDataError(null)
                        return response
                    } catch (error: any) {
                        // Handle API errors
                        if (error.response && error.response.status === 403) {
                            actions.setFunnelDataError("No funnel data available for this team.")
                        } else if (error.response && error.response.data && error.response.data.error) {
                            actions.setFunnelDataError(error.response.data.error)
                        } else {
                            actions.setFunnelDataError(error.message || 'Failed to load data')
                        }
                        return null
                    }
                },
            },
        ],
    }),

    listeners: ({ actions }) => ({
        setDateRange: () => {
            actions.loadFunnelData()
        },
        setWalletAddress: () => {
            actions.loadFunnelData()
        },
    }),

    events: ({ actions }) => ({
        afterMount: () => {
            actions.loadFunnelData()
        },
    }),
})
