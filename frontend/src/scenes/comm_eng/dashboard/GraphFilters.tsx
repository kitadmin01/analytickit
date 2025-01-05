import React, { useState } from 'react'
import { DatePicker, Select } from 'antd'
import './GraphStyles.scss'

const { RangePicker } = DatePicker
const { Option } = Select

interface GraphFiltersProps {
    onFilterChange: (activityLevel: string, dateRange: [string, string] | null) => void
    activityLevels: string[]
}

export const GraphFilters: React.FC<GraphFiltersProps> = ({ onFilterChange, activityLevels }) => {
    const [activityLevel, setActivityLevel] = useState<string>('all')
    const [dateRange, setDateRange] = useState<[string, string] | null>(null)

    const handleFilterChange = () => {
        onFilterChange(activityLevel, dateRange)
    }

    return (
        <div className="graph-filters">
            <Select defaultValue="all" onChange={(value) => setActivityLevel(value)}>
                {activityLevels.map((level, idx) => (
                    <Option key={idx} value={level}>
                        {level}
                    </Option>
                ))}
            </Select>
            <RangePicker
                onChange={(dates) => setDateRange([dates[0]?.toISOString() ?? '', dates[1]?.toISOString() ?? ''])}
            />
            <button onClick={handleFilterChange}>Apply Filters</button>
        </div>
    )
}
