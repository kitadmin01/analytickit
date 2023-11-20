import React, { useState, useEffect } from 'react'
import { CommunityEngagement } from './CommunityEngagementModel'

interface NewCampaignModalProps {
    onClose: () => void
    onSubmit: (formData: CommunityEngagement) => void
    campaign: CommunityEngagement | undefined
}

const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ onClose, onSubmit, campaign }) => {
    const [formData, setFormData] = useState({
        // team_id: "",
        campaign_name: '',
        token_address: '',
        contract_address: '',
        contract_type: 'ERC-20',
        start_date: '',
        end_date: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    useEffect(() => {
        if (campaign) {
            setFormData({
                campaign_name: campaign.campaign_name,
                token_address: campaign.token_address,
                contract_address: campaign.contract_address,
                contract_type: campaign.contract_type,
                start_date: campaign.start_date,
                end_date: campaign.end_date,
            })
        }
    }, [campaign])

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault()
        console.log('Form data submitted:', formData)
        onSubmit(formData)
        onClose() // Close the modal after submitting
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>
                    &times;
                </span>
                <h2>Create New Campaign</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Campaign Name:
                        <input
                            type="text"
                            name="campaign_name"
                            value={formData.campaign_name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Token Address:
                        <input
                            type="text"
                            name="token_address"
                            value={formData.token_address}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Contract Address:
                        <input
                            type="text"
                            name="contract_address"
                            value={formData.contract_address}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Contract Type:
                        <select name="contract_type" value={formData.contract_type} onChange={handleChange} required>
                            <option value="ERC-20">ERC-20</option>
                            <option value="ERC-721">ERC-721</option>
                            <option value="ERC-777">ERC-777</option>
                        </select>
                    </label>
                    <label>
                        Start Date:
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        End Date:
                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
                    </label>
                    <button type="submit">Create Campaign</button>
                </form>
            </div>
        </div>
    )
}

export default NewCampaignModal
