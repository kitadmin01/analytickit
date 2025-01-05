// frontend/src/scenes/crypto-analytics/CryptoAnalyticsFilters.tsx
import { Select, Form, Card, Divider } from 'antd'
import { FILTER_RANGES } from './constants'
import { LemonSelect } from '@analytickit/lemon-ui'

interface FilterProps {
    filters: any
    onChange: (filters: any) => void
}

export function CryptoAnalyticsFilters({ filters, onChange }: FilterProps): JSX.Element {
    const handleFilterChange = (key: string, value: any) => {
        onChange({
            ...filters,
            [key]: value,
        })
    }

    const renderRangeSelect = (filterKey: string) => {
        const filterConfig = FILTER_RANGES[filterKey]

        return (
            <Form.Item label={filterConfig.label}>
                <LemonSelect
                    value={filters[filterKey]}
                    onChange={(value) => handleFilterChange(filterKey, value)}
                    options={
                        filterConfig.ranges?.map((range) => ({
                            label: range.label,
                            value: JSON.stringify({ min: range.min, max: range.max }),
                        })) ||
                        filterConfig.options?.map((option) => ({
                            label: option,
                            value: option,
                        }))
                    }
                />
            </Form.Item>
        )
    }

    return (
        <Card title="Filters" className="crypto-analytics-filters">
            <Form layout="vertical">
                {Object.keys(FILTER_RANGES).map((filterKey) => (
                    <>
                        {renderRangeSelect(filterKey)}
                        <Divider />
                    </>
                ))}
            </Form>
        </Card>
    )
}
