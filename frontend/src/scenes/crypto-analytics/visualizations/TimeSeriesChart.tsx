import React from 'react'
import { BaseVisualization } from '../BaseVisualization'

interface TimeSeriesChartProps {
    loading?: boolean
    metric: string
}

export function TimeSeriesChart({ loading, metric }: TimeSeriesChartProps): JSX.Element {
    return (
        <BaseVisualization title={`${metric} Over Time`} loading={loading}>
            {/* Add chart implementation here */}
            <div>Time Series Chart for {metric}</div>
        </BaseVisualization>
    )
}
