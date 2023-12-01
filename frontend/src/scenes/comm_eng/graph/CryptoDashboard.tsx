import React from 'react';
import { GenericTimeSeriesGraph } from './GenericTimeSeriesGraph';
import { CampaignAnalytic } from './CryptoType';

interface DashboardProps {
  campaignAnalytics: CampaignAnalytic[]; // Array of campaign analytics data
}

const CryptoDashboard: React.FC<DashboardProps> = ({ campaignAnalytics }) => {
  // Transform data for each graph
  const activeUsersData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.active_users }));
  const totalContractCallsData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.total_contract_calls }));
  // ... other data transformations for different graphs

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <GenericTimeSeriesGraph 
        data={activeUsersData}
        title="Active Users Over Time"
        yAxisLabel="Active Users"
      />

      {/* Add more GenericTimeSeriesGraph components for other graphs */}
    </div>
  );
};

export default CryptoDashboard;
