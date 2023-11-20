import React, { useState, useEffect } from 'react'
import CommunityEngagementTable from './CommunityEngagementTable'
import {
    fetchAllCommunityEngagements,
    createCommunityEngagement,
    updateCommunityEngagement,
} from './CommunityEngagementService'
import { CommunityEngagement, CommunityEngagementCreatePayload } from './CommunityEngagementModel'
import './CommunityEngagement.scss'
import NewCampaignModal from './NewCampaignModal'

const CommunityEngagementContainer: React.FC = () => {
    console.log('Rendering CommunityEngagementContainer')

    // const [data, setData] = useState<CommunityEngagement[]>([]);
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
    const [editingCampaign, setEditingCampaign] = useState<CommunityEngagement | undefined>(undefined)

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                await fetchAllCommunityEngagements()
                // setData(result);
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleNewCampaignClick = (): void => {
        setIsModalVisible(true)
    }

    const handleModalClose = (): void => {
        setEditingCampaign(undefined)
        setIsModalVisible(false)
    }

    const transformToCreatePayload = (data: CommunityEngagement): CommunityEngagementCreatePayload => {
        const { id, ...rest } = data
        return { team_id: '', ...rest }
    }

    const handleFormSubmit = async (formData: CommunityEngagement): Promise<void> => {
        try {
            if (editingCampaign) {
                await updateCommunityEngagement(editingCampaign.id, formData)
            } else {
                const payload = transformToCreatePayload(formData)
                await createCommunityEngagement(payload)
            }
            handleModalClose()
        } catch (error) {
            console.error('Error submitting form:', error)
        }
    }

    if (loading) {
        return <p>Loading...</p>
    }
    if (error) {
        return <p>Error: {error}</p>
    }

    return (
        <div className="community-engagement">
            <div className="header">
                <h1>Community Engagement</h1>
                {console.log('Rendering button')}

                <button onClick={handleNewCampaignClick}>New Campaign</button>
            </div>
            <div className="table-container">
                <CommunityEngagementTable />
            </div>

            {isModalVisible && (
                <NewCampaignModal onClose={handleModalClose} onSubmit={handleFormSubmit} campaign={editingCampaign} />
            )}
        </div>
    )
}

export default CommunityEngagementContainer
