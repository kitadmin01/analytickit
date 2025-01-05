// frontend/src/scenes/crypto-analytics/components/LoadingState.tsx
import React from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface LoadingStateProps {
    size?: 'small' | 'default' | 'large'
    text?: string
    overlay?: boolean
}

export function LoadingState({
    size = 'default',
    text = 'Loading...',
    overlay = false,
}: LoadingStateProps): JSX.Element {
    const spinner = (
        <Spin
            size={size}
            indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 24 : 16 }} spin />}
            tip={text}
        />
    )

    if (overlay) {
        return <div className="loading-overlay">{spinner}</div>
    }

    return spinner
}
