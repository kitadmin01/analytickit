import React from 'react'
import { useValues } from 'kea'
import { web23Logic } from './web23Logic'
import { Card, Col, Row } from 'antd'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

export function Web23DeviceAnalytics(): JSX.Element {
    const { funnelData } = useValues(web23Logic)
    
    if (!funnelData) {
        return <div>No data available</div>
    }
    
    // Prepare device data for chart
    const deviceLabels = Object.keys(funnelData.device_analytics.devices)
    const deviceData = Object.values(funnelData.device_analytics.devices)
    
    const deviceChartData = {
        labels: deviceLabels,
        datasets: [
            {
                data: deviceData,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                ],
                borderWidth: 1,
            },
        ],
    }
    
    // Prepare browser data for chart
    const browserLabels = Object.keys(funnelData.device_analytics.browsers)
    const browserData = Object.values(funnelData.device_analytics.browsers)
    
    const browserChartData = {
        labels: browserLabels,
        datasets: [
            {
                data: browserData,
                backgroundColor: [
                    '#36A2EB',
                    '#FF6384',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                ],
                borderWidth: 1,
            },
        ],
    }
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
    }
    
    return (
        <Card title="Device Analytics">
            <div className="web23-device-analytics">
                <p>
                    Device analytics show which devices and browsers your users are using to access your Web3
                    application.
                </p>
                
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Device Distribution" bordered={false}>
                            <div className="chart-container">
                                <Pie data={deviceChartData} options={chartOptions} />
                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Browser Distribution" bordered={false}>
                            <div className="chart-container">
                                <Pie data={browserChartData} options={chartOptions} />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Card>
    )
} 