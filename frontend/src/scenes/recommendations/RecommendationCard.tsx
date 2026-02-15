import React from 'react'
import { Card, Tag, Button, Typography, Space } from 'antd'
import {
    AlertOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    RiseOutlined,
    SwapOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    WarningOutlined,
} from '@ant-design/icons'
import { Recommendation } from './recommendationsLogic'

const { Text, Paragraph } = Typography

const CATEGORY_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    engagement: { color: 'blue', icon: <TeamOutlined />, label: 'Engagement' },
    transaction: { color: 'green', icon: <SwapOutlined />, label: 'Transaction' },
    campaign: { color: 'purple', icon: <RiseOutlined />, label: 'Campaign' },
    churn: { color: 'red', icon: <WarningOutlined />, label: 'Churn Risk' },
    growth: { color: 'cyan', icon: <ThunderboltOutlined />, label: 'Growth' },
    anomaly: { color: 'orange', icon: <AlertOutlined />, label: 'Anomaly' },
}

const SEVERITY_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    info: { color: '#1890ff', icon: <InfoCircleOutlined /> },
    warning: { color: '#faad14', icon: <ExclamationCircleOutlined /> },
    action_required: { color: '#ff4d4f', icon: <AlertOutlined /> },
}

interface RecommendationCardProps {
    recommendation: Recommendation
    onActedOn: () => void
}

export function RecommendationCard({ recommendation, onActedOn }: RecommendationCardProps): JSX.Element {
    const category = CATEGORY_CONFIG[recommendation.category] || CATEGORY_CONFIG.engagement
    const severity = SEVERITY_CONFIG[recommendation.severity] || SEVERITY_CONFIG.info

    return (
        <Card
            style={{
                marginBottom: 16,
                borderLeft: `4px solid ${severity.color}`,
                opacity: recommendation.is_acted_on ? 0.7 : 1,
            }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        <Tag color={category.color} icon={category.icon}>
                            {category.label}
                        </Tag>
                        <Tag
                            color={
                                recommendation.severity === 'action_required'
                                    ? 'error'
                                    : recommendation.severity === 'warning'
                                    ? 'warning'
                                    : 'processing'
                            }
                        >
                            {severity.icon}{' '}
                            {recommendation.severity === 'action_required'
                                ? 'Action Required'
                                : recommendation.severity.charAt(0).toUpperCase() + recommendation.severity.slice(1)}
                        </Tag>
                    </Space>
                    {recommendation.is_acted_on ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            Acted On
                        </Tag>
                    ) : (
                        <Button size="small" type="primary" ghost onClick={onActedOn}>
                            Mark as Acted On
                        </Button>
                    )}
                </div>

                <Text strong style={{ fontSize: 16 }}>
                    {recommendation.title}
                </Text>

                <Paragraph style={{ marginBottom: 8 }}>{recommendation.detail}</Paragraph>

                <div
                    style={{
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: 4,
                        padding: '8px 12px',
                    }}
                >
                    <Text strong style={{ color: '#52c41a' }}>
                        Suggested Action:
                    </Text>{' '}
                    <Text>{recommendation.suggested_action}</Text>
                </div>

                {recommendation.metric_references && recommendation.metric_references.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                        {recommendation.metric_references.map((metric) => (
                            <Tag key={metric} style={{ fontSize: 11 }}>
                                {metric}
                            </Tag>
                        ))}
                    </div>
                )}
            </Space>
        </Card>
    )
}
