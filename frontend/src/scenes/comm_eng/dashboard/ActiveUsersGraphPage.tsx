import React, { useEffect, useState } from 'react'
import { useActions, useValues } from 'kea'
import { graphDataLogic } from './graphDataLogic'
import { GraphRenderer } from './GraphRenderer'
import { TileForm } from './TileForm'
import { GraphFilters } from './GraphFilters'

interface ActiveUsersGraphPageProps {
    campaignId: number // Ensure campaignId is passed correctly
}

export const ActiveUsersGraphPage: React.FC<ActiveUsersGraphPageProps> = ({ campaignId }) => {
    const { graphData = [], graphDataLoading } = useValues(graphDataLogic)
    const { fetchGraphData } = useActions(graphDataLogic)

    // Use state to manage loading and title
    const [isLoading, setIsLoading] = useState(true)
    const [dashboardTitle, setDashboardTitle] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            if (campaignId) {
                console.log('Fetching graph data for campaign:', campaignId)
                await fetchGraphData(campaignId)
                setIsLoading(false) // Update the loading state
                setDashboardTitle(`Active Users Graph for Campaign: ${campaignId}`) // Update the title based on campaignId
            }
        }

        fetchData()
    }, [campaignId, fetchGraphData])

    // Handle tile save
    const handleSave = (data) => {
        console.log('Tile data saved:', data)
    }

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        console.log('Filters changed:', newFilters)
        // Handle filter logic here
    }

    const activityLevels = ['Low Activity', 'Medium Activity', 'High Activity', 'Very High Activity'] // Example levels

    return (
        <div className="active-users-graph-page">
            <h1>{dashboardTitle}</h1> {/* Display the dynamic dashboard title */}
            {/* Tile Form for editing tiles */}
            <TileForm onSave={handleSave} />
            {/* Filters for the graph */}
            <GraphFilters onFilterChange={handleFilterChange} activityLevels={activityLevels} />
            {/* Render the graph */}
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <GraphRenderer data={graphData} xKey="date" yKey="activeUsers" graphType="TimeSeries" />
            )}
        </div>
    )
}
