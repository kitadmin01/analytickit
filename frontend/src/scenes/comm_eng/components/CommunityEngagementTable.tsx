import React from 'react'
import { CommunityEngagement } from '../models/CommunityEngagementModel'

interface CommunityEngagementTableProps {
    data: CommunityEngagement[]
}

const CommunityEngagementTable: React.FC<CommunityEngagementTableProps> = ({ data }) => {
    return (
        <div className="community-engagement-table">
            <table>
                <thead>
                    <tr>
                        <th>Team ID</th>
                        <th>Campaign Name</th>
                        <th>Token Address</th>
                        {/* ... Add other headers as needed */}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.team_id}>
                            <td>{item.team_id}</td>
                            <td>{item.campaign_name}</td>
                            <td>{item.token_address}</td>
                            {/* ... Add other data cells as needed */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default CommunityEngagementTable
