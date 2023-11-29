import React, { useEffect, useState } from 'react';
import { useActions } from 'kea';
import { communityEngagementLogic } from '../CommunityEngagementService';
import { ActiveUsersOverTime } from './ActiveUsersOverTime';
import { CampaignAnalytic } from './CryptoType'; // Import the type

interface CampaignAnalyticsComponentProps {
    campaignId: number;
}

const CampaignAnalyticsComponent: React.FC<CampaignAnalyticsComponentProps> = ({ campaignId }) => {
    const { fetchCampaignAnalytic } = useActions(communityEngagementLogic);
    const [campaignAnalytics, setCampaignAnalytics] = useState<CampaignAnalytic[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchCampaignAnalytic(campaignId);
                setCampaignAnalytics(response); // Assuming response is already in the correct format
            } catch (error) {
                console.error('Error fetching campaign analytics:', error);
            }
        };

        fetchData();
    }, [fetchCampaignAnalytic, campaignId]); // Add campaignId as a dependency

    return (
        <div>
            {/* Render the Active Users Over Time graph with the fetched data */}
            <ActiveUsersOverTime data={campaignAnalytics} />
        </div>
    );
};

export default CampaignAnalyticsComponent;
