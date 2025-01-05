import React from 'react'
import { BaseVisualization } from '../BaseVisualization'
import { CryptoAnalytic } from '../types'

interface TransactionValueChartProps {
    data: CryptoAnalytic[]
    loading?: boolean
}

export function TransactionValueChart({ data, loading }: TransactionValueChartProps): JSX.Element {
    return (
        <BaseVisualization title="Transaction Value" loading={loading}>
            {/* Add chart implementation here */}
            <div>Transaction Value Chart</div>
        </BaseVisualization>
    )
}
