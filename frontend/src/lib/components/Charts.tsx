import React from 'react'
import GenericBarGraph from 'scenes/comm_eng/graph/GenericBarGraph'
import GenericLineGraph from 'scenes/comm_eng/graph/GenericLineGraph'
import GenericPieChart from 'scenes/comm_eng/graph/GenericPieChart'

interface ChartDataPoint {
    name: string
    value: number
}

interface LineChartProps {
    data: ChartDataPoint[]
    xAxisLabel?: string
    yAxisLabel?: string
    title?: string
}

interface BarChartProps {
    data: ChartDataPoint[]
    xAxisLabel?: string
    yAxisLabel?: string
    title?: string
}

interface PieChartProps {
    data: ChartDataPoint[]
    title?: string
}

export const LineChart: React.FC<LineChartProps> = ({ data, xAxisLabel, yAxisLabel, title }) => {
    // Transform data for GenericLineGraph
    const transformedData = data.map(item => ({
        x: item.name,
        y: item.value
    }))
    
    return (
        <GenericLineGraph 
            data={transformedData}
            xAxisLabel={xAxisLabel || 'Date'}
            yAxisLabel={yAxisLabel || 'Value'}
            title={title}
        />
    )
}

export const BarChart: React.FC<BarChartProps> = ({ data, xAxisLabel, yAxisLabel, title }) => {
    // Transform data for GenericBarGraph
    const transformedData = data.map(item => ({
        x: item.name,
        y: item.value
    }))
    
    return (
        <GenericBarGraph 
            data={transformedData}
            xAxisLabel={xAxisLabel || 'Category'}
            yAxisLabel={yAxisLabel || 'Value'}
            title={title}
        />
    )
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    // Transform data for GenericPieChart
    const transformedData = data.map(item => ({
        name: item.name,
        value: item.value
    }))
    
    return (
        <GenericPieChart 
            data={transformedData}
            title={title}
        />
    )
} 