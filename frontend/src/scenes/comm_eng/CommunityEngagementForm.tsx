import React, { useState } from 'react'
import axios from 'axios'
import { CommunityEngagement } from './CommunityEngagementModel'

interface Props {
    campaign: CommunityEngagement | null
    onDone: () => void
}

const CommunityEngagementForm: React.FC<Props> = ({ campaign, onDone }) => {
    const defaultData: CommunityEngagement = {
        id: -1, // temporary id, it won't be used when creating a new campaign
        team_id: 0,
        campaign_name: '',
        token_address: '',
        contract_type: 'ERC-20',
        start_date: new Date(),
        end_date: new Date(),
        date: new Date(),
        contract_address: '',
        active_users: 0,
        total_contract_calls: 0,
        average_gas_used: 0,
        function_calls_count: {},
        tot_tokens_transferred: 0,
        referral_count: 0,
        last_modified: new Date(),
        tot_txns: 0,
        ave_gas_used: 0,
        transaction_value_distribution: {},
        ave_txn_fee: 0,
        tot_txn_from_address: {},
        tot_txn_to_address: {},
        freq_txn: {},
        token_transfer_volume: 0,
        token_transfer_value: 0,
        most_active_token_addresses: {},
        ave_token_transfer_value: 0,
        token_flow: {},
        token_transfer_value_distribution: {},
    }

    const [formData] = useState<CommunityEngagement>(campaign || defaultData)

    const handleSubmit = (): void => {
        if (campaign) {
            // Update existing campaign
            axios
                .put(`/api/com_eng/${campaign.id}/`, formData)
                .then(() => {
                    onDone()
                })
                .catch((error) => {
                    console.error('Error updating campaign:', error)
                })
        } else {
            // Create new campaign
            axios
                .post('/api/com_eng/', formData)
                .then(() => {
                    onDone()
                })
                .catch((error) => {
                    console.error('Error creating campaign:', error)
                })
        }
    }

    return (
        <div>
            {/* Render form fields here */}
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default CommunityEngagementForm
