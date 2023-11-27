import React, { useState, useEffect } from 'react';
import CommunityEngagementTable from './CommunityEngagementTable';
import { communityEngagementLogic } from './CommunityEngagementService';
import { CommunityEngagement } from './CommunityEngagementModel';
import './CommunityEngagement.scss'; 
import CampaignModal from './CampaignModal';

const CommunityEngagementContainer: React.FC = () => {
    const [, setData] = useState<CommunityEngagement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedCampaign, setSelectedCampaign] = useState<CommunityEngagement | null>(null);


    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const result = await communityEngagementLogic();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleNewCampaignClick = (): void => {
        setSelectedCampaign(null); // Reset selected campaign for new campaign
        setIsModalVisible(true);
    };

    const handleEditCampaignClick = (campaign: CommunityEngagement): void => {
        setSelectedCampaign(campaign); // Set the campaign to be edited
        setIsModalVisible(true);
    };

    const handleModalClose = ():void => {
        setIsModalVisible(false);
    };

    if (loading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="community-engagement">
            {/* ... other components */}
            <div className="table-container">
                <CommunityEngagementTable onEditCampaign={handleEditCampaignClick} />
            </div>
            {isModalVisible && (
                <CampaignModal 
                    isVisible={isModalVisible}
                    onClose={handleModalClose}
                    campaign={selectedCampaign} // Pass the selected campaign
                />
            )}
        </div>
    );
};

export default CommunityEngagementContainer;
