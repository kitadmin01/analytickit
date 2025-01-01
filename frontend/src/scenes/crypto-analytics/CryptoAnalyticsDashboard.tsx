// frontend/src/scenes/crypto-analytics/CryptoAnalyticsDashboard.tsx
import React from 'react'
import { useValues, useActions } from 'kea'
import { Row, Col } from 'antd'
import { cryptoAnalyticsLogic } from './cryptoAnalyticsLogic'
import { TokenDistributionChart } from './visualizations/TokenDistributionChart'
import { TransactionValueChart } from './visualizations/TransactionValueChart'
import { TimeSeriesChart } from './visualizations/TimeSeriesChart'
import { LemonButton } from '@analytickit/lemon-ui'
import { FILTER_RANGES } from './constants'

export function CryptoAnalyticsDashboard(): JSX.Element {
    const { 
        analyticsList, 
        isLoading, 
        dateRange,
        selectedMetrics 
    } = useValues(cryptoAnalyticsLogic)
    const { setDateRange, toggleMetric } = useActions(cryptoAnalyticsLogic)

    return (
        <div className="crypto-analytics-dashboard">
            <Row gutter={[16, 16]} className="dashboard-controls">
                <Col span={24}>
                    <div className="metric-toggles">
                        {Object.keys(FILTER_RANGES).map(metric => (
                            <LemonButton
                                key={metric}
                                type={selectedMetrics.includes(metric) ? "primary" : "secondary"}
                                onClick={() => toggleMetric(metric)}
                            >
                                {FILTER_RANGES[metric].label}
                            </LemonButton>
                        ))}
                    </div>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="dashboard-visualizations">
                <Col span={12}>
                    <TokenDistributionChart
                        data={analyticsList}
                        loading={isLoading}
                    />
                </Col>
                <Col span={12}>
                    <TransactionValueChart
                        data={analyticsList}
                        loading={isLoading}
                    />
                </Col>
                {selectedMetrics.map(metric => (
                    <Col span={24} key={metric}>
                        <TimeSeriesChart
                            data={analyticsList}
                            loading={isLoading}
                            metric={metric}
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                        />
                    </Col>
                ))}
            </Row>
        </div>
    )
}