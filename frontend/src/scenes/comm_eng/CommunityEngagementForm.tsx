import React, { useState } from 'react'
import axios from 'axios'
import { CommunityEngagement } from './CommunityEngagementModel'

interface Props {
    campaign: CommunityEngagement | null
    onDone: () => void
}

const CommunityEngagementForm: React.FC<Props> = ({ campaign, onDone }) => {
    const defaultData: Partial<CommunityEngagement> = {
        // ... (same as your provided defaultData)
    }

    // Use useState to manage formData so it can be updated
    const [formData, setFormData] = useState(campaign || defaultData)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = (): void => {
        if (campaign) {
            // Update existing campaign
            axios
                .put(`/api/campaign/${campaign.id}/`, formData)
                .then(() => {
                    onDone()
                })
                .catch((error) => {
                    console.error('Error updating campaign:', error)
                })
        } else {
            // Create new campaign
            axios
                .post('/api/campaign/', formData)
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
            {/* Example form field */}
            <label>
                Campaign Name:
                <input type="text" name="campaign_name" value={formData.campaign_name} onChange={handleInputChange} />
            </label>
            {/* Add other form fields similarly */}
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default CommunityEngagementForm
