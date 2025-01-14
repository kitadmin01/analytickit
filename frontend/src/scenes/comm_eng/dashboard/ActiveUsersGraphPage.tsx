import React, { useEffect } from 'react'
import { useActions, useValues } from 'kea'
import { graphDataLogic } from './graphDataLogic'
import { GenericTimeSeriesGraph } from '../graph/GenericTimeSeriesGraph'

interface ActiveUsersGraphPageProps {
    campaignId: number
}

export const ActiveUsersGraphPage: React.FC<ActiveUsersGraphPageProps> = ({ campaignId }) => {
    const { graphData, graphDataLoading } = useValues(graphDataLogic)
    const { fetchGraphData } = useActions(graphDataLogic)

    useEffect(() => {
        if (campaignId) {
            fetchGraphData(campaignId)
        }
    }, [campaignId])

    if (graphDataLoading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <GenericTimeSeriesGraph
                data={graphData.map((item) => {
                    console.log('Mapping item:', item)
                    return {
                        timestamp: item.creation_ts,
                        value: item.active_users
                    }
                })}
                title="Active Users Over Time"
                description="Daily active users in the campaign"
                yAxisLabel="Active Users"
                lineColor="rgb(75, 192, 192)"
                useCrosshair={true}
            />
        </div>
    )
}
