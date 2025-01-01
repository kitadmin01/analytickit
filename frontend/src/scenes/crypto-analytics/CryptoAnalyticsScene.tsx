// frontend/src/scenes/crypto-analytics/CryptoAnalyticsScene.tsx
import React, { useEffect } from 'react'
import { useValues, useActions } from 'kea'
import { cryptoAnalyticsLogic } from './cryptoAnalyticsLogic'
import { LoadingState } from './components/LoadingState'
import { CryptoAnalyticsErrorBoundary } from './components/ErrorBoundary'
import { Alert } from 'antd'
import { LemonButton } from '@analytickit/lemon-ui'
import { AnalyticCard } from './components/AnalyticCard'
import { ErrorType } from './utils/errorHandling'
import { SceneExport } from 'scenes/sceneTypes'
import { cryptoAnalyticsSceneLogic } from './cryptoAnalyticsSceneLogic' // Ensure this is imported

export function CryptoAnalyticsScene(): JSX.Element {
    const { analyticsList, isLoading, error, hasError } = useValues(cryptoAnalyticsLogic)
    const { loadAnalyticsList, retryFailedOperation, clearError } = useActions(cryptoAnalyticsLogic)
    const { navigateToType } = useActions(cryptoAnalyticsSceneLogic) // Use the navigate action

    useEffect(() => {
        loadAnalyticsList() // Call the action to load analytics when the component mounts
    }, [loadAnalyticsList])

    return (
        <CryptoAnalyticsErrorBoundary>
            <div className="crypto-analytics-scene">
                {hasError && (
                    <Alert
                        type="error"
                        message={error?.message}
                        description={error?.type === ErrorType.NETWORK_ERROR 
                            ? 'Please check your internet connection and try again.'
                            : 'An error occurred while loading the data.'
                        }
                        action={<LemonButton onClick={() => retryFailedOperation()}>Retry</LemonButton>}
                        closable
                        onClose={() => clearError()}
                        className="mb-4"
                    />
                )}
                {isLoading ? (
                    <LoadingState />
                ) : (
                    <div className="analytics-list">
                        {analyticsList.length > 0 ? (
                            analyticsList.map((analytic) => (
                                <AnalyticCard key={analytic.id} analytic={analytic} />
                            ))
                        ) : (
                            <p>No analytics found.</p>
                        )}
                    </div>
                )}
                {/* Add the button to navigate to the active users graph */}
                <LemonButton onClick={() => navigateToType('active_users')}>View Active Users Graph</LemonButton>
            </div>
        </CryptoAnalyticsErrorBoundary>
    )
}

export const scene: SceneExport = {
    component: CryptoAnalyticsScene,
    logic: cryptoAnalyticsLogic
}