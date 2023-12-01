import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TimeSeriesDataPoint {
  timestamp: string; // Assuming timestamp is a string that can be converted to a Date
  value: number;
}

interface GenericTimeSeriesGraphProps {
  data: TimeSeriesDataPoint[];
  title: string;
  yAxisLabel: string;
  lineColor?: string; // Optional color for the line
}

export const GenericTimeSeriesGraph: React.FC<GenericTimeSeriesGraphProps> = ({ data, title, yAxisLabel, lineColor = 'rgb(75, 192, 192)' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data available</div>;
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
      }
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
    <div>
      <h2>{title}</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default GenericTimeSeriesGraph;
