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

    const handleNewCampaignClick = ():void => {
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
            <div className="header">
                <h1>Community Engagement</h1>

                <button onClick={handleNewCampaignClick}>New Campaign</button>
            </div>
            <div className="table-container">
                <CommunityEngagementTable />
            </div>
            {isModalVisible && (
                <CampaignModal 
                    isVisible={isModalVisible} // Ensure this prop is passed
                    onClose={handleModalClose}
                    // other props as needed
                />
            )}
        </div>
    );
};

export default CommunityEngagementContainer;
