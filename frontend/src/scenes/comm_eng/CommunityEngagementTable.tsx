import React, { useEffect, useState } from 'react';
import { LemonTable } from '../../lib/components/LemonTable/LemonTable';
import { LemonButton } from '../../lib/components/LemonButton';
import { useActions, useValues } from 'kea';
import { communityEngagementLogic } from './CommunityEngagementService';
import { CommunityEngagement } from './CommunityEngagementModel';
import CampaignModal from './CampaignModal';
import CryptoDashboard from './graph/CryptoDashboard'; // Import the CryptoDashboard component




interface CommunityEngagementTableProps {
    onEditCampaign?: (campaign: CommunityEngagement) => void;
}

interface TransformedData {
    // Define the structure of the data after transformation
    // This should match what your component expects
    activeUsers: number;
    totalContractCalls: number;
    // ... other fields as needed
}

const CommunityEngagementTable: React.FC<CommunityEngagementTableProps> = ({ onEditCampaign }) => {
    const [data, setData] = useState<CommunityEngagement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingCampaign, setEditingCampaign] = useState<CommunityEngagement | null>(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

    // Initialize campaignAnalyticsData as an empty array
    const [campaignAnalyticsData, setCampaignAnalyticsData] = useState<CampaignAnalytic[]>([]);

    // Use Kea's useActions hook to get the actions from the logic
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
    const { fetchAllEngagements, deleteEngagement, fetchCampaignAnalytic } = useActions(communityEngagementLogic);
    const { engagements, lastUpdated, campaignAnalytics } = useValues(communityEngagementLogic);
   // Add a state to track the visibility of the analytics modal
   const [isAnalyticsModalVisible, setIsAnalyticsModalVisible] = useState<boolean>(false);


    useEffect(() => {
        fetchCampaigns();
    }, []);
    

    useEffect(() => {
        // Trigger a refresh whenever a campaign is added, updated, or deleted
        fetchAllEngagements();
    }, [lastUpdated]);

    useEffect(() => {
        // Update the data when engagements change
        setData(engagements);
    }, [engagements]);

    useEffect(() => {
        if (campaignAnalytics && selectedCampaignId) {
            const analyticsData = campaignAnalytics[selectedCampaignId];
            if (analyticsData) {
                setCampaignAnalyticsData(analyticsData);
                setIsAnalyticsModalVisible(true); // Open the analytics modal
            } else {
                console.log("No analytics data found for campaign ID:", selectedCampaignId);
                setCampaignAnalyticsData([]);
            }
            setIsLoadingAnalytics(false);
        }
    }, [campaignAnalytics, selectedCampaignId]);
    


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

    const handleEdit = (campaign: CommunityEngagement): void => {
        console.log("Editing campaign:", campaign); // Add this line to check the campaign data
        setEditingCampaign(campaign);
        setIsModalVisible(true);
    };
    

    // Add a function to handle closing the modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
    };
    
    const handleViewAnalytics = (campaignId: number) => {
        setSelectedCampaignId(campaignId);
        setIsLoadingAnalytics(true);
        fetchCampaignAnalytic(campaignId); // This triggers the loader
        setIsAnalyticsModalVisible(true); // Open the analytics modal
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
                <LemonButton onClick={() => handleEdit(record)}>Edit</LemonButton>
                <LemonButton onClick={() => handleDelete(record.id)}>Delete</LemonButton>
                <LemonButton onClick={() => handleViewAnalytics(record.id)}>View</LemonButton>
                    {/* ... other actions */}
                </>
            ),
        },
    ];
    console.log("Campaign Analytics Data:", campaignAnalyticsData);
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
                onClose={handleCloseModal}
                campaign={editingCampaign}
                isModalVisible={isModalVisible} // Pass this down to the modal
            />
            {/* Crypto Dashboard Modal */}
            {selectedCampaignId && isAnalyticsModalVisible && (
                    <CryptoDashboard
                        campaignAnalytics={campaignAnalyticsData}
                    />
                )}

            </>
    );
};

export default CommunityEngagementTable;

