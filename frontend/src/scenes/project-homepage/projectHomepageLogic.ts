import { kea } from 'kea'
import type { projectHomepageLogicType } from './projectHomepageLogicType'

export const projectHomepageLogic = kea<projectHomepageLogicType>({
    path: ['scenes', 'project-homepage', 'projectHomepageLogic'],
    reducers: {
        persons: [
            [] as any[],
            {
                loadPersonsSuccess: (_, { persons }) => persons || [],
            },
        ],
        recentInsights: [
            [] as any[],
            {
                loadRecentInsightsSuccess: (_, { insights }) => insights || [],
            },
        ],
    },
}) 