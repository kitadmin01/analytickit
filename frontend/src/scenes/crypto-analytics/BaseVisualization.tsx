// frontend/src/scenes/crypto-analytics/visualizations/BaseVisualization.tsx
import React from 'react'
import { Card, Spin } from 'antd'

interface BaseVisualizationProps {
    title: string
    loading?: boolean
    children: React.ReactNode
}

export function BaseVisualization({ title, loading, children }: BaseVisualizationProps): JSX.Element {
    return (
        <Card title={title} className="crypto-visualization-card">
            <Spin spinning={!!loading}>
                {children}
            </Spin>
        </Card>
    )
}