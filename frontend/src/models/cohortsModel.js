import { kea } from 'kea'
import api from 'lib/api'

const POLL_TIMEOUT = 5000

export const cohortsModel = kea({
    actions: () => ({
        setPollTimeout: (pollTimeout) => ({ pollTimeout }),
    }),

    loaders: () => ({
        cohorts: {
            loadCohorts: async () => {
                const response = await api.get('api/cohort')
                return response.results
            },
        },
    }),

    reducers: () => ({
        pollTimeout: [
            null,
            {
                setPollTimeout: (_, { pollTimeout }) => pollTimeout,
            },
        ],
    }),

    listeners: ({ actions }) => ({
        loadCohortsSuccess: async ({ cohorts }) => {
            const is_calculating = cohorts.filter((cohort) => cohort.is_calculating).length > 0
            if (!is_calculating) return
            actions.setPollTimeout(setTimeout(actions.loadCohorts, POLL_TIMEOUT))
        },
    }),

    events: ({ actions, values }) => ({
        afterMount: actions.loadCohorts,
        beforeUnmount: () => {
            clearTimeout(values.pollTimeout)
        },
    }),
})
