// frontend/src/scenes/crypto-analytics/CryptoAnalyticsDetailScene.tsx
import React from 'react'
import { useActions, useValues } from 'kea'
import { useEffect } from 'react'
import { cryptoAnalyticsSceneLogic } from '.'
import { cryptoAnalyticsLogic } from './cryptoAnalyticsLogic'
import { SceneExport } from 'scenes/sceneTypes'
import { PageHeader } from 'lib/components/PageHeader'
import { LemonButton } from '@analytickit/lemon-ui'
import { router } from 'kea-router'
import { LoadingState } from './components/LoadingState'

export function CryptoAnalyticsDetailScene(): JSX.Element {
    const { searchParams } = useValues(router)
    const id = searchParams.id
    const { navigateToEdit, navigateToList } = useActions(cryptoAnalyticsSceneLogic)
    const { analytic, isLoading } = useValues(cryptoAnalyticsLogic)
    const { loadAnalytic } = useActions(cryptoAnalyticsLogic)

    useEffect(() => {
        if (id) {
            loadAnalytic(id)
        }
    }, [id])

    return (
        <div className="crypto-analytics-detail-scene">
            {isLoading ? (
                <LoadingState />
            ) : (
                <PageHeader
                    title={analytic?.name || 'Crypto Analytics Detail'}
                    buttons={
                        <>
                            <LemonButton
                                onClick={() => navigateToList()}
                            >
                                Back to List
                            </LemonButton>
                            <LemonButton
                                onClick={() => navigateToEdit(id)}
                            >
                                Edit
                            </LemonButton>
                        </>
                    }
                />
            )}
            {/* Rest of your component */}
        </div>
    )
}

export const scene: SceneExport = {
    component: CryptoAnalyticsDetailScene,
    logic: cryptoAnalyticsSceneLogic,
}