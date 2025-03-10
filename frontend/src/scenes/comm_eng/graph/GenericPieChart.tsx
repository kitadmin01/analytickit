import React from 'react'

interface PieChartProps {
  data: Array<{name: string, value: number}>
  title?: string
}

const GenericPieChart: React.FC<PieChartProps> = ({ data, title }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="generic-pie-chart">
      {title && <h3>{title}</h3>}
      <div className="pie-container">
        {/* Simplified pie chart representation */}
        <div className="pie-placeholder">Pie Chart Placeholder</div>
        <div className="pie-legend">
          {data.map((segment, index) => (
            <div key={index} className="legend-item">
              <div className="color-box" style={{ backgroundColor: `hsl(${index * 30}, 70%, 50%)` }}></div>
              <div className="label">{segment.name}: {segment.value} ({((segment.value / total) * 100).toFixed(1)}%)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GenericPieChart 