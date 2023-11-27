import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Modal, Input, Alert } from 'antd';
import { useActions } from 'kea';
import { communityEngagementLogic } from './CommunityEngagementService';
import { CommunityEngagement, CommunityEngagementCreatePayload } from './CommunityEngagementModel';
import { lemonToast } from 'lib/components/lemonToast';



interface CampaignModalProps {
    isVisible: boolean;
    onClose?: () => void;
    campaign?: CommunityEngagement; // Optional campaign data for editing
}

const CampaignModal: React.FC<CampaignModalProps> = ({ isVisible, onClose, campaign }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [campaignName, setCampaignName] = useState<string>('');
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [contractAddress, setContractAddress] = useState<string>('');
    const [contractType, setContractType] = useState<'ERC-20' | 'ERC-721' | 'ERC-777'>('ERC-20');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Use Kea's useActions hook to get the actions from the logic
    const { createEngagement, updateEngagement } = useActions(communityEngagementLogic);

    // Determine if we are editing an existing campaign
    const isEditMode = campaign !== undefined;

    // Pre-fill form fields if editing
    useEffect(() => {
        if (isEditMode && campaign) {
            setCampaignName(campaign.campaign_name);
            setTokenAddress(campaign.token_address);
            setContractAddress(campaign.contract_address);
            setContractType(campaign.contract_type);
            setStartDate(campaign.start_date);
            setEndDate(campaign.end_date);
        }
    }, [campaign, isEditMode]);

    const closeModal = () => {
        setErrorMessage(null);
        if (onClose) {
            onClose();
        }
    };

    const handleSubmit = async () => {
        console.log('handleSubmit called, campaign:', campaign);

        if (!campaignName || !tokenAddress || !contractAddress || !contractType || !startDate || !endDate) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        const payload: CommunityEngagementCreatePayload = {
            campaign_name: campaignName,
            token_address: tokenAddress,
            contract_address: contractAddress,
            contract_type: contractType,
            start_date: startDate,
            end_date: endDate,
            team_id: 10 // Example team_id
        };

        try {
            if (campaign && campaign.id) {
                // If editing an existing campaign
                await updateEngagement({ id: campaign.id, data: payload });
                lemonToast.success('Campaign updated successfully');
            } else {
                // If creating a new campaign
                await createEngagement(payload);
                lemonToast.success('New Community Engagement created');
            }
            closeModal();
        } catch (error) {
            console.error('Error processing Community Engagement:', error);
            setErrorMessage('Failed to process Community Engagement');
        }
    };

    return (
        <Modal
            title={isEditMode ? "Edit Campaign" : "Create New Campaign"}
            visible={isVisible}
            onOk={handleSubmit}
            onCancel={closeModal}
            okText={isEditMode ? "Save Changes" : "Create Campaign"}
            cancelText="Cancel"
        >
            {errorMessage && <Alert message={errorMessage} type="error" />}
            <form>
                <label>
                    Campaign Name:
                    <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} type="text" name="campaign_name" required />
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ flex: 1, marginRight: '10px' }}>
                        Contract Type:
                        <select value={contractType} onChange={(e) => setContractType(e.target.value as 'ERC-20' | 'ERC-721' | 'ERC-777')} name="contract_type" required>
                            <option value="ERC-20">ERC-20</option>
                            <option value="ERC-721">ERC-721</option>
                            <option value="ERC-777">ERC-777</option>
                        </select>
                    </label>
                    <label style={{ flex: 1 }}>
                        Start Date:
                        <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" name="start_date" required />
                    </label>
                </div>
                <label>
                    End Date:
                    <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" name="end_date" required />
                </label>
                <label>
                    Contract Address:
                    <Input value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} type="text" name="contract_address" required />
                </label>
                <label>
                    Token Address:
                    <Input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} type="text" name="token_address" required />
                </label>
            </form>
        </Modal>
    );
};

export default CampaignModal;
