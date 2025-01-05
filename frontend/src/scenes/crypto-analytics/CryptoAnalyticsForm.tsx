// frontend/src/scenes/crypto-analytics/CryptoAnalyticsForm.tsx
import { Form, Input, Card, Space } from 'antd'
import { useActions, useValues } from 'kea'
import { LemonButton, LemonSelect } from '@analytickit/lemon-ui'
import { cryptoAnalyticsLogic } from './cryptoAnalyticsLogic'
import { FILTER_RANGES } from './constants'
import { CryptoAnalytic } from './types'

interface CryptoAnalyticsFormProps {
    initialValues?: Partial<CryptoAnalytic>
    onSubmit: (values: Partial<CryptoAnalytic>) => void
    onCancel: () => void
}

export function CryptoAnalyticsForm({ initialValues, onSubmit, onCancel }: CryptoAnalyticsFormProps): JSX.Element {
    const [form] = Form.useForm()
    const { createAnalyticLoading, updateAnalyticLoading } = useValues(cryptoAnalyticsLogic)

    const handleSubmit = async (values: any) => {
        await onSubmit({
            ...values,
            filters: {
                ...values.filters,
                // Parse range values from string back to objects
                ...Object.keys(values.filters || {}).reduce((acc, key) => {
                    if (typeof values.filters[key] === 'string' && values.filters[key].includes('{')) {
                        acc[key] = JSON.parse(values.filters[key])
                    }
                    return acc
                }, {}),
            },
        })
    }

    return (
        <Card>
            <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit}>
                <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
                    <Input placeholder="Analysis name" />
                </Form.Item>

                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} placeholder="Describe your analysis" />
                </Form.Item>

                <Card title="Filters" className="mb-4">
                    {Object.entries(FILTER_RANGES).map(([key, config]) => (
                        <Form.Item key={key} name={['filters', key]} label={config.label}>
                            <LemonSelect
                                options={
                                    config.ranges
                                        ? config.ranges.map((range) => ({
                                              label: range.label,
                                              value: JSON.stringify({ min: range.min, max: range.max }),
                                          }))
                                        : config.options?.map((option) => ({
                                              label: option,
                                              value: option,
                                          }))
                                }
                            />
                        </Form.Item>
                    ))}
                </Card>

                <Space>
                    <LemonButton
                        type="primary"
                        htmlType="submit"
                        loading={createAnalyticLoading || updateAnalyticLoading}
                    >
                        {initialValues ? 'Update' : 'Create'} Analysis
                    </LemonButton>
                    <LemonButton type="secondary" onClick={onCancel}>
                        Cancel
                    </LemonButton>
                </Space>
            </Form>
        </Card>
    )
}
