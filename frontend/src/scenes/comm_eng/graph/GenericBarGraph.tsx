import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface GenericBarGraphProps {
    data: {
        [key: string]: {
            value1: number;
            value2: number;
        };
    };
    title: string; // Title of the graph
    description: string;
    label1: string; // Label for the first dataset
    label2: string; // Label for the second dataset
}

const GenericBarGraph: React.FC<GenericBarGraphProps> = ({ data, title, description, label1, label2 }) => {
    const keys = Object.keys(data);
    const values1 = keys.map(key => data[key].value1);
    const values2 = keys.map(key => data[key].value2);

    const chartData = {
        labels: keys,
        datasets: [
            {
                label: label1,
                data: values1,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-1',
            },
            {
                label: label2,
                data: values2,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-2',
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            'y-axis-1': {
                type: 'linear',
                display: true,
                position: 'left',
            },
            'y-axis-2': {
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

export default GenericBarGraph;
