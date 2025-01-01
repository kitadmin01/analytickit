// frontend/src/scenes/crypto-analytics/CryptoAnalyticsGraph.tsx
import React, { useMemo } from 'react'
import { LineGraph } from '../insights/views/LineGraph/LineGraph'
import { Card, Spin } from 'antd'
import { GraphType, GraphDataset } from '~/types'
import { FILTER_RANGES } from './constants'

interface LineGraphProps {
    datasets: GraphDataset[]
    labels: string[]
    type: GraphType
    labelGroupType: "none" | "people" | number
    incompletenessOffsetFromEnd: number
    tooltip: { showHeader: boolean }
    filters: any
    label: string
    'data-attr': string
}

interface GraphProps {
    data: any[]
    filters: {
        token_type?: string
        activeFilter: keyof typeof FILTER_RANGES
        // ... other filter properties
    }
    loading?: boolean
}

export function CryptoAnalyticsGraph({ data, filters, loading }: GraphProps): JSX.Element {
    const graphData = useMemo(() => [{
        data: data.map(item => Number(item.value)),
        label: filters.activeFilter,
        type: GraphType.Line,
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.1)',
        borderWidth: 2,
        tension: 0.1
    }], [data, filters])

    const lineGraphProps: LineGraphProps = {
        datasets: graphData,
        labels: data.map(item => new Date(item.date).toLocaleDateString()),
        type: GraphType.Line,
        labelGroupType: "none",
        incompletenessOffsetFromEnd: 0,
        tooltip: { showHeader: true },
        filters: filters,
        label: FILTER_RANGES[filters.activeFilter]?.label || 'Value',
        'data-attr': 'crypto-analytics-graph'
    }

    return (
        <Card className="crypto-analytics-graph">
            <Spin spinning={loading}>
                <LineGraph {...lineGraphProps} />
            </Spin>
        </Card>
    )
}