import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { CommunityEngagement } from './CommunityEngagementModel'
// import {LemonTable} from '../../lib/components/LemonTable/LemonTable';
import { Table } from 'antd'
import './CommunityEngagement.scss'

const CommunityEngagementTable: React.FC = () => {
    const [data, setData] = useState<CommunityEngagement[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        fetchCampaigns()
    }, [])

    const fetchCampaigns = async (): Promise<void> => {
        try {
            const response = await axios.get('/api/campaign/')
            setData(response.data.results)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    // const handleDelete = (id: number): void => {
    //     // Your delete logic here
    // };

    const columns = [
        {
            title: 'Campaign Name',
            dataIndex: 'campaign_name',
            sorter: (a: any, b: any) => a.campaign_name.localeCompare(b.campaign_name),
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
        },
        // {
        //     title: 'Actions',
        //     dataIndex: 'actions',
        //     render: (record: CommunityEngagement) => (
        //         <>
        //              {/* <button onClick={() => onEditCampaign(record.id)}>Edit</button> */}
        //             {/* <button onClick={() => handleDelete(record.id)}>Delete</button> */}
        //         </>
        //     ),
        // },
    ]

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            // Additional props as per your use-case
        />
    )
}

export default CommunityEngagementTable
