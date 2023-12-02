import React from 'react';
import { GenericTimeSeriesGraph } from './GenericTimeSeriesGraph';
import GenericDistributionGraph from './GenericDistributionGraph';
import { CampaignAnalytic } from './CryptoType';
import './CryptoDashboard.scss';

interface DashboardProps {
  campaignAnalytics: CampaignAnalytic[];
}

const CryptoDashboard: React.FC<DashboardProps> = ({ campaignAnalytics }) => {
  const activeUsersData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.active_users }));
  const totalContractCallsData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.total_contract_calls }));
  const totalTokenTransferData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.tot_tokens_transferred }));
  const aveGasUsedData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.ave_gas_used }));
  const totalTxnData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.tot_txns }));
  const totalTokTransferData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.tot_tokens_transferred }));
  const totalTokTransferValueData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.token_transfer_value }));
  const aveTokTransferValueData = campaignAnalytics.map(item => ({ timestamp: item.creation_ts, value: item.ave_token_transfer_value }));

  const transactionValueDistribution = campaignAnalytics.length > 0 ? campaignAnalytics[0].transaction_value_distribution : {};

  
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
          data={transactionValueDistribution} 
          graphType="bar" // or "pie" based on your preference
        />
      </div>
      {/* Add more graphs wrapped in div.graph-container */}
    </div>
  );
};

export default CryptoDashboard;
