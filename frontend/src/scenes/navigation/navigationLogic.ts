import { kea } from 'kea'
import api from 'lib/api'
import type { navigationLogicType } from './navigationLogicType'

export const navigationLogic = kea<navigationLogicType>({
    path: ['scenes', 'navigation', 'navigationLogic'],
    loaders: {
        latestVersion: [
            null as null | { version: string },
            {
                loadLatestVersion: async () => {
                    try {
                        const response = await api.get('/api/version/')
                        return response.data || { version: null }
                    } catch (error) {
                        console.error('Failed to load version:', error)
                        return { version: null }
                    }
                },
            },
        ],
    },
    defaults: {
        versions: [],
        latestVersion: { version: null },
    },
    selectors: {
        getVersions: [
            (s) => [s.latestVersion],
            (latestVersion) => {
                return latestVersion?.version ? [latestVersion.version] : []
            },
        ],
    },
})
