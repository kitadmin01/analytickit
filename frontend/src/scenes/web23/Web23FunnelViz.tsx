import React from 'react'
import { useValues } from 'kea'
import { web23Logic } from './web23Logic'
import { Card, Col, Row } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { LemonRow } from 'lib/components/LemonRow'
import { Lettermark, LettermarkColor } from 'lib/components/Lettermark/Lettermark'
import { percentage } from 'lib/utils'

export function Web23FunnelViz(): JSX.Element {
    const { funnelData } = useValues(web23Logic)
    
    if (!funnelData) {
        return <div>No data available</div>
    }
    
    // Define the funnel steps
    const steps = [
        {
            name: 'Awareness',
            count: funnelData.summary.total_visits,
            description: 'Users who visited the website',
        },
        {
            name: 'Engagement',
            count: funnelData.summary.total_engagement,
            description: 'Users who engaged with content',
        },
        {
            name: 'Conversion',
            count: funnelData.summary.total_conversions,
            description: 'Users who completed a Web3 transaction',
        },
    ]
    
    // Calculate conversion rates between steps
    const conversionRates = [
        percentage(steps[1].count / steps[0].count, 1),
        percentage(steps[2].count / steps[1].count, 1),
    ]
    
    return (
        <Card title="Web2 to Web3 Conversion Funnel">
            <div className="web23-funnel-viz">
                <Row gutter={[16, 16]} align="middle">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <Col span={2} style={{ textAlign: 'center' }}>
                                    <div className="conversion-arrow">
                                        <ArrowRightOutlined />
                                        <div className="conversion-rate">{conversionRates[index - 1]}%</div>
                                    </div>
                                </Col>
                            )}
                            <Col span={index === 0 ? 8 : 7}>
                                <div className={`funnel-step step-${index + 1}`}>
                                    <LemonRow
                                        icon={<Lettermark name={index + 1} color={LettermarkColor.Gray} />}
                                        className="step-header"
                                    >
                                        <h3>{step.name}</h3>
                                    </LemonRow>
                                    <div className="step-count">{step.count}</div>
                                    <div className="step-description">{step.description}</div>
                                </div>
                            </Col>
                        </React.Fragment>
                    ))}
                </Row>
                
                <div className="funnel-metrics">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Card size="small">
                                <h4>Overall Conversion Rate</h4>
                                <div className="metric-value">
                                    {percentage(steps[2].count / steps[0].count, 1)}%
                                </div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small">
                                <h4>Unique Wallets</h4>
                                <div className="metric-value">{funnelData.summary.unique_wallets}</div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small">
                                <h4>Date Range</h4>
                                <div className="metric-value">
                                    {funnelData.metadata.from_date} to {funnelData.metadata.to_date}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </Card>
    )
} 