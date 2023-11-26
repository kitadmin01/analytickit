import React, { useRef, useState, useCallback } from 'react';
import { Modal, Input, Alert } from 'antd';
import { useActions } from 'kea';
import { communityEngagementLogic } from './CommunityEngagementService'; // Import the logic
import { CommunityEngagementCreatePayload } from './CommunityEngagementModel'; 

interface NewCampaignModalProps {
    isVisible: boolean;
    onClose?: () => void;
}

const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ isVisible, onClose }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const campaignNameRef = useRef<Input>(null);
    const tokenAddressRef = useRef<Input>(null);
    const contractAddressRef = useRef<Input>(null);
    const contractTypeRef = useRef<HTMLSelectElement>(null);
    const startDateRef = useRef<Input>(null);
    const endDateRef = useRef<Input>(null);

    // Use Kea's useActions hook to get the actions from the logic
    const { createEngagement } = useActions(communityEngagementLogic);

    const closeModal = useCallback(() => {
        if (onClose) {
            setErrorMessage(null);
            onClose();
        }
    }, [onClose]);

    const handleSubmit = async () => {
        const campaignName = campaignNameRef.current?.state.value?.trim();
        const tokenAddress = tokenAddressRef.current?.state.value?.trim();
        const contractAddress = contractAddressRef.current?.state.value?.trim();
        const contractType = contractTypeRef.current?.value;
        const startDate = startDateRef.current?.state.value;
        const endDate = endDateRef.current?.state.value;


        // Format dates to YYYY-MM-DD
        const formattedStartDate = startDateRef.current?.state.value || undefined;
        const formattedEndDate = endDateRef.current?.state.value || undefined;


        if (!campaignName || !tokenAddress || !contractAddress || !contractType || !startDate || !endDate) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        const payload: CommunityEngagementCreatePayload = {
            campaign_name: campaignName,
            token_address: tokenAddress,
            contract_address: contractAddress,
            contract_type: contractType as 'ERC-20' | 'ERC-721' | 'ERC-777',
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            team_id: 10 // Example team_id
        };

        try {
            // Use the createEngagement action from the logic
            const newEngagement = await createEngagement(payload);
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
                    <Input ref={campaignNameRef} type="text" name="campaign_name" required />
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ flex: 1, marginRight: '10px' }}>
                        Contract Type:
                        <select ref={contractTypeRef} name="contract_type" required>
                            <option value="ERC-20">ERC-20</option>
                            <option value="ERC-721">ERC-721</option>
                            <option value="ERC-777">ERC-777</option>
                        </select>
                    </label>
                    <label style={{ flex: 1 }}>
                        Start Date:
                        <Input ref={startDateRef} type="date" name="start_date" required />
                    </label>
                </div>
                <label>
                    End Date:
                    <Input ref={endDateRef} type="date" name="end_date" required />
                </label>
                <label>
                    Contract Address:
                    <Input ref={contractAddressRef} type="text" name="contract_address" required />
                </label>
                <label>
                    Token Address:
                    <Input ref={tokenAddressRef} type="text" name="token_address" required />
                </label>
            </form>
        </Modal>
    );
};

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default NewCampaignModal;
