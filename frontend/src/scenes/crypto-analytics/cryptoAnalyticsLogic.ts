import { actions, kea, listeners, path, reducers, selectors } from 'kea'
import { loaders } from 'kea-loaders'
import api from 'lib/api'
import { handleError, ErrorType, ErrorDetails } from './utils/errorHandling'
import { lemonToast } from '@analytickit/lemon-ui'
import { CryptoAnalytic } from './types'

import type { cryptoAnalyticsLogicType } from './cryptoAnalyticsLogicType' // Ensure this is correct

export interface CryptoAnalyticsState {
    error: ErrorDetails | null
    isLoading: boolean
    loadingStates: Record<string, boolean>
}

export const cryptoAnalyticsLogic = kea<cryptoAnalyticsLogicType>([
    path(['scenes', 'crypto-analytics', 'cryptoAnalyticsLogic']),

    actions({
        setError: true,
        clearError: true,
        setLoadingState: true,
        retryFailedOperation: true,
        setDateRange: true,
        toggleMetric: true,
    }),

    reducers({
        error: [
            null as ErrorDetails | null,
            {
                setError: (_, { value }) => value,
                clearError: () => null,
            },
        ],
        loadingStates: [
            {} as Record<string, boolean>,
            {
                setLoadingState: (state, { value }) => ({
                    ...state,
                    [value.key]: value.isLoading,
                }),
            },
        ],
    }),

    loaders(({ actions }) => ({
        analyticsList: [
            [] as CryptoAnalytic[],
            {
                loadAnalyticsList: async () => {
                    actions.setLoadingState({ value: { key: 'list', isLoading: true } })
                    try {
                        const response = await api.get('api/crypto-analytics/')
                        actions.setLoadingState({ value: { key: 'list', isLoading: false } })
                        return response.results || response // handle both paginated and non-paginated responses
                    } catch (error) {
                        const errorDetails = handleError(error)
                        actions.setError({ value: errorDetails })
                        actions.setLoadingState({ value: { key: 'list', isLoading: false } })
                        throw error
                    }
                },
            },
        ],
        analytic: [
            null as CryptoAnalytic | null,
            {
                createAnalytic: async ({ values }) => {
                    actions.setLoadingState({ value: { key: 'create', isLoading: true } })
                    try {
                        const response = await api.create('api/crypto-analytics/', values)
                        actions.setLoadingState({ value: { key: 'create', isLoading: false } })
                        lemonToast.success('Analysis created successfully')
                        return response
                    } catch (error) {
                        const errorDetails = handleError(error)
                        actions.setError({ value: errorDetails })
                        actions.setLoadingState({ value: { key: 'create', isLoading: false } })

                        if (errorDetails.type === ErrorType.VALIDATION_ERROR) {
                            lemonToast.error('Please check the form for errors')
                        } else {
                            lemonToast.error('Failed to create analysis')
                        }
                        throw error
                    }
                },
                updateAnalytic: async ({ id, values }) => {
                    actions.setLoadingState({ value: { key: 'update', isLoading: true } })
                    try {
                        const response = await api.update(`api/crypto-analytics/${id}/`, values)
                        actions.setLoadingState({ value: { key: 'update', isLoading: false } })
                        lemonToast.success('Analysis updated successfully')
                        return response
                    } catch (error) {
                        actions.setError({ value: handleError(error) })
                        actions.setLoadingState({ value: { key: 'update', isLoading: false } })
                        throw error
                    }
                },
            },
        ],
    })),

    selectors({
        isLoading: [
            (s) => [s.loadingStates],
            (loadingStates: Record<string, boolean>): boolean => Object.values(loadingStates).some(Boolean),
        ],
        hasError: [(s) => [s.error], (error: ErrorDetails | null): boolean => error !== null],
    }),

    listeners(({ actions }) => ({
        retryFailedOperation: () => {
            actions.clearError()
            actions.loadAnalyticsList()
        },
    })),
])
