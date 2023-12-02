import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import CrosshairPlugin from 'chartjs-plugin-crosshair';
import './CryptoDashboard.scss'; // Import the SCSS file

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

interface GenericTimeSeriesGraphProps {
  data: TimeSeriesDataPoint[];
  title: string;
  yAxisLabel: string;
  lineColor?: string;
  useCrosshair?: boolean;
}

export const GenericTimeSeriesGraph: React.FC<GenericTimeSeriesGraphProps> = ({
  data, title, yAxisLabel, lineColor = 'rgb(75, 192, 192)', useCrosshair = false
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  if (useCrosshair) {
    ChartJS.register(CrosshairPlugin);
  }

  const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const chartData = {
    labels: sortedData.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: yAxisLabel,
        data: sortedData.map(d => d.value),
        fill: false,
        borderColor: lineColor,
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title
      },
      legend: {
        display: false
      },
      crosshair: useCrosshair ? {
        // Configure the crosshair plugin here
      } : false
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel
        }
      }
    }
  };

  return (
    <div className="time-series-graph">
      <h2>{title}</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default GenericTimeSeriesGraph;
