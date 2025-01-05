// frontend/src/scenes/crypto-analytics/components/ErrorBoundary.tsx
import React from 'react'
import { Alert, Button } from 'antd'

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class CryptoAnalyticsErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('Crypto Analytics Error:', error, errorInfo)
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null })
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <Alert
                    type="error"
                    message="Something went wrong"
                    description={this.state.error?.message}
                    action={<Button onClick={this.handleRetry}>Retry</Button>}
                />
            )
        }

        return this.props.children
    }
}
