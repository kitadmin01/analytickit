import React from 'react'
import { useValues, useActions } from 'kea'
import { PageHeader } from 'lib/components/PageHeader'
import { Spinner } from 'lib/components/Spinner/Spinner'
import { recommendationsLogic } from './recommendationsLogic'
import { RecommendationCard } from './RecommendationCard'
import { SceneExport } from 'scenes/sceneTypes'
import { Select, Row, Col, Empty, Statistic, Card, Space } from 'antd'
import { BulbOutlined, CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons'

const { Option } = Select

export const scene: SceneExport = {
    component: Recommendations,
    logic: recommendationsLogic,
}

const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'transaction', label: 'Transaction Health' },
    { value: 'campaign', label: 'Campaign Attribution' },
    { value: 'churn', label: 'Churn Risk' },
    { value: 'growth', label: 'Growth Opportunity' },
    { value: 'anomaly', label: 'Anomaly Detection' },
]

export function Recommendations(): JSX.Element {
    const { recommendations, recommendationsLoading, dateFilter, categoryFilter } = useValues(recommendationsLogic)
    const { setDateFilter, setCategoryFilter, markAsActedOn } = useActions(recommendationsLogic)

    const actionRequired = recommendations.filter((r) => r.severity === 'action_required').length
    const warnings = recommendations.filter((r) => r.severity === 'warning').length
    const actedOn = recommendations.filter((r) => r.is_acted_on).length

    return (
        <div>
            <PageHeader
                title="AI Recommendations"
                caption="Daily insights from your combined web2 + web3 analytics data"
            />

            {/* Summary stats */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Total Insights" value={recommendations.length} prefix={<BulbOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Action Required"
                            value={actionRequired}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix={<ExclamationCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Warnings"
                            value={warnings}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Acted On"
                            value={actedOn}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Space style={{ marginBottom: 16 }}>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                />
                <Select
                    value={categoryFilter || ''}
                    onChange={(value) => setCategoryFilter(value || null)}
                    style={{ width: 200 }}
                    placeholder="Filter by category"
                >
                    {CATEGORY_OPTIONS.map((opt) => (
                        <Option key={opt.value} value={opt.value}>
                            {opt.label}
                        </Option>
                    ))}
                </Select>
            </Space>

            {/* Content */}
            {recommendationsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                    <Spinner />
                </div>
            ) : recommendations.length === 0 ? (
                <Empty
                    description={
                        dateFilter
                            ? 'No recommendations found for this date. Try a different date or clear the filter.'
                            : 'No recommendations yet. They are generated daily at 6 AM UTC.'
                    }
                />
            ) : (
                <div>
                    {recommendations
                        .sort((a, b) => {
                            const severityOrder = { action_required: 0, warning: 1, info: 2 }
                            return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2)
                        })
                        .map((rec) => (
                            <RecommendationCard
                                key={rec.id}
                                recommendation={rec}
                                onActedOn={() => markAsActedOn(rec.id)}
                            />
                        ))}
                </div>
            )}
        </div>
    )
}

export default Recommendations
