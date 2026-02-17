import { kea } from 'kea'
import api from 'lib/api'
import { toParams } from 'lib/utils'
import type { recommendationsLogicType } from './recommendationsLogicType'

export interface Recommendation {
    id: number
    category: 'engagement' | 'transaction' | 'campaign' | 'churn' | 'growth' | 'anomaly'
    severity: 'info' | 'warning' | 'action_required'
    title: string
    detail: string
    suggested_action: string
    metric_references: string[]
    is_acted_on: boolean
    acted_on_at: string | null
    openai_model: string
    openai_tokens_used: number
    created_at: string
    date: string
}

export const recommendationsLogic = kea<recommendationsLogicType>({
    path: ['scenes', 'recommendations', 'recommendationsLogic'],

    actions: {
        setDateFilter: (date: string) => ({ date }),
        setCategoryFilter: (category: string | null) => ({ category }),
        markAsActedOn: (id: number) => ({ id }),
    },

    loaders: ({ values }) => ({
        recommendations: {
            __default: [] as Recommendation[],
            loadRecommendations: async (): Promise<Recommendation[]> => {
                const params: Record<string, any> = {}
                if (values.dateFilter) {
                    params.date = values.dateFilter
                }
                if (values.categoryFilter) {
                    params.category = values.categoryFilter
                }
                const queryString = toParams(params)
                const url = queryString ? `api/recommendations/?${queryString}` : 'api/recommendations/'
                const response = await api.get(url)
                return response.results as Recommendation[]
            },
        },
    }),

    reducers: {
        dateFilter: [
            '' as string,
            {
                setDateFilter: (_, { date }) => date,
            },
        ],
        categoryFilter: [
            null as string | null,
            {
                setCategoryFilter: (_, { category }) => category,
            },
        ],
    },

    listeners: ({ actions }) => ({
        setDateFilter: () => {
            actions.loadRecommendations()
        },
        setCategoryFilter: () => {
            actions.loadRecommendations()
        },
        markAsActedOn: async ({ id }) => {
            await api.create(`api/recommendations/${id}/acted/`)
            actions.loadRecommendations()
        },
    }),

    events: ({ actions }) => ({
        afterMount: () => {
            actions.loadRecommendations()
        },
    }),
})
