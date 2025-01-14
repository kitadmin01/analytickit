import { kea } from 'kea'
import api from 'lib/api'
import type { graphDataLogicType } from './graphDataLogicType'

interface ActiveUserDataPoint {
    active_users: number
    creation_ts: string
    update_ts: string
}

export const graphDataLogic = kea<graphDataLogicType>({
    path: ['scenes', 'graphs', 'graphDataService'],
    actions: {
        fetchGraphData: (campaignId: number) => ({ campaignId }),
        fetchGraphDataSuccess: (graphData: ActiveUserDataPoint[]) => ({ graphData }),
        fetchGraphDataFailure: (error: string, errorObject?: any) => ({ error, errorObject }),
    },

    reducers: {
        graphData: [
            [] as ActiveUserDataPoint[],
            {
                fetchGraphDataSuccess: (_, { graphData }) => graphData,
            },
        ],
        graphDataLoading: [
            false,
            {
                fetchGraphData: () => true,
                fetchGraphDataSuccess: () => false,
                fetchGraphDataFailure: () => false,
            },
        ],
    },

    listeners: ({ actions }) => ({
        fetchGraphData: async ({ campaignId }, breakpoint) => {
            try {
                console.log('Fetching data for campaign:', campaignId)
                const response = await api.get(`/api/crypto-analytics/type/active_users/`)
                console.log('API Response:', response)
                breakpoint()
                
                if (response && response.results && Array.isArray(response.results)) {
                    actions.fetchGraphDataSuccess(response.results)
                } else {
                    throw new Error('Invalid response format')
                }
            } catch (error: any) {
                console.error('API Error:', error)
                actions.fetchGraphDataFailure(error.message, error)
            }
        },
    }),
})
