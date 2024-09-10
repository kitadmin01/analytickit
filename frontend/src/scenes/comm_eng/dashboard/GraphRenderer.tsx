import React from 'react';
import { Line } from 'react-chartjs-2';

interface GraphRendererProps {
    data: any; // Graph data object containing multiple datasets
    xKey: string; // Key for the X-axis (e.g., 'date')
    yKey: string; // Key for the Y-axis (e.g., 'active_users')
    graphType: 'TimeSeries' | 'Distribution' | 'NetworkGraph' | 'Heatmap';
}

export const GraphRenderer: React.FC<GraphRendererProps> = ({ data, xKey, yKey, graphType }) => {
    // Handle the case where data is an object with multiple arrays
    const graphData = data?.[yKey]; // This ensures we extract only the relevant dataset (e.g., activeUsers)

    if (!Array.isArray(graphData)) {
        return <div>Error: Data is not an array.</div>;
    }

    const chartData = {
        labels: graphData.map((item) => new Date(item[xKey]).toLocaleDateString()), // Format date for X-axis
        datasets: [
            {
                label: yKey.replace('_', ' '), // Make the label user-friendly
                data: graphData.map((item) => item[yKey]), // Extract Y-axis data
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: yKey.replace('_', ' '),
                },
            },
        },
    };

    return (
        <div className="graph-renderer">
            <Line data={chartData} options={options} />
        </div>
    );
};
