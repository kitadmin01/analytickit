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
  const [dashboardTitle, setDashboardTitle] = useState('');



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
  
      // Check if campaignData is not empty and has the required nested structure
      if (campaignData.length > 0 && campaignData[0].community_engagement) {
        const campaignName = campaignData[0].community_engagement.campaign_name;
        setDashboardTitle(`Community Engagement Campaign: ${campaignName}`);
      } else {
        setDashboardTitle('Community Engagement Campaign: Unknown');
      }
  
      setAggregatedTokenFlow(aggregateTokenFlow(campaignData));
      setAggregatedMostActiveTokens(aggregateMostActiveTokens(campaignData));
    }
  }, [campaignAnalytics, campaignId]);
  


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
      <h1>{dashboardTitle}</h1> {/* Display the dynamic dashboard title */}


      <div className="graph-container">
        <GenericTimeSeriesGraph 
          data={activeUsersData}
          title="Active Users Over Time"
          yAxisLabel="Active Users"
          description="This graph displays the number of active users interacting with the contract or token, plotted daily.
          It helps in understanding user engagement trends and peak activity periods."
        />
        <GenericTimeSeriesGraph 
          data={totalContractCallsData}
          title="Total Contract Calls Over Time"
          yAxisLabel="Contract Calls"
          description="Shows the daily count of contract calls, indicating how frequently the contract is being interacted with.
          Useful for gauging contract usage and identifying periods of high or low activity."
        />
        <GenericTimeSeriesGraph 
          data={totalTokenTransferData}
          title="Total Token Transfers Over Time"
          yAxisLabel="Token Transfers"
          description="Tracks the total number of token transfers each day, reflecting the token's circulation and usage.
          Helps in analyzing the token's popularity and transaction trends over time."
        />
        <GenericTimeSeriesGraph 
          data={aveGasUsedData}
          title="Average Gas Used Over Time"
          yAxisLabel="Ave Gas Used"
          description="Illustrates the daily average gas used for transactions, indicating the cost of contract interactions.
          Useful for understanding the efficiency and cost-effectiveness of contract operations."
        />
        <GenericTimeSeriesGraph 
          data={totalTxnData}
          title="Total Transactions Over Time"
          yAxisLabel="Total Transactions"
          description="Displays the total number of transactions per day, encompassing all types of contract interactions.
          Aids in assessing overall network activity and the contract's transaction volume."
        />
        <GenericTimeSeriesGraph 
          data={totalTokTransferValueData}
          title="Total Token Transfer Value Over Time"
          yAxisLabel="Total Token Transfer Value"
          description="Shows the total value of tokens transferred each day, indicating the financial volume of token movements.
          Essential for financial analysis and understanding the economic impact of token transfers."
        />
        <GenericTimeSeriesGraph 
          data={aveTokTransferValueData}
          title="Average Token Transfer Value Over Time"
          yAxisLabel="Ave Token Transfer Value"
          description="Depicts the average value of token transfers per day, offering insights into the typical transaction size.
          Helps in understanding the scale of transactions and user behavior in terms of token value."
        />
          {/* Distribution Graph */}
        <GenericDistributionGraph 
          data={txnValDist} 
          graphType="bar" // or "pie" based on your preference
          title="Transaction Value Distribution"
          description="This graph breaks down transactions into different value ranges, such as 1-10 ETH, showing the distribution of transaction sizes.
          Useful for understanding the range and commonality of transaction values within the network."
        />
        <GenericDistributionGraph 
          data={tokenTransferValDist} 
          graphType="bar" // or "pie" based on your preference
          title="Token Value Distribution"
          description="Illustrates how token values are distributed across different ranges, providing insights into the diversity of token transactions.
          Helps in analyzing the spread of token values and identifying common transaction brackets."
        />
        {/* Network Graph for Most Active Token Addresses 
        The aggregateMostActiveTokens function provides data to visually represent the nodes in the graph, possibly indicating which addresses are most active.
        The aggregateTokenFlow function provides data for the edges, showing how tokens move between these addresses.*/}
        <GenericNetworkGraph 
          tokenFlow={aggregatedTokenFlow}
          mostActiveTokenAddresses={aggregatedMostActiveTokens}
          title="Token flow between addresses" 
          description="A network graph showing addresses 
          as nodes and the value of tokens 
          transferred as edges between nodes."
          width={400} // Adjust as needed
          height={400} // Adjust as needed
        />
        {/*heatmp */}
        <div>
          <GenericHeatmap data={heatmapData} 
              xLabels={xLabels} 
              yLabels={yLabels} 
              title="Engagement Heatmap: Users and Contracts Daily" 
              description="This heatmap displays total contract calls and active user counts against dates, showing activity patterns.
              Helps in identifying trends, peak activity days, and correlations between user engagement and contract calls."
          />
        </div>
      </div>
      {/* Add more graphs wrapped in div.graph-container */}
    </div>
  );
};

export default CryptoDashboard;
