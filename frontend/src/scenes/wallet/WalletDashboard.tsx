import React, { useEffect, useState } from 'react'
import { useActions, useValues } from 'kea'
import { communityEngagementLogic } from '../comm_eng/CommunityEngagementService'
import GenericDistributionGraph from '../comm_eng/graph/GenericDistributionGraph'
import DualAxisBarGraph from './DualAxisBarGraph'
import GenericHeatmap from '../comm_eng/graph/GenericHeatmap'
import GenericNetworkGraph from '../comm_eng/graph/GenericNetworkGraph'
import GenericTimeSeriesGraph from '../comm_eng/graph/GenericTimeSeriesGraph'
import GenericBarGraph from '../comm_eng/graph/GenericBarGraph'
import '../comm_eng/graph/CryptoDashboard.scss'

interface DashboardProps {
    teamId: number
}

interface GasUsageAndCostData {
    labels: string[]
    totalGasUsed: number[]
    totalCost: number[]
}

interface NetworkGraphData {
    tokenFlow: Array<{
        from: string
        to: string
        value: number
    }>
    mostActiveTokenAddresses: Record<string, number>
}

interface HistoricalTrendsData {
    volumeData: Array<{
        timestamp: string
        value: number
    }>
    valueData: Array<{
        timestamp: string
        value: number
    }>
}

interface WhaleTrackingData {
    [key: string]: {
        value1: number
        value2: number
    }
}

interface WalletAnalytics {
    [key: number]: {
        transaction_volume_and_value: string
        gas_usage_and_costs: string
        active_periods: string
        smart_contract_interactions: string
        network_analysis: string
        historical_trends: string
        cross_contract_analysis: string
        whale_tracking: string
    }
}

interface GenericDistributionGraphProps {
    data: Record<string, number>
    graphType: string
    title: string
    description: string
}

interface BarGraphProps {
    data: Array<{ x: string; y: number }>
    title: string
    label1: string
    label2: string
}

interface GenericBarGraphProps {
    data: Array<{ x: string; y: number }>
    title: string
    label1: string
    label2: string
}

const WalletDashboard: React.FC<DashboardProps> = ({ teamId }) => {
    const { walletAnalytics } = useValues(communityEngagementLogic) as { walletAnalytics: WalletAnalytics }
    const { fetchWalletAnalytic } = useActions(communityEngagementLogic)
    const [isLoading, setIsLoading] = useState(true)
    const [transactionVolumeData, setTransactionVolumeData] = useState<Record<string, number>>({})
    const [gasUsageData, setGasUsageData] = useState<Record<string, number>>({})
    const [gasUsageAndCostData, setGasUsageAndCostData] = useState<GasUsageAndCostData>({
        labels: [],
        totalGasUsed: [],
        totalCost: [],
    })
    const [heatmapData, setHeatmapData] = useState<number[][]>([])
    const [xLabels, setXLabels] = useState<string[]>([])
    const [yLabels, setYLabels] = useState<string[]>([])
    const [networkGraphData, setNetworkGraphData] = useState<NetworkGraphData>({
        tokenFlow: [],
        mostActiveTokenAddresses: {},
    })
    const [networkAnalysisData, setNetworkAnalysisData] = useState<NetworkGraphData>({
        tokenFlow: [],
        mostActiveTokenAddresses: {},
    })
    const [historicalTrendsData, setHistoricalTrendsData] = useState<HistoricalTrendsData>({
        volumeData: [],
        valueData: [],
    })
    const [crossContractAnalysisData, setCrossContractAnalysisData] = useState<NetworkGraphData>({
        tokenFlow: [],
        mostActiveTokenAddresses: {},
    })
    const [whaleTrackingData, setWhaleTrackingData] = useState<WhaleTrackingData>({})

    useEffect(() => {
        const fetchData = async () => {
            if (!(teamId in walletAnalytics)) {
                await fetchWalletAnalytic(teamId)
            }
            setIsLoading(false)
        }

        fetchData()
    }, [teamId, walletAnalytics, fetchWalletAnalytic])

    useEffect(() => {
        if (teamId in walletAnalytics) {
            const walletData = walletAnalytics[teamId]
            const transactionVolumeAndValue = JSON.parse(walletData.transaction_volume_and_value || '{}')
            const gasUsageAndCosts = JSON.parse(walletData.gas_usage_and_costs || '{}')
            const volumeData: Record<string, number> = {}
            const usageData: Record<string, number> = {}
            const labels: string[] = []
            const totalGasUsed: number[] = []
            const totalCost: number[] = []

            Object.entries(transactionVolumeAndValue).forEach(([address, data]: [string, any]) => {
                volumeData[address] = data.total_volume
            })
            setTransactionVolumeData(volumeData)

            Object.entries(gasUsageAndCosts).forEach(([address, data]: [string, any]) => {
                usageData[address] = data.total_gas_used
                labels.push(address)
                totalGasUsed.push(data.total_gas_used)
                totalCost.push(data.total_cost)
            })
            setGasUsageData(usageData)
            setGasUsageAndCostData({
                labels,
                totalGasUsed,
                totalCost,
            })

            // Data preparation for heatmap graph
            const activePeriods = JSON.parse(walletData.active_periods || '{}')
            const datesSet = new Set<string>()
            const addressData: Record<string, Record<string, number>> = {}

            Object.entries(activePeriods).forEach(([address, periods]: [string, any]) => {
                Object.keys(periods).forEach((date: string) => {
                    datesSet.add(date)
                    if (!addressData[address]) {
                        addressData[address] = {}
                    }
                    addressData[address][date] = periods[date]
                })
            })

            const dates = Array.from(datesSet).sort()
            const addresses = Object.keys(addressData)
            const dataMatrix = addresses.map((address) => dates.map((date) => addressData[address][date] || 0))

            setXLabels(dates)
            setYLabels(addresses)
            setHeatmapData(dataMatrix)

            // Data preparation for network graph
            const smartContractInteractions = JSON.parse(walletData.smart_contract_interactions || '{}')
            const tokenFlow: Array<{ from: string; to: string; value: number }> = []
            const mostActiveTokenAddresses: Record<string, number> = {}

            Object.entries(smartContractInteractions).forEach(([sourceAddress, targetAddresses]: [string, any]) => {
                targetAddresses.forEach((targetAddress: string) => {
                    tokenFlow.push({ from: sourceAddress, to: targetAddress, value: 1 })
                })

                mostActiveTokenAddresses[sourceAddress] = targetAddresses.length
            })
            setNetworkGraphData({
                tokenFlow,
                mostActiveTokenAddresses,
            })

            // Data preparation for second network graph
            const networkAnalysis = JSON.parse(walletData.network_analysis || '{}')
            const networkAnaltokenFlow: Array<{ from: string; to: string; value: number }> = []
            const netoworkMostActiveTokenAddresses: Record<string, number> = {}

            Object.entries(networkAnalysis).forEach(([sourceAddress, targets]: [string, any]) => {
                Object.entries(targets as Record<string, number>).forEach(([targetAddress, value]) => {
                    networkAnaltokenFlow.push({ from: sourceAddress, to: targetAddress, value })
                })

                netoworkMostActiveTokenAddresses[sourceAddress] = Object.keys(targets).length
            })

            setNetworkAnalysisData({
                tokenFlow: networkAnaltokenFlow,
                mostActiveTokenAddresses: netoworkMostActiveTokenAddresses,
            })

            // Prepare data for timeseries for historical trend
            const historicalTrends = JSON.parse(walletData.historical_trends || '{}')
            const volumeDataPoints: Array<{ timestamp: string; value: number }> = []
            const valueDataPoints: Array<{ timestamp: string; value: number }> = []

            Object.entries(historicalTrends).forEach(([address, trends]: [string, any]) => {
                Object.entries(trends).forEach(([date, data]: [string, any]) => {
                    volumeDataPoints.push({ timestamp: date, value: data.volume })
                    valueDataPoints.push({ timestamp: date, value: data.value })
                })
            })

            // Sort data points by date
            volumeDataPoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            valueDataPoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

            setHistoricalTrendsData({
                volumeData: volumeDataPoints,
                valueData: valueDataPoints,
            })

            // Data prep for cross contract network graph
            const crossContractAnalysis = JSON.parse(walletData.cross_contract_analysis || '{}')
            const crossContractTokenFlow: Array<{ from: string; to: string; value: number }> = []
            const crossContractMostActiveTokenAddresses: Record<string, number> = {}

            Object.entries(crossContractAnalysis).forEach(([sourceAddress, targets]: [string, any]) => {
                Object.entries(targets as Record<string, number>).forEach(([targetAddress, value]) => {
                    crossContractTokenFlow.push({ from: sourceAddress, to: targetAddress, value })
                })

                crossContractMostActiveTokenAddresses[sourceAddress] = Object.keys(targets).length
            })

            setCrossContractAnalysisData({
                tokenFlow: crossContractTokenFlow,
                mostActiveTokenAddresses: crossContractMostActiveTokenAddresses,
            })

            // Data prep for whale tracking
            const whaleTracking = JSON.parse(walletData.whale_tracking || '{}')
            const formattedData: WhaleTrackingData = {}
            Object.entries(whaleTracking).forEach(([address, data]: [string, any]) => {
                formattedData[address] = {
                    value1: data.transaction_volume,
                    value2: data.total_value,
                }
            })

            setWhaleTrackingData(formattedData)
        }
    }, [walletAnalytics, teamId])

    if (isLoading) {
        return <div>Loading...</div>
    }

    // Utility function to shorten Ethereum addresses
    const shortenAddress = (address: string): string => 
        `${address.substring(0, 6)}...${address.substring(address.length - 4)}`

    // Function to prepare data with shortened addresses
    const prepareDataWithShortenedAddresses = (data: Record<string, number>): Record<string, number> => {
        const newData: Record<string, number> = {}
        Object.keys(data).forEach((key) => {
            newData[shortenAddress(key)] = data[key]
        })
        return newData
    }

    // Function to format data for pie charts
    const formatDataForPieChart = (data: Record<string, number>): Record<string, number> => {
        return Object.entries(data).reduce((acc, [name, value]) => {
            acc[name] = Number(value)
            return acc
        }, {} as Record<string, number>)
    }

    // Function to format data for bar graphs
    const formatDataForBarGraph = (data: WhaleTrackingData): Array<{ x: string; y: number }> => {
        return Object.entries(data).map(([name, values]) => ({
            x: name,
            y: Number(values.value1)
        }))
    }

    // Inside WalletDashboard component, before rendering the graphs
    const shortenedTransactionVolumeData = prepareDataWithShortenedAddresses(transactionVolumeData)
    const shortenedGasUsageData = prepareDataWithShortenedAddresses(gasUsageData)
    // ... similarly for other datasets

    return (
        <div className="crypto-dashboard">
            <h1>Wallet Analytics Dashboard</h1>
            <div className="graph-container">
                {Object.keys(transactionVolumeData).length > 0 && (
                    <GenericDistributionGraph
                        data={formatDataForPieChart(transactionVolumeData)}
                        graphType="bar"
                        title="Transaction Volume Distribution"
                        description="Distribution of transaction volumes."
                    />
                )}

                {Object.keys(gasUsageData).length > 0 && (
                    <GenericDistributionGraph
                        data={formatDataForPieChart(gasUsageData)}
                        graphType="bar"
                        title="Gas Usage Distribution"
                        description="Distribution of gas usage across addresses."
                    />
                )}

                {/* Render the Dual Axis Bar Graph for Gas Usage and Costs */}
                <DualAxisBarGraph
                    data={gasUsageAndCostData}
                    title="Gas Usage and Costs"
                    description="Comparison of gas usage and costs across addresses."
                />

                {/* Render the Heatmap */}
                <GenericHeatmap
                    data={heatmapData}
                    xLabels={xLabels}
                    yLabels={yLabels}
                    title="Engagement Heatmap: Users and Contracts Daily"
                    description="Displays total contract calls and active user counts against dates, showing activity patterns."
                />

                {/* Render the Network Graph */}
                <GenericNetworkGraph
                    tokenFlow={networkGraphData.tokenFlow}
                    mostActiveTokenAddresses={networkGraphData.mostActiveTokenAddresses}
                    title="Smart Contract Interactions"
                    description="Network graph showing interactions between smart contracts."
                    width={600}
                    height={400}
                />

                {/* Render the Network Analysis Graph */}
                <GenericNetworkGraph
                    tokenFlow={networkAnalysisData.tokenFlow}
                    mostActiveTokenAddresses={networkAnalysisData.mostActiveTokenAddresses}
                    title="Network Analysis"
                    description="Network graph showing interactions between addresses."
                    width={600}
                    height={400}
                />

                {/* Render Time Series Graphs */}
                <GenericTimeSeriesGraph
                    data={historicalTrendsData.volumeData}
                    title="Historical Volume Trends"
                    yAxisLabel="Volume"
                    description="This graph displays the historical volume trends."
                />
                <GenericTimeSeriesGraph
                    data={historicalTrendsData.valueData}
                    title="Historical Value Trends"
                    yAxisLabel="Value"
                    description="This graph displays the historical value trends."
                />

                {/* Render the Cross Contract Network Graph */}
                <GenericNetworkGraph
                    tokenFlow={crossContractAnalysisData.tokenFlow}
                    mostActiveTokenAddresses={crossContractAnalysisData.mostActiveTokenAddresses}
                    title="Cross Contract Analysis"
                    description="Network graph showing interactions between contracts."
                    width={600}
                    height={400}
                />

                {/* Render the Whale Tracking Analysis */}
                <GenericBarGraph
                    data={formatDataForBarGraph(whaleTrackingData)}
                    title="Whale Tracking Analysis"
                    xAxisLabel="Address"
                    yAxisLabel="Transaction Volume"
                />
            </div>
        </div>
    )
}

export default WalletDashboard
