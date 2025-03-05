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
    }>
    campaign_performance: Record<
        string,
        {
            visits: number
            sources: Record<string, number>
            medium: Record<string, number>
        }
    >
    device_analytics: {
        devices: Record<string, number>
        browsers: Record<string, number>
    }
    conversion_metrics: {
        referrer_distribution: Record<string, number>
        transaction_stats: {
            initiated: number
            successful: number
            avg_value: number
        }
    }
}

export const web23Logic = kea<web23LogicType>({
    path: ['scenes', 'web23', 'web23Logic'],
    props: {} as InsightLogicProps,
    key: (props) => props.dashboardItemId || 'web23_dashboard',

    connect: {
        values: [insightLogic, ['insight', 'insightLoading'], teamLogic, ['currentTeamId']],
    },

    actions: {
        setDateRange: (fromDate: string, toDate: string) => ({ fromDate, toDate }),
        setWalletAddress: (walletAddress: string | null) => ({ walletAddress }),
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

    loaders: ({ values }) => ({
        funnelData: [
            null as Web23FunnelData | null,
            {
                loadFunnelData: async () => {
                    try {
                        const response = await api.get(
                            `web23-view/${values.currentTeamId}/?from_date=${
                                values.fromDate
                            }&days=${values.days}`
                        )
                        return response
                    } catch (error) {
                        lemonToast.error('Failed to load Web2 to Web3 funnel data')
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
