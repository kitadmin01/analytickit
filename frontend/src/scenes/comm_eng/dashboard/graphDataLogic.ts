import { kea } from 'kea'
import api from 'lib/api'
import { lemonToast } from 'lib/components/lemonToast'
import type { graphDataLogicType } from './graphDataLogicType'

const API_ENDPOINT = '/api/campaign'

export const graphDataLogic = kea<graphDataLogicType>({
    path: ['scenes', 'graphs', 'graphDataService'],

    // Actions, reducers, and listeners
    loaders: () => ({
        graphData: [
            {}, // Initial state as an empty object
            {
                fetchGraphData: async (campaignId: number) => {
                    console.log(`fetchGraphData called for campaign ID: ${campaignId}`); // Add logging for debugging

                    try {
                        console.log(`Fetching data for campaign ID: ${campaignId}`); // Add logging for debugging
                        const response = await api.get(`${API_ENDPOINT}/${campaignId}/analytic`)
                        const data = response.data // Assuming `data` contains all relevant graph data
                        console.log('Fetched Graph Data:', data)

                        // Process the data for each graph type
                        return {
                            activeUsers: data.map((item: any) => ({
                                date: item.creation_ts,
                                active_users: item.active_users
                            })),
                            totalContractCalls: data.map((item: any) => ({
                                date: item.creation_ts,
                                total_contract_calls: item.total_contract_calls
                            })),
                            tokensTransferred: data.map((item: any) => ({
                                date: item.creation_ts,
                                tot_tokens_transferred: item.tot_tokens_transferred
                            })),
                            gasUsed: data.map((item: any) => ({
                                date: item.creation_ts,
                                ave_gas_used: item.ave_gas_used
                            })),
                            transactions: data.map((item: any) => ({
                                date: item.creation_ts,
                                tot_txns: item.tot_txns
                            })),
                            tokenTransferVolume: data.map((item: any) => ({
                                date: item.creation_ts,
                                token_transfer_volume: item.token_transfer_volume
                            })),
                            transactionValueDistribution: data.map((item: any) => ({
                                distribution: item.transaction_value_distribution
                            })),
                            tokenTransferValueDistribution: data.map((item: any) => ({
                                distribution: item.token_transfer_value_distribution
                            })),
                            tokenFlow: data.map((item: any) => ({
                                flow: item.token_flow
                            })),
                        }
                    } catch (error) {
                        lemonToast.error('Failed to fetch graph data')
                        throw error
                    }
                },
            },
        ],
    }),

    reducers: () => ({
        lastUpdated: [
            0, // Initial state
            {
                fetchGraphData: () => new Date().getTime(),
            },
        ],
    }),
})
