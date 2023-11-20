import React from 'react'
// import { CommunityEngagement } from './CommunityEngagementModel';

interface Props {
    campaign: any // Allow campaign to be null
    onEdit: () => void
}

const CommunityEngagementDetail: React.FC<Props> = ({ campaign, onEdit }) => {
    if (!campaign) {
        return <div>Error: Invalid campaign data</div>
    }

    const formatDate = (date?: Date): string => {
        // Check if date is defined and is a valid date
        if (date && !isNaN(new Date(date).getTime())) {
            return new Date(date).toLocaleDateString()
        } else {
            return 'N/A' // Or any placeholder for invalid/undefined dates
        }
    }

    return (
        <div>
            <h3>{campaign.campaign_name}</h3>
            <p>Start Date: {formatDate(campaign.start_date)}</p>
            <p>End Date: {formatDate(campaign.end_date)}</p>
            <p>Token Address: {campaign.token_address}</p>
            <p>Contract Address: {campaign.contract_address}</p>
            {/* ... Display other campaign details ... */}
            <button onClick={onEdit}>Edit Campaign</button>
        </div>
    )
}

export default CommunityEngagementDetail
