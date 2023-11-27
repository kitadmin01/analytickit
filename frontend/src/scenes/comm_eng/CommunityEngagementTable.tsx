import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Input } from 'antd';
import { CommunityEngagement } from './CommunityEngagementModel';
import { LemonTable } from '../../lib/components/LemonTable/LemonTable';
import './CommunityEngagement.scss';

interface CommunityEngagementTableProps {
    onEditCampaign?: (campaign: CommunityEngagement) => void;
}

const CommunityEngagementTable: React.FC<CommunityEngagementTableProps> = ({ onEditCampaign }) => {
    const [data, setData] = useState<CommunityEngagement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingCampaign, setEditingCampaign] = useState<CommunityEngagement | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async (): Promise<void> => {
        try {
            const response = await axios.get('/api/campaign/');
            setData(response.data.results);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (campaign: CommunityEngagement): void => {
        setEditingCampaign(campaign);
        setIsModalVisible(true);
        if (onEditCampaign) {
            onEditCampaign(campaign);
        }
    };

    const handleNewCampaign = (): void => {
        setEditingCampaign(null);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Campaign Name',
            dataIndex: 'campaign_name',
            sorter: (a: CommunityEngagement, b: CommunityEngagement) => (a.campaign_name || '').localeCompare(b.campaign_name || ''),
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
        },
        {
            title: 'Contract Address',
            dataIndex: 'contract_address',
        },
        {
            title: 'Token Address',
            dataIndex: 'token_address',
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (text: any, record: CommunityEngagement) => (
                <>
                    <button onClick={() => handleEdit(record)}>Edit</button>
                    {/* ... other actions */}
                </>
            ),
        },
    ];

    return (
        <>
            <Button type="primary" onClick={handleNewCampaign}>
                New Campaign
            </Button>
            <LemonTable
                columns={columns}
                dataSource={data}
                loading={loading}
            />
            <EditCampaignModal
                isVisible={isModalVisible}
                campaign={editingCampaign}
                onClose={() => setIsModalVisible(false)}
            />
        </>
    );
};

// EditCampaignModal component
const EditCampaignModal: React.FC<{
    isVisible: boolean;
    campaign: CommunityEngagement | null;
    onClose: () => void;
}> = ({ isVisible, campaign, onClose }) => {
    // Initialize state with campaign data or defaults
    const [campaignName, setCampaignName] = useState<string>(campaign?.campaign_name || '');
    const [startDate, setStartDate] = useState<string>(campaign?.start_date || '');
    const [endDate, setEndDate] = useState<string>(campaign?.end_date || '');
    const [contractAddress, setContractAddress] = useState<string>(campaign?.contract_address || '');
    const [tokenAddress, setTokenAddress] = useState<string>(campaign?.token_address || '');
    const [contractType, setContractType] = useState<'ERC-20' | 'ERC-721' | 'ERC-777'>(campaign?.contract_type || 'ERC-20');



    useEffect(() => {
        if (campaign) {
            setCampaignName(campaign.campaign_name);
            setStartDate(campaign.start_date);
            setEndDate(campaign.end_date);
            setContractAddress(campaign.contract_address);
            setTokenAddress(campaign.token_address);
        }
    }, [campaign]);

    const handleSubmit = async () => {
        // Implement your form submission logic here
        try {
            // Example: await axios.put('/api/campaign/' + campaign.id, { campaignName, startDate, endDate, contractAddress, tokenAddress });
            onClose(); // Close the modal after successful submission
        } catch (error) {
            console.error('Error updating campaign:', error);
            // Handle errors (e.g., show an error message)
        }
    };

    return (
        <Modal
            title="Edit Campaign"
            visible={isVisible}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Save Changes"
            cancelText="Cancel"
        >
            <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Input value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} />
            <Input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} />
            <select value={contractType} onChange={(e) => setContractType(e.target.value as 'ERC-20' | 'ERC-721' | 'ERC-777')}>
                <option value="ERC-20">ERC-20</option>
                <option value="ERC-721">ERC-721</option>
                <option value="ERC-777">ERC-777</option>
            </select>
        </Modal>
    );
};

export default CommunityEngagementTable;
