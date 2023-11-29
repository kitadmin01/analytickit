import React, { useEffect, useState } from 'react';
import { CommunityEngagement } from './CommunityEngagementModel';
import { LemonTable } from '../../lib/components/LemonTable/LemonTable';
import './CommunityEngagement.scss';
import { LemonButton } from '../../lib/components/LemonButton';
import CampaignModal from './CampaignModal';
import { useActions, useValues } from 'kea';
import { communityEngagementLogic } from './CommunityEngagementService'; // Import the logic file
import CampaignAnalyticsComponent from './graph//CampaignAnalyticsComponent'; // Import the component



interface CommunityEngagementTableProps {
    onEditCampaign?: (campaign: CommunityEngagement) => void;
}

const CommunityEngagementTable: React.FC<CommunityEngagementTableProps> = ({ onEditCampaign }) => {
    const [data, setData] = useState<CommunityEngagement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingCampaign, setEditingCampaign] = useState<CommunityEngagement | null>(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);


    // Use Kea's useActions hook to get the actions from the logic
    const { fetchAllEngagements, deleteEngagement } = useActions(communityEngagementLogic);
    const { engagements, lastUpdated } = useValues(communityEngagementLogic);
    const handleViewAnalytics = (campaignId: number): void => {
        setSelectedCampaignId(campaignId);
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    useEffect(() => {
        // Trigger a refresh whenever a campaign is added, updated, or deleted
        fetchAllEngagements();
    }, [lastUpdated]);

    const fetchCampaigns = async (): Promise<void> => {
        setLoading(true);
        try {
            await fetchAllEngagements();
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Update the data when engagements change
        setData(engagements);
    }, [engagements]);

    const handleEdit = (campaign: CommunityEngagement): void => {
        setEditingCampaign(campaign);
        setIsModalVisible(true);
        if (onEditCampaign) {
            onEditCampaign(campaign);
        }
    };

    const handleDelete = async (id: number): Promise<void> => {
        try {
            // Use the deleteEngagement action from the logic
            await deleteEngagement(id);
            // Refresh the campaigns list
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            // Handle errors (e.g., show an error message)
        }
    };
    

    const handleNewCampaign = (): void => {
        setEditingCampaign(null);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Campaign Name',
            dataIndex: 'campaign_name',
            sorter: (a: CommunityEngagement, b: CommunityEngagement) => (a.campaign_name || '').localeCompare(b.campaign_name || ''),
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
        },
        {
            title: 'Contract Address',
            dataIndex: 'contract_address',
        },
        {
            title: 'Token Address',
            dataIndex: 'token_address',
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (text: any, record: CommunityEngagement) => (
                <>
                    <button onClick={() => handleEdit(record)}>Edit</button>
                    <button onClick={() => handleDelete(record.id)}>Delete</button>
                    <button onClick={() => handleViewAnalytics(record.id)}>View</button>

                    {/* ... other actions */}
                </>
            ),
        },
    ];

    return (
        <>
            <LemonButton type="primary" onClick={handleNewCampaign}>
                New Campaign
            </LemonButton>
            <LemonTable
                columns={columns}
                dataSource={data}
                loading={loading}
            />
            <CampaignModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                campaign={editingCampaign}
            />
            {selectedCampaignId && (
                <CampaignAnalyticsComponent campaignId={selectedCampaignId} />
            )}
        </>
    );
    
};

    


export default CommunityEngagementTable;
