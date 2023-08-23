import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { LemonTable } from 'lib/components/LemonTable/LemonTable'
import { CommunityEngagement } from './CommunityEngagementModel'
import CommunityEngagementForm from './CommunityEngagementForm'
import { LemonTableColumn } from 'lib/components/LemonTable/types'
import CommunityEngagementDetail from './CommunityEngagementDetail'
import './CommunityEngagement.scss'

const CommunityEngagement: React.FC = () => {
    const [data, setData] = useState<CommunityEngagement[]>([])
    const [selectedCampaign, setSelectedCampaign] = useState<CommunityEngagement | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        fetchCampaigns()
    }, [])

    const fetchCampaigns = (): void => {
        axios
            .get('/api/com_eng/')
            .then((response) => {
                console.log('Fetched data:', response.data.results) // Logging fetched data
                setData(response.data.results)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setLoading(false)
            })
    }

    const handleEdit = (campaign: CommunityEngagement): void => {
        setSelectedCampaign(campaign)
        setIsEditing(true)
    }

    const handleDelete = (id: number): void => {
        axios
            .delete(`/api/com_eng/${id}/`)
            .then(() => {
                fetchCampaigns()
            })
            .catch((error) => {
                console.error('Error deleting campaign:', error)
            })
    }

    const handleViewDetails = (campaign: CommunityEngagement): void => {
        setSelectedCampaign(campaign)
        setIsEditing(false)
    }

    const handleStartEdit = (): void => {
        setIsEditing(true)
    }

    const renderCampaignName = (campaignName?: string): JSX.Element => {
        if (!campaignName) {
            return <span>Error: Invalid Campaign Name</span>
        }

        const campaign = data.find((c) => c.campaign_name === campaignName)
        console.log('Found campaign for name:', campaignName, campaign) // Logging found campaign

        if (!campaign) {
            return <span>Error: Invalid Campaign</span>
        }

        return (
            <button className="campaign-button" onClick={() => handleViewDetails(campaign)}>
                {campaignName}
            </button>
        )
    }

    renderCampaignName.displayName = 'renderCampaignName'

    const addNewCampaign = (): void => setSelectedCampaign(null)
    addNewCampaign.displayName = 'addNewCampaign'

    const columns: LemonTableColumn<CommunityEngagement, keyof CommunityEngagement>[] = [
        { title: 'Campaign Name', dataIndex: 'campaign_name', render: renderCampaignName },
        { title: 'Start Date', dataIndex: 'start_date' },
        { title: 'End Date', dataIndex: 'end_date' },
        // ... other columns
    ]

    console.log('Selected Campaign:', selectedCampaign) // Logging selected campaign

    return (
        <div className="community-engagement">
            <div className="header">
                <h1>Community Engagement</h1>
                <button onClick={addNewCampaign}>Add New Campaign</button>
            </div>
            <div className="table-container">
                <LemonTable
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
            {selectedCampaign && !isEditing && (
                <CommunityEngagementDetail campaign={selectedCampaign} onEdit={handleStartEdit} />
            )}
            {selectedCampaign && isEditing && (
                <CommunityEngagementForm campaign={selectedCampaign} onDone={fetchCampaigns} />
            )}
        </div>
    )
}

export default CommunityEngagement
