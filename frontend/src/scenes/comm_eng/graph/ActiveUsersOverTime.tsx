import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CampaignAnalytic {
  id: number;
  creation_ts: string;
  active_users: number;
  // ... other properties
}

interface ActiveUsersOverTimeProps {
  data: CampaignAnalytic[] | undefined;
}

export const ActiveUsersOverTime: React.FC<ActiveUsersOverTimeProps> = ({ data }) => {
  console.log("Received data in ActiveUsersOverTime:", data); // Add this line

  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data available</div>;
  }

  const sortedData = [...data].sort((a, b) => new Date(a.creation_ts).getTime() - new Date(b.creation_ts).getTime());

  const chartData = {
    labels: sortedData.map(d => new Date(d.creation_ts).toLocaleDateString()),
    datasets: [
      {
        label: 'Number of Active Users',
        data: sortedData.map(d => d.active_users),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div>
      <h2>Active Users Over Time</h2>
      <Line data={chartData} />
    </div>
  );
};
