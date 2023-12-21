import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface DualAxisBarGraphProps {
    data: {
        labels: string[];
        totalGasUsed: number[];
        totalCost: number[];
    };
    title: string;
    description: string;
}

const DualAxisBarGraph: React.FC<DualAxisBarGraphProps> = ({ data, title, description }) => {
    // Ensure that data is valid before proceeding
    if (!data || !data.labels || data.labels.length === 0) {
        return <div>No data available</div>;
    }

    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Total Gas Used',
                data: data.totalGasUsed,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-gas',
            },
            {
                label: 'Total Cost',
                data: data.totalCost,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-cost',
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            'y-axis-gas': {
                type: 'linear',
                display: true,
                position: 'left',
            },
            'y-axis-cost': {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: title,
            },
        },
    };

    return (
        <div>
            <h4>{title}</h4>
            <p className="graph-description">{description}</p>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default DualAxisBarGraph;
