// CommunityEngagementDetail.tsx
import React from 'react'
import { CommunityEngagement } from './CommunityEngagementModel'

interface Props {
    campaign: CommunityEngagement | null // Allow campaign to be null
    onEdit: () => void
}

const CommunityEngagementDetail: React.FC<Props> = ({ campaign, onEdit }) => {
    // Guard clause to check if campaign is defined
    if (!campaign) {
        return <div>Error: Invalid campaign data</div>
    }

    return (
        <div>
            <h3>{campaign.campaign_name}</h3>
            <p>Start Date: {campaign.start_date}</p>
            <p>End Date: {campaign.end_date}</p>
            <p>Token Address: {campaign.token_address}</p>
            <p>Contract Address: {campaign.contract_address}</p>
            {/* ... Display other campaign details ... */}
            <button onClick={onEdit}>Edit Campaign</button>
        </div>
    )
}

export default CommunityEngagementDetail
