import React from 'react'
import { useValues } from 'kea'
import { web23Logic } from './web23Logic'
import { Card, Table } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'

export function Web23WeeklyMetrics(): JSX.Element {
    const { funnelData } = useValues(web23Logic)
    
    if (!funnelData) {
        return <div>No data available</div>
    }
    
    const columns = [
        {
            title: 'Week',
            dataIndex: 'week',
            key: 'week',
            render: (week: number, record: any) => `Week ${week}: ${record.date_range}`,
        },
        {
            title: 'Visits',
            dataIndex: 'visits',
            key: 'visits',
            render: (visits: number, record: any) => (
                <div>
                    {visits}
                    {record.visits_wow !== undefined && (
                        <div className={`wow-change ${record.visits_wow >= 0 ? 'positive' : 'negative'}`}>
                            {record.visits_wow >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            {Math.abs(record.visits_wow)}%
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Engagement',
            dataIndex: 'engagement',
            key: 'engagement',
            render: (engagement: number, record: any) => (
                <div>
                    {engagement}
                    {record.engagement_wow !== undefined && (
                        <div className={`wow-change ${record.engagement_wow >= 0 ? 'positive' : 'negative'}`}>
                            {record.engagement_wow >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            {Math.abs(record.engagement_wow)}%
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Transactions',
            dataIndex: 'transactions',
            key: 'transactions',
            render: (transactions: number, record: any) => (
                <div>
                    {transactions}
                    {record.transactions_wow !== undefined && (
                        <div className={`wow-change ${record.transactions_wow >= 0 ? 'positive' : 'negative'}`}>
                            {record.transactions_wow >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            {Math.abs(record.transactions_wow)}%
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Conversion Rate',
            dataIndex: 'conversion_rate',
            key: 'conversion_rate',
            render: (rate: number, record: any) => (
                <div>
                    {rate}%
                    {record.conversion_rate_wow !== undefined && (
                        <div className={`wow-change ${record.conversion_rate_wow >= 0 ? 'positive' : 'negative'}`}>
                            {record.conversion_rate_wow >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            {Math.abs(record.conversion_rate_wow)}%
                        </div>
                    )}
                </div>
            ),
        },
    ]
    
    return (
        <Card title="Weekly Metrics">
            <div className="web23-weekly-metrics">
                <p>
                    Weekly metrics help identify trends by smoothing out daily fluctuations and providing a more
                    consistent view of performance over time.
                </p>
                
                <Table
                    dataSource={funnelData.weekly_metrics}
                    columns={columns}
                    rowKey="week"
                    pagination={false}
                />
            </div>
        </Card>
    )
} 