import React from 'react'
import { useValues } from 'kea'
import { web23Logic } from './web23Logic'
import { Card, Col, Row, Table } from 'antd'

export function Web23ConversionMetrics(): JSX.Element {
    const { funnelData } = useValues(web23Logic)
    
    if (!funnelData) {
        return <div>No data available</div>
    }
    
    // Transform referrer data for table display
    const referrerData = Object.entries(funnelData.conversion_metrics.referrer_distribution)
        .map(([referrer, count]) => ({
            key: referrer,
            referrer: referrer === 'no_referrer' ? 'Direct' : referrer,
            count,
            percentage: ((count / funnelData.summary.total_visits) * 100).toFixed(1) + '%',
        }))
        .sort((a, b) => b.count - a.count)
    
    const referrerColumns = [
        {
            title: 'Referrer',
            dataIndex: 'referrer',
            key: 'referrer',
        },
        {
            title: 'Visits',
            dataIndex: 'count',
            key: 'count',
            sorter: (a: any, b: any) => a.count - b.count,
        },
        {
            title: 'Percentage',
            dataIndex: 'percentage',
            key: 'percentage',
        },
    ]
    
    const { transaction_stats } = funnelData.conversion_metrics
    
    return (
        <Card title="Conversion Metrics">
            <div className="web23-conversion-metrics">
                <p>
                    Conversion metrics show how users are converting from Web2 to Web3, including referrer sources and
                    transaction statistics.
                </p>
                
                <Card title="Referrer Distribution" bordered={false}>
                    <Table
                        dataSource={referrerData}
                        columns={referrerColumns}
                        className="referrer-table"
                        pagination={{ pageSize: 5 }}
                    />
                </Card>
                
                <Card title="Transaction Statistics" bordered={false}>
                    <div className="transaction-stats">
                        <div className="stat-card">
                            <h3>Initiated Transactions</h3>
                            <div className="stat-value">{transaction_stats.initiated}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Successful Transactions</h3>
                            <div className="stat-value">{transaction_stats.successful}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Average Transaction Value</h3>
                            <div className="stat-value">
                                {transaction_stats.avg_value.toFixed(4)} ETH
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Card>
    )
} 