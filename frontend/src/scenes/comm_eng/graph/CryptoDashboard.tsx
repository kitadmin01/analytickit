import React, { useEffect, useState } from 'react';
import { ActiveUsersOverTime } from './ActiveUsersOverTime';
import { ApiResponse } from './CryptoType';
import { communityEngagementLogic } from '../CommunityEngagementService';
import { useActions } from 'kea';

const CryptoDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<ApiResponse>([]);
  const { fetchCampaignAnalytic } = useActions(communityEngagementLogic);

  const fetchData = async () => {
    try {
      const response: ApiResponse = await fetchCampaignAnalytic(1); // Replace 1 with the actual campaign ID
      setAnalyticsData(response);
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Crypto Dashboard</h1>
      {/* Render the Active Users Over Time graph with the fetched data */}
      <ActiveUsersOverTime data={analyticsData} />
    </div>
  );
};

export default CryptoDashboard;
