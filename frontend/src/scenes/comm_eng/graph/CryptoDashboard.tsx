import React, { useEffect, useState } from 'react';
import { useActions, useValues } from 'kea';
import { communityEngagementLogic } from '../CommunityEngagementService';
import GenericTimeSeriesGraph from './GenericTimeSeriesGraph';
import GenericDistributionGraph from './GenericDistributionGraph';
import GenericNetworkGraph from './GenericNetworkGraph';
import GenericHeatmap from './GenericHeatmap';
import './CryptoDashboard.scss';

interface DashboardProps {
  campaignId: number;
}

//fn aggreages most_active_token_addresses for all the days 
const aggregateMostActiveTokens = (campaignData) => {
  const aggregatedData = {};

  // Ensure campaignAnalytics is an array and has elements
  if (!Array.isArray(campaignData) || campaignData.length === 0) {
      console.log("No data in campaignAnalytics");
      return aggregatedData;
  }else{
    console.log("got campaignAnalytics=",campaignData);
  }

  campaignData.forEach(campaign => {
      // Check if most_active_token_addresses exists and is an object
      if (campaign.most_active_token_addresses && typeof campaign.most_active_token_addresses === 'object') {
          Object.entries(campaign.most_active_token_addresses).forEach(([address, activity]) => {
              if (!aggregatedData[address]) {
                  aggregatedData[address] = 0;
              }
              aggregatedData[address] += Number(activity); // Coerce activity to a number
          });
      }
  });

  return aggregatedData;
};

const aggregateTokenFlow = (campaignData) => {
  const aggregated = campaignData.reduce((acc, analytic) => {
      if (Array.isArray(analytic.token_flow)) {
          return acc.concat(analytic.token_flow);
      }
      return acc;
  }, []);

  // Debugging: Log the aggregated token flow
  console.log("Aggregated Token Flow:", aggregated);
  return aggregated;
};
const CryptoDashboard: React.FC<DashboardProps> = ({ campaignId }) => {
  const { campaignAnalytics } = useValues(communityEngagementLogic);
  const { fetchCampaignAnalytic } = useActions(communityEngagementLogic);
  const [isLoading, setIsLoading] = useState(true);
  const [aggregatedTokenFlow, setAggregatedTokenFlow] = useState([]);
  const [aggregatedMostActiveTokens, setAggregatedMostActiveTokens] = useState({});



  useEffect(() => {
    const fetchData = async () => {
      if (!campaignAnalytics[campaignId]) {
        await fetchCampaignAnalytic(campaignId);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [campaignId, campaignAnalytics, fetchCampaignAnalytic]);

  useEffect(() => {
    if (campaignAnalytics[campaignId]) {
      const campaignData = campaignAnalytics[campaignId];
      setAggregatedTokenFlow(aggregateTokenFlow(campaignData));
      setAggregatedMostActiveTokens(aggregateMostActiveTokens(campaignData));
    }
  }, [campaignAnalytics, campaignId]); // This effect runs when campaignAnalytics or campaignId changes


  if (isLoading || !campaignAnalytics[campaignId]) {
    return <div>Loading...</div>;
  }

  const campaignData = campaignAnalytics[campaignId];

  // Aggregate and prepare data for graphs
  const activeUsersData = campaignData.map(item => ({ timestamp: item.creation_ts, value: item.active_users }));
  const totalContractCallsData = campaignData.map(item => ({ timestamp: item.creation_ts, value: item.total_contract_calls }));
  const totalTokenTransferData = campaignData.map(item => ({ timestamp: item.creation_ts, value: item.tot_tokens_transferred }));
  const aveGasUsedData = campaignData.map(item => ({ timestamp: item.creation_ts, value: item.ave_gas_used }));
  const totalTxnData = campaignData.map(item => ({ timestamp: item.creation_ts, value: item.tot_txns }));
  const totalTokTransferData = campaignData.map(item => ({ timestamp: item.creation_ts, value: item.tot_tokens_transferred }));
  const totalTokTransferValueData = campaignData.map(item => ({ timestamp: item.creation_ts, value: item.token_transfer_value }));
  const aveTokTransferValueData = campaignData.map(item => ({ timestamp: item.creation_ts, value: item.ave_token_transfer_value }));
  //for distribution graph
  const txnValDist = campaignData.length > 0 ? campaignData[0].transaction_value_distribution : {};
  const tokenTransferValDist = campaignData.length > 0 ? campaignData[0].token_transfer_value_distribution : {};


  // Prepare data for heatmap
  const xLabels = campaignData.map(item => item.creation_ts.split('T')[0]); // Dates as x-labels
  const yLabels = ['Active Users', 'Total Contract Calls']; // Two y-labels
  const heatmapData = campaignData.map(item => [item.active_users, item.total_contract_calls]);



  return (
    <div className="crypto-dashboard">

      <div className="graph-container">
        <GenericTimeSeriesGraph 
          data={activeUsersData}
          title="Active Users Over Time"
          yAxisLabel="Active Users"
        />
        <GenericTimeSeriesGraph 
          data={totalContractCallsData}
          title="Total Contract Calls Over Time"
          yAxisLabel="Contract Calls"
        />
        <GenericTimeSeriesGraph 
          data={totalTokenTransferData}
          title="Total Token Transfers Over Time"
          yAxisLabel="Token Transfers"
        />
        <GenericTimeSeriesGraph 
          data={aveGasUsedData}
          title="Average Gas Used Over Time"
          yAxisLabel="Ave Gas Used"
        />
        <GenericTimeSeriesGraph 
          data={totalTxnData}
          title="Total Transactions Over Time"
          yAxisLabel="Total Transactions"
        />
        <GenericTimeSeriesGraph 
          data={totalTxnData}
          title="Total Transactions Over Time"
          yAxisLabel="Total Transactions"
        />
        <GenericTimeSeriesGraph 
          data={totalTokTransferData}
          title="Total Token Transfers Over Time"
          yAxisLabel="Total Token Transfers"
        />
        <GenericTimeSeriesGraph 
          data={totalTokTransferData}
          title="Total Token Transfers Over Time"
          yAxisLabel="Total Token Transfers"
        />
        <GenericTimeSeriesGraph 
          data={totalTokTransferValueData}
          title="Total Token Transfer Value Over Time"
          yAxisLabel="Total Token Transfer Value"
        />
        <GenericTimeSeriesGraph 
          data={aveTokTransferValueData}
          title="Average Token Transfer Value Over Time"
          yAxisLabel="Ave Token Transfer Value"
        />
          {/* Distribution Graph */}
        <GenericDistributionGraph 
          data={txnValDist} 
          graphType="bar" // or "pie" based on your preference
        />
        <GenericDistributionGraph 
          data={tokenTransferValDist} 
          graphType="bar" // or "pie" based on your preference
        />
        {/* Network Graph for Most Active Token Addresses 
        The aggregateMostActiveTokens function provides data to visually represent the nodes in the graph, possibly indicating which addresses are most active.
        The aggregateTokenFlow function provides data for the edges, showing how tokens move between these addresses.*/}
        <GenericNetworkGraph 
          tokenFlow={aggregatedTokenFlow}
          mostActiveTokenAddresses={aggregatedMostActiveTokens}
          title="Token flow between addresses" 
          width={400} // Adjust as needed
          height={400} // Adjust as needed
        />
        {/*heatmp */}
        <div>
          <GenericHeatmap data={heatmapData} xLabels={xLabels} yLabels={yLabels} />
        </div>
      </div>
      {/* Add more graphs wrapped in div.graph-container */}
    </div>
  );
};

export default CryptoDashboard;
