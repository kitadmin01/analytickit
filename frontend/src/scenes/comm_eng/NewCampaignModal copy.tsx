import React, { useState, useCallback } from 'react';
import { Modal, Input, Alert } from 'antd';
import { createCommunityEngagement } from './CommunityEngagementService'; 
import { CommunityEngagementCreatePayload } from './CommunityEngagementModel'; 

interface NewCampaignModalProps {
    isVisible: boolean;
    onClose?: () => void;
}

const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ isVisible, onClose }) => {
    const [formData, setFormData] = useState({
        campaign_name: '',
        token_address: '',
        contract_address: '',
        contract_type: 'ERC-20',
        start_date: '',
        end_date: ''
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const closeModal = useCallback(() => {
        if (onClose) {
            setErrorMessage(null);
            onClose();
            setFormData({
                campaign_name: '',
                token_address: '',
                contract_address: '',
                contract_type: 'ERC-20',
                start_date: '',
                end_date: ''
            });
        }
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        // Validation logic here...

        const currentTeamId = 10; // Example team_id
        console.log('currentTeamId=', currentTeamId);
        const startDate = formData.start_date ? new Date(formData.start_date) : undefined;
        const endDate = formData.end_date ? new Date(formData.end_date) : undefined;

        const payload: CommunityEngagementCreatePayload = {
            ...formData,
            start_date: startDate,
            end_date: endDate,
            contract_type: formData.contract_type as 'ERC-20' | 'ERC-721' | 'ERC-777',
            team_id: currentTeamId
        };

        try {
            const newEngagement = await createCommunityEngagement(payload);
            console.log('New Community Engagement created:', newEngagement);
            closeModal();
        } catch (error) {
            console.error('Error creating Community Engagement:', error);
            setErrorMessage('Failed to create Community Engagement');
        }
    };

    return (
        <Modal
            title="Create New Campaign"
            visible={isVisible}
            onOk={handleSubmit}
            onCancel={closeModal}
            okText="Create Campaign"
            cancelText="Cancel"
        >
            {errorMessage && <Alert message={errorMessage} type="error" />}
            <form>
                <label>
                    Campaign Name:
                    <Input type="text" name="campaign_name" value={formData.campaign_name} onChange={handleChange} required />
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ flex: 1, marginRight: '10px' }}>
                        Contract Type:
                        <select name="contract_type" value={formData.contract_type} onChange={handleChange} required>
                            <option value="ERC-20">ERC-20</option>
                            <option value="ERC-721">ERC-721</option>
                            <option value="ERC-777">ERC-777</option>
                        </select>
                    </label>
                    <label style={{ flex: 1 }}>
                        Start Date:
                        <Input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
                    </label>
                </div>
                <label>
                    End Date:
                    <Input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
                </label>
                <label>
                    Contract Address:
                    <Input type="text" name="contract_address" value={formData.contract_address} onChange={handleChange} required />
                </label>
                <label>
                    Token Address:
                    <Input type="text" name="token_address" value={formData.token_address} onChange={handleChange} required />
                </label>
            </form>
        </Modal>
    );
};

export default NewCampaignModal;
