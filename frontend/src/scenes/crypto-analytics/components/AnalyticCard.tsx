import React from 'react'
import { Card } from 'antd'
import { CryptoAnalytic } from '../types'
import { useActions } from 'kea'
import { cryptoAnalyticsSceneLogic } from '..'

interface AnalyticCardProps {
    analytic: CryptoAnalytic
}

export function AnalyticCard({ analytic }: AnalyticCardProps): JSX.Element {
    const { navigateToDetail } = useActions(cryptoAnalyticsSceneLogic)

    return (
        <Card title={analytic.name} onClick={() => navigateToDetail(analytic.id)} className="analytic-card">
            <p>{analytic.description}</p>
            <div className="created-at">Created: {analytic.created_at}</div>
        </Card>
    )
}
