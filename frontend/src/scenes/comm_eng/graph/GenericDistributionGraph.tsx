import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface GenericDistributionGraphProps {
    data: { [key: string]: number }; // The structure of transaction_value_distribution
    graphType: 'pie' | 'bar'; // Type of graph to display
    title: string; // Title of the graph
    description: string;
}

const GenericDistributionGraph: React.FC<GenericDistributionGraphProps> = ({ data, graphType, title, description }) => {
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: title, // Use the title prop here
                data: Object.values(data),
                backgroundColor: [
                    // Define colors for each slice or bar here
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    // ... more colors
                ],
                borderColor: [
                    // Define border colors for each slice or bar here
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    // ... more colors
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        // Chart.js options can be defined here
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: title, // Use the title prop here
            },
        },
    };

    return (
        <div>
            <h4>{title}</h4>
            <p className="graph-description">{description}</p> 
            {graphType === 'pie' ? (
                <Pie data={chartData} options={options} />
            ) : (
                <Bar data={chartData} options={options} />
            )}
        </div>
    );
};

export default GenericDistributionGraph;
