import React from 'react';
import { Chart } from 'react-chartjs-2';

const GenericHeatmap = ({ data, xLabels, yLabels }) => {
  const chartData = {
    labels: xLabels,
    datasets: yLabels.map((label, index) => ({
      label: label,
      data: data.map(d => d[index]),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    })),
  };

  const options = {
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  return <Chart type="bar" data={chartData} options={options} />;
};

export default GenericHeatmap;
