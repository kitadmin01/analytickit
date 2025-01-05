// frontend/src/scenes/crypto-analytics/visualizations/LineChart.tsx
import React from 'react'
import { BaseVisualization } from '../BaseVisualization'
import { CryptoAnalytic } from '../types'
import { Line } from 'react-chartjs-2'

interface LineChartProps {
    data: CryptoAnalytic[]
    loading?: boolean
    type: string
}

export function LineChart({ data, loading, type }: LineChartProps): JSX.Element {
    const chartData = {
        labels: data.map((item) => new Date(item.created_at).toLocaleDateString()),
        datasets: [
            {
                label: type.replace('_', ' '),
                data: data.map((item) => item.filters[type]),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${type.replace('_', ' ')} Over Time`,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    }

    return (
        <BaseVisualization title={`${type.replace('_', ' ')} Trend`} loading={loading}>
            {data.length > 0 ? (
                <div style={{ height: '400px' }}>
                    <Line data={chartData} options={options} />
                </div>
            ) : (
                <div>No data available for this type</div>
            )}
        </BaseVisualization>
    )
}
