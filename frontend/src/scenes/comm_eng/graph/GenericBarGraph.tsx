import React from 'react'

interface BarGraphProps {
    data: Array<{x: string, y: number}>
    xAxisLabel?: string
    yAxisLabel?: string
    title?: string
}

const GenericBarGraph: React.FC<BarGraphProps> = ({ data, xAxisLabel, yAxisLabel, title }) => {
    return (
        <div className="generic-bar-graph">
            {title && <h3>{title}</h3>}
            <div className="axis-labels">
                {xAxisLabel && <div className="x-axis-label">{xAxisLabel}</div>}
                {yAxisLabel && <div className="y-axis-label">{yAxisLabel}</div>}
            </div>
            <div className="bar-container">
                {data.map((item, index) => (
                    <div key={index} className="bar-item">
                        <div className="bar" style={{ height: `${Math.min(item.y * 5, 200)}px` }}></div>
                        <div className="label">{item.x}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GenericBarGraph
