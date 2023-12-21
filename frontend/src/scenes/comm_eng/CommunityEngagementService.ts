import { kea, loaders } from 'kea'
import { CommunityEngagement, CommunityEngagementCreatePayload } from './CommunityEngagementModel'
import api from 'lib/api' 
import { lemonToast } from 'lib/components/lemonToast' // For user notifications

import type { communityEngagementLogicType } from './CommunityEngagementServiceType'

const API_ENDPOINT = '/api/campaign'
const WALLET_API_ENDPOINT = '/api/wallet-address-metrics'

export const communityEngagementLogic = kea<communityEngagementLogicType>({
    path: ['scenes', 'comm_eng', 'CommunityEngagementService'],

    // Additional actions, selectors, listeners, etc.
    loaders: () => ({
        engagements: [
            [] as CommunityEngagement[],
            {
                fetchAllEngagements: async () => {
                    try {
                        const response = await api.get(API_ENDPOINT)
                        return response.results
                    } catch (error) {
                        lemonToast.error('Failed to fetch Community Engagements')
                        throw error
                    }
                },
                fetchEngagementById: async (id: number) => {
                    try {
                        const response = await api.get(`${API_ENDPOINT}/${id}`)
                        return response
                    } catch (error) {
                        lemonToast.error(`Failed to fetch Community Engagement with ID: ${id}`)
                        throw error
                    }
                },
                createEngagement: async (payload: CommunityEngagementCreatePayload) => {
                    try {
                        const response = await api.create(API_ENDPOINT, payload)
                        lemonToast.success('Community Engagement created successfully')
                        return response
                    } catch (error) {
                        lemonToast.error('Failed to create Community Engagement')
                        throw error
                    }
                },
                updateEngagement: async (payload: { id: number; data: CommunityEngagementCreatePayload }) => {
                    const { id, data } = payload;
                    try {
                        const response = await api.update(`${API_ENDPOINT}/${id}`, data);
                        lemonToast.success('Community Engagement updated successfully');
                        return response;
                    } catch (error) {
                        lemonToast.error('Failed to update Community Engagement');
                        throw error;
                    }
                },
                deleteEngagement: async (id: number) => {
                    try {
                        await api.delete(`${API_ENDPOINT}/${id}`);
                        lemonToast.success('Community Engagement deleted successfully');
                    } catch (error) {
                        lemonToast.error('Failed to delete Community Engagement');
                        throw error;
                    }
                },
                                
                
},
        ],
        campaignAnalytics: [
            {}, // Initial state as an empty object
            {
                fetchCampaignAnalytic: async (id: number) => {
                    try {
                        const response = await api.get(`${API_ENDPOINT}/${id}/analytic`);
                        // Assuming response.data contains the analytics data
                        console.log(`Fetched Campaign Analytic with ID: ${id}`, response.data); // Log the data for debugging purposes
                        return { [id]: response.data }; // Update the state with the new data
                    } catch (error) {
                        console.error(`Failed to fetch Campaign Analytic with ID: ${id}`, error);
                        return { [id]: [] }; // Return an empty array for this ID in case of an error
                    }
                },
            },
        ],
        walletAnalytics: [
            {}, // Initial state as an empty object
            {
                fetchWalletAnalytic: async (teamId: number) => {
                    try {
                        const response = await api.get(`${WALLET_API_ENDPOINT}?team_id=${teamId}`);
                        console.log(`Fetched Wallet Analytic with Team ID: ${teamId}`, response.data);
                        return { [teamId]: response.data }; // Update the state with the new data
                    } catch (error) {
                        console.error(`Failed to fetch Wallet Analytic with Team ID: ${teamId}`, error);
                        return { [teamId]: {} }; // Return an empty object for this ID in case of an error
                    }
                },
            },
        ],

    }),
    reducers: () => ({
        lastUpdated: [
            0, // Initial state
            {
                createEngagement: () => new Date().getTime(),
                updateEngagement: () => new Date().getTime(),
                deleteEngagement: () => new Date().getTime(),
            },
        ],
    }),
})