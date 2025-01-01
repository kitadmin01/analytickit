// frontend/src/scenes/crypto-analytics/CryptoAnalyticsEditScene.tsx
import React from 'react'
import { useActions, useValues } from 'kea'
import { useEffect } from 'react'
import { cryptoAnalyticsSceneLogic } from '.'
import { cryptoAnalyticsLogic } from './cryptoAnalyticsLogic'
import { SceneExport } from 'scenes/sceneTypes'
import { PageHeader } from 'lib/components/PageHeader'
import { CryptoAnalyticsForm } from './CryptoAnalyticsForm'
import { router } from 'kea-router'
import { LoadingState } from './components/LoadingState'
import { LemonButton } from '@analytickit/lemon-ui'

export function CryptoAnalyticsEditScene(): JSX.Element {
    const { searchParams } = useValues(router)
    const id = searchParams.id
    const { navigateToDetail, navigateToList } = useActions(cryptoAnalyticsSceneLogic)
    const { analytic, isLoading } = useValues(cryptoAnalyticsLogic)
    const { loadAnalytic, updateAnalytic } = useActions(cryptoAnalyticsLogic)

    useEffect(() => {
        if (id) {
            loadAnalytic(id)
        }
    }, [id])

    const handleSubmit = async (values: any): Promise<void> => {
        await updateAnalytic(id, values)
        navigateToDetail({ id })
    }

    return (
        <div className="crypto-analytics-edit-scene">
            {isLoading ? (
                <LoadingState />
            ) : (
                <>
                    <PageHeader
                        title={id ? `Edit ${analytic?.name}` : 'New Crypto Analytics'}
                        buttons={
                            <LemonButton
                                onClick={() => navigateToList()}
                            >
                                Cancel
                            </LemonButton>
                        }
                    />
                    <CryptoAnalyticsForm
                        initialValues={analytic || undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => navigateToList()}
                    />
                </>
            )}
        </div>
    )
}

export const scene: SceneExport = {
    component: CryptoAnalyticsEditScene,
    logic: cryptoAnalyticsSceneLogic,
}