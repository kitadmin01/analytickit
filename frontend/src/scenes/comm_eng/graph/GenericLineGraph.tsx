import React from 'react'

interface LineGraphProps {
  data: Array<{x: string, y: number}>
  xAxisLabel?: string
  yAxisLabel?: string
  title?: string
}

const GenericLineGraph: React.FC<LineGraphProps> = ({ data, xAxisLabel, yAxisLabel, title }) => {
  return (
    <div className="generic-line-graph">
      {title && <h3>{title}</h3>}
      <div className="axis-labels">
        {xAxisLabel && <div className="x-axis-label">{xAxisLabel}</div>}
        {yAxisLabel && <div className="y-axis-label">{yAxisLabel}</div>}
      </div>
      <div className="line-container">
        {/* Simplified line graph representation */}
        <div className="line-placeholder">Line Graph Placeholder</div>
        <div className="data-points">
          {data.map((point, index) => (
            <div key={index} className="data-point">
              {point.x}: {point.y}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GenericLineGraph 