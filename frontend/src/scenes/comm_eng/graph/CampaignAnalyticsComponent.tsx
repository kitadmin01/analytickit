import React from 'react';
import { ActiveUsersOverTime } from './ActiveUsersOverTime';
import { CampaignAnalytic } from './CryptoType';


const CampaignAnalyticsComponent: React.FC<{ data: CampaignAnalytic[] }> = ({ data }) => {
    console.log("Analytics Data:", data); // Add this line to check the data

    return (
        <div>
            <ActiveUsersOverTime data={data} />
        </div>
    );
};
export default CampaignAnalyticsComponent;
