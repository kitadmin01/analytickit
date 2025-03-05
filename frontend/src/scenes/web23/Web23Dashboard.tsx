import React from 'react'
import { useValues } from 'kea'
import { Card, Col, Row, Tabs } from 'antd'
import { web23Logic } from './web23Logic'
import { Web23FunnelViz } from './Web23FunnelViz'
import { Web23WeeklyMetrics } from './Web23WeeklyMetrics'
import { Web23CampaignPerformance } from './Web23CampaignPerformance'
import { Web23DeviceAnalytics } from './Web23DeviceAnalytics'
import { Web23ConversionMetrics } from './Web23ConversionMetrics'
import { LemonSpin } from 'lib/components/LemonSpin/LemonSpin'
import { InsightEmptyState } from 'scenes/insights/EmptyStates'
import './Web23Dashboard.scss'

export function Web23Dashboard(): JSX.Element {
    const { funnelData, funnelDataLoading, insightProps } = useValues(web23Logic)
    
    if (funnelDataLoading) {
        return <LemonSpin className="text-center" />
    }
    
    if (!funnelData) {
        return <InsightEmptyState />
    }

    return (
        <div className="web23-dashboard">
            <h1>Web2 to Web3 User Journey Analytics</h1>
            
            <Row gutter={[16, 16]} className="web23-summary-metrics">
                <Col span={6}>
                    <Card className="metric-card">
                        <h3>Total Visits</h3>
                        <div className="metric-value">{funnelData.summary.total_visits}</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="metric-card">
                        <h3>Engagement Events</h3>
                        <div className="metric-value">{funnelData.summary.total_engagement}</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="metric-card">
                        <h3>Conversions</h3>
                        <div className="metric-value">{funnelData.summary.total_conversions}</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="metric-card">
                        <h3>Conversion Rate</h3>
                        <div className="metric-value">{funnelData.summary.overall_conversion_rate}%</div>
                    </Card>
                </Col>
            </Row>
            
            <Tabs defaultActiveKey="funnel">
                <Tabs.TabPane tab="Funnel Visualization" key="funnel">
                    <Web23FunnelViz />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Weekly Trends" key="weekly">
                    <Web23WeeklyMetrics />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Campaign Performance" key="campaign">
                    <Web23CampaignPerformance />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Device Analytics" key="device">
                    <Web23DeviceAnalytics />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Conversion Metrics" key="conversion">
                    <Web23ConversionMetrics />
                </Tabs.TabPane>
            </Tabs>
        </div>
    )
} 