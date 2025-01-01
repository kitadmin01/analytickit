import React from 'react'
import { BaseVisualization } from '../BaseVisualization'
import { CryptoAnalytic } from '../types'

interface TokenDistributionChartProps {
    data: CryptoAnalytic[]
    loading?: boolean
}

export function TokenDistributionChart({ data, loading }: TokenDistributionChartProps): JSX.Element {
    return (
        <BaseVisualization title="Token Distribution" loading={loading}>
            {/* Add chart implementation here */}
            <div>Token Distribution Chart</div>
        </BaseVisualization>
    )
} 