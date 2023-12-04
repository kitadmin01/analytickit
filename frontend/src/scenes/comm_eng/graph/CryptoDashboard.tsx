import React from 'react';
import { GenericTimeSeriesGraph } from './GenericTimeSeriesGraph';
import GenericDistributionGraph from './GenericDistributionGraph';
import GenericNetworkGraph from './GenericNetworkGraph';
import { CampaignAnalytic } from './CryptoType';
import './CryptoDashboard.scss';
import React, { useEffect, useState } from 'react';


//fn aggreages most_active_token_addresses for all the days 
const aggregateMostActiveTokens = (campaignAnalytics) => {
  const aggregatedData = {};

  // Ensure campaignAnalytics is an array and has elements
  if (!Array.isArray(campaignAnalytics) || campaignAnalytics.length === 0) {
      console.log("No data in campaignAnalytics");
      return aggregatedData;
  }else{
    console.log("got campaignAnalytics=",campaignAnalytics);
  }

  campaignAnalytics.forEach(campaign => {
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

const aggregateTokenFlow = (campaignAnalytics) => {
  const aggregated = campaignAnalytics.reduce((acc, analytic) => {
      if (Array.isArray(analytic.token_flow)) {
          return acc.concat(analytic.token_flow);
      }
      return acc;
  }, []);

  // Debugging: Log the aggregated token flow
  console.log("Aggregated Token Flow:", aggregated);
  return aggregated;
};
interface DashboardProps {
  campaignAnalytics: CampaignAnalytic[];
}

const CryptoDashboard: React.FC<DashboardProps> = ({ campaignAnalytics }) => {
  const [aggregatedMostActiveTokens, setAggregatedMostActiveTokens] = useState({});
  const [aggregatedTokenFlow, setAggregatedTokenFlow] = useState([]);

  // Aggregate data when campaignAnalytics is updated
  useEffect(() => {
    if (campaignAnalytics && campaignAnalytics.length > 0) {
      setAggregatedMostActiveTokens(aggregateMostActiveTokens(campaignAnalytics));
      setAggregatedTokenFlow(aggregateTokenFlow(campaignAnalytics));
    }
  }, [campaignAnalytics]); // Dependency array ensures this runs when campaignAnalytics changes
  

  //for time series graph
  const activeUsersData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.active_users }));
  const totalContractCallsData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.total_contract_calls }));
  const totalTokenTransferData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.tot_tokens_transferred }));
  const aveGasUsedData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.ave_gas_used }));
  const totalTxnData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.tot_txns }));
  const totalTokTransferData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.tot_tokens_transferred }));
  const totalTokTransferValueData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.token_transfer_value }));
  const aveTokTransferValueData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.ave_token_transfer_value }));
  //for distribution graph
  const txnValDist = campaignAnalytics.length > 0 ? campaignAnalytics[0].transaction_value_distribution : {};
  const tokenTransferValDist = campaignAnalytics.length > 0 ? campaignAnalytics[0].token_transfer_value_distribution : {};

  
  // Aggregate most active token addresses for network graph
  const [aggregatedData, setAggregatedData] = useState({});

  useEffect(() => {
    const aggregated = aggregateMostActiveTokens(campaignAnalytics);
    setAggregatedData(aggregated);
    console.log("Aggregated Data: ", aggregated);
  }, [campaignAnalytics]); // Re-run this effect when campaignAnalytics changes



  

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
        {/* Network Graph for Most Active Token Addresses */}
        <GenericNetworkGraph 
          tokenFlow={aggregatedTokenFlow}
          mostActiveTokenAddresses={aggregatedMostActiveTokens}
          title="Token flow between addresses" 
          width={400} // Adjust as needed
          height={400} // Adjust as needed
        />
      </div>
      {/* Add more graphs wrapped in div.graph-container */}
    </div>
  );
};

export default CryptoDashboard;
