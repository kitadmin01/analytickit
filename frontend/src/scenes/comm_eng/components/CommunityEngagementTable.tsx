import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { LemonTable } from 'lib/components/LemonTable/LemonTable'
import { CommunityEngagement } from '../models/CommunityEngagementModel'
import { LemonTableColumns } from 'lib/components/LemonTable/types'

const CommunityEngagementTable: React.FC = () => {
    const [data, setData] = useState<CommunityEngagement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios
            .get('/api/com_eng/')
            .then((response) => {
                setData(response.data.results) // Ensure you're setting the correct part of the response
                console.log(response.data.results) // Log the data
                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setLoading(false)
            })
    }, [])

    const columns: LemonTableColumns<CommunityEngagement> = [
        { title: 'Team ID', dataIndex: 'team_id' as keyof CommunityEngagement },
        { title: 'Campaign Name', dataIndex: 'campaign_name' as keyof CommunityEngagement },
        { title: 'Token Address', dataIndex: 'token_address' as keyof CommunityEngagement },
        { title: 'Contract Type', dataIndex: 'contract_type' as keyof CommunityEngagement },
        { title: 'Start Date', dataIndex: 'start_date' as keyof CommunityEngagement },
        { title: 'End Date', dataIndex: 'end_date' as keyof CommunityEngagement },
        { title: 'Contract Address', dataIndex: 'contract_address' as keyof CommunityEngagement },
        // ... Add other columns here
    ]

    return (
        <LemonTable
            columns={columns}
            dataSource={data}
            loading={loading}
            // You can add other LemonTable props as needed
        />
    )
}

export default CommunityEngagementTable
