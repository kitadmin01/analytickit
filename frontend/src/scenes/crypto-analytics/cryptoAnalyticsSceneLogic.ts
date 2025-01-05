import { actions, kea, path, reducers, listeners } from 'kea'
import { router } from 'kea-router'
import { urls } from 'scenes/urls'

import type { cryptoAnalyticsSceneLogicType } from './cryptoAnalyticsSceneLogicType'

export const cryptoAnalyticsSceneLogic = kea<cryptoAnalyticsSceneLogicType>([
    path(['scenes', 'crypto-analytics', 'cryptoAnalyticsSceneLogic']),
    actions({
        navigateToEdit: (id: string) => ({ id }),
        navigateToDetail: (id: string) => ({ id }),
        navigateToList: true,
        navigateToType: (type: string) => ({ type }), // Add this action
    }),
    reducers({}),
    listeners(() => ({
        navigateToEdit: ({ id }) => {
            router.actions.push(urls.cryptoAnalytics.edit(id))
        },
        navigateToDetail: ({ id }) => {
            router.actions.push(urls.cryptoAnalytics.detail(id))
        },
        navigateToList: () => {
            router.actions.push(urls.cryptoAnalytics.list())
        },
        navigateToType: ({ type }) => {
            // Add this listener
            router.actions.push(urls.cryptoAnalytics.type(type)) // Navigate to the type URL
        },
    })),
])
