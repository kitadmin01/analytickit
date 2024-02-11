import React, { useEffect, useState } from 'react';
import { useActions, useValues } from 'kea';
import { communityEngagementLogic } from '../comm_eng/CommunityEngagementService';
import GenericDistributionGraph from '../comm_eng/graph/GenericDistributionGraph';
import DualAxisBarGraph from './DualAxisBarGraph'; 
import GenericHeatmap from '../comm_eng/graph/GenericHeatmap';
import GenericNetworkGraph from '../comm_eng/graph/GenericNetworkGraph';
import GenericTimeSeriesGraph from '../comm_eng/graph/GenericTimeSeriesGraph';
import GenericBarGraph from '../comm_eng/graph/GenericBarGraph';
import '../comm_eng/graph/CryptoDashboard.scss';


interface DashboardProps {
  teamId: number;
}



const WalletDashboard: React.FC<DashboardProps> = ({ teamId }) => {
  const { walletAnalytics } = useValues(communityEngagementLogic);
  const { fetchWalletAnalytic } = useActions(communityEngagementLogic);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionVolumeData, setTransactionVolumeData] = useState({});
  const [gasUsageData, setGasUsageData] = useState({});
  const [gasUsageAndCostData, setGasUsageAndCostData] = useState({
    labels: [],
    totalGasUsed: [],
    totalCost: [],
  });
  const [heatmapData, setHeatmapData] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [yLabels, setYLabels] = useState([]);
  const [networkGraphData, setNetworkGraphData] = useState({
    tokenFlow: [],
    mostActiveTokenAddresses: {}
  });
  const [networkAnalysisData, setNetworkAnalysisData] = useState({
    networkAnaltokenFlow: [],
    netoworkMostActiveTokenAddresses: {}
  });
  const [historicalTrendsData, setHistoricalTrendsData] = useState({
    volumeData: [],
    valueData: []
  });
  const [crossContractAnalysisData, setCrossContractAnalysisData] = useState({
    crossContractTokenFlow: [],
    crossContractMostActiveTokenAddresses: {}
  });
  const [whaleTrackingData, setWhaleTrackingData] = useState({});




  useEffect(() => {
    const fetchData = async () => {
      if (!walletAnalytics[teamId]) {
        await fetchWalletAnalytic(teamId);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [teamId, walletAnalytics, fetchWalletAnalytic]);

  useEffect(() => {
    if (walletAnalytics[teamId]) {
      const walletData = walletAnalytics[teamId];
      const transactionVolumeAndValue = JSON.parse(walletData.transaction_volume_and_value || '{}');
      const gasUsageAndCosts = JSON.parse(walletData.gas_usage_and_costs || '{}');
      const volumeData = {};
      const usageData = {};
      const labels = [];
      const totalGasUsed = [];
      const totalCost = [];

      Object.entries(transactionVolumeAndValue).forEach(([address, data]) => {
        volumeData[address] = data.total_volume;
      });
      setTransactionVolumeData(volumeData);

      Object.entries(gasUsageAndCosts).forEach(([address, data]) => {
        usageData[address] = data.total_gas_used;
        labels.push(address);
        totalGasUsed.push(data.total_gas_used);
        totalCost.push(data.total_cost);
      });
      setGasUsageData(usageData);
      setGasUsageAndCostData({
        labels,
        totalGasUsed,
        totalCost,
      });

      // Data preparation for heatmap graph
      const activePeriods = JSON.parse(walletData.active_periods || '{}');
      const datesSet = new Set();
      const addressData = {};

      Object.entries(activePeriods).forEach(([address, periods]) => {
        Object.keys(periods).forEach(date => {
          datesSet.add(date);
          if (!addressData[address]) {
            addressData[address] = {};
          }
          addressData[address][date] = periods[date];
        });
      });

      const dates = Array.from(datesSet).sort();
      const addresses = Object.keys(addressData);
      const dataMatrix = addresses.map(address => 
        dates.map(date => addressData[address][date] || 0)
      );

      setXLabels(dates);
      setYLabels(addresses);
      setHeatmapData(dataMatrix);

      // Data preparation for network graph
      const smartContractInteractions = JSON.parse(walletData.smart_contract_interactions || '{}');
      const tokenFlow = [];
      const mostActiveTokenAddresses = {};

      Object.entries(smartContractInteractions).forEach(([sourceAddress, targetAddresses]) => {
        targetAddresses.forEach(targetAddress => {
          tokenFlow.push({ from: sourceAddress, to: targetAddress, value: 1 }); // Assuming value as 1 for each interaction
        });

        mostActiveTokenAddresses[sourceAddress] = targetAddresses.length;
      });
      setNetworkGraphData({
        tokenFlow,
        mostActiveTokenAddresses
      });

      // Data preparation for second network graph
      const networkAnalysis = JSON.parse(walletData.network_analysis || '{}');
      const networkAnaltokenFlow = [];
      const netoworkMostActiveTokenAddresses = {};

      Object.entries(networkAnalysis).forEach(([sourceAddress, targets]) => {
        Object.entries(targets).forEach(([targetAddress, value]) => {
          networkAnaltokenFlow.push({ from: sourceAddress, to: targetAddress, value });
        });

        netoworkMostActiveTokenAddresses[sourceAddress] = Object.keys(targets).length;
      });

      setNetworkAnalysisData({
        networkAnaltokenFlow,
        netoworkMostActiveTokenAddresses
      });

      //prepare data for timeseries for historical trend
      const historicalTrends = JSON.parse(walletData.historical_trends || '{}');

      const volumeDataPoints = [];
      const valueDataPoints = [];

      Object.entries(historicalTrends).forEach(([address, trends]) => {
        Object.entries(trends).forEach(([date, { volume, value }]) => {
          volumeDataPoints.push({ timestamp: date, value: volume });
          valueDataPoints.push({ timestamp: date, value: value });
        });
      });

      // Sort data points by date
      volumeDataPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      valueDataPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setHistoricalTrendsData({
        volumeData: volumeDataPoints,
        valueData: valueDataPoints
      });

      //data prep for cross contract network graph
      const crossContractAnalysis = JSON.parse(walletData.cross_contract_analysis || '{}');
      const crossContractTokenFlow = [];
      const crossContractMostActiveTokenAddresses = {};

      Object.entries(crossContractAnalysis).forEach(([sourceAddress, targets]) => {
        Object.entries(targets).forEach(([targetAddress, value]) => {
          crossContractTokenFlow.push({ from: sourceAddress, to: targetAddress, value });
        });

        crossContractMostActiveTokenAddresses[sourceAddress] = Object.keys(targets).length;
      });

      setCrossContractAnalysisData({
        crossContractTokenFlow,
        crossContractMostActiveTokenAddresses
      });

      //data prep for whale tracking
      const whaleTracking = JSON.parse(walletData.whale_tracking || '{}');
      const formattedData = {};
      Object.entries(whaleTracking).forEach(([address, { transaction_volume, total_value }]) => {
        formattedData[address] = {
          value1: transaction_volume,
          value2: total_value
        };
      });

      setWhaleTrackingData(formattedData);
    }

  }, [walletAnalytics, teamId]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Utility function to shorten Ethereum addresses
  const shortenAddress = (address) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  // Function to prepare data with shortened addresses
  const prepareDataWithShortenedAddresses = (data) => {
    const newData = {};
    Object.keys(data).forEach(key => {
      newData[shortenAddress(key)] = data[key];
    });
    return newData;
  };
  
  // Inside WalletDashboard component, before rendering the graphs
  const shortenedTransactionVolumeData = prepareDataWithShortenedAddresses(transactionVolumeData);
  const shortenedGasUsageData = prepareDataWithShortenedAddresses(gasUsageData);
  // ... similarly for other datasets

  return (
    <div className="crypto-dashboard">
      <h1>Wallet Analytics Dashboard</h1>
      <div className="graph-container"> 
        {Object.keys(transactionVolumeData).length > 0 && (
          <GenericDistributionGraph 
            data={transactionVolumeData}
            graphType="bar"
            title="Transaction Volume Distribution"
            description="Distribution of transaction volumes."
          />
        )}

      {Object.keys(gasUsageData).length > 0 && (
        <GenericDistributionGraph 
          data={gasUsageData}
          graphType="bar"
          title="Gas Usage Distribution"
          description="Distribution of gas usage across addresses."
        />
      )}

          {/* Render the Dual Axis Bar Graph for Gas Usage and Costs from fn  metric_calculator.calculate_gas_usage_and_costs()*/}
          <DualAxisBarGraph 
          data={gasUsageAndCostData}
          title="Gas Usage and Costs"
          description="Comparison of gas usage and costs across addresses."
          />

          {/* Render the Heatmap from fn metric_calculator.calculate_active_periods()*/}
          <GenericHeatmap 
          data={heatmapData}
          xLabels={xLabels}
          yLabels={yLabels}
          title="Engagement Heatmap: Users and Contracts Daily"
          description="Displays total contract calls and active user counts against dates, showing activity patterns."
        />

        {/* Render the Network Graph  from fn metric_calculator.calculate_smart_contract_interactions()*/}
        <GenericNetworkGraph 
        tokenFlow={networkGraphData.tokenFlow}
        mostActiveTokenAddresses={networkGraphData.mostActiveTokenAddresses}
        title="Smart Contract Interactions"
        description="Network graph showing interactions between smart contracts."
        width={600} // Adjust as needed
        height={400} // Adjust as needed
      />

      {/* Render the Network Analysis Graph  from fn metric_calculator.calculate_network_analysis()*/}
      <GenericNetworkGraph 
        tokenFlow={networkAnalysisData.networkAnaltokenFlow}
        mostActiveTokenAddresses={networkAnalysisData.netoworkMostActiveTokenAddresses}
        title="Network Analysis"
        description="Network graph showing interactions between addresses."
        width={600} // Adjust as needed
        height={400} // Adjust as needed
      />

      {/* Render Time Series Graphs  from fn metric_calculator.calculate_transaction_volume_and_value()*/}
      <GenericTimeSeriesGraph 
        data={historicalTrendsData.volumeData}
        title="Historical Volume Trends"
        yAxisLabel="Volume"
        description="This graph displays the historical volume trends."
      />
      {/* Render Time Series Graphs  from fn metric_calculator.calculate_transaction_volume_and_value()*/}
      <GenericTimeSeriesGraph 
        data={historicalTrendsData.valueData}
        title="Historical Value Trends"
        yAxisLabel="Value"
        description="This graph displays the historical value trends."
      />
      {/* Render the Cross Contract Network Graph  from fn metric_calculator.calculate_cross_contract_analysis()*/}
      <GenericNetworkGraph 
        tokenFlow={crossContractAnalysisData.crossContractTokenFlow}
        mostActiveTokenAddresses={crossContractAnalysisData.crossContractMostActiveTokenAddresses}
        title="Cross Contract Analysis"
        description="Network graph showing interactions between contracts."
        width={600} // Adjust as needed
        height={400} // Adjust as needed
      />
      {/* Render the Whale Tracking Analysis  from fn metric_calculator.calculate_whale_tracking()*/}
      <GenericBarGraph 
        data={whaleTrackingData}
        title="Whale Tracking Analysis"
        description="Bar graph showing transaction volume and total value for whale accounts."
        label1="Transaction Volume"
        label2="Total Value"
      />
      </div>
    </div>
  );
};

export default WalletDashboard;


