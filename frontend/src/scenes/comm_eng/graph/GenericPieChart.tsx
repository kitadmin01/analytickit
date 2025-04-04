import React from 'react'
import { Progress, Row, Col } from 'antd'

interface PieChartProps {
  data: Array<{name: string, value: number}>
  title?: string
}

const GenericPieChart: React.FC<PieChartProps> = ({ data, title }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      {title && <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>{title}</h3>}
      <Row gutter={[16, 16]} justify="center">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          return (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Progress
                  type="circle"
                  percent={percentage}
                  format={(percent) => `${percent?.toFixed(1)}%`}
                  strokeColor={`hsl(${(index * 360) / data.length}, 70%, 50%)`}
                />
                <div style={{ marginTop: '8px', fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ color: '#666' }}>Value: {item.value}</div>
              </div>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

export default GenericPieChart 