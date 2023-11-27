import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Input } from 'antd'; // Import necessary components from antd
import { CommunityEngagement } from './CommunityEngagementModel';
import { LemonTable } from '../../lib/components/LemonTable/LemonTable';
import './CommunityEngagement.scss';

const CommunityEngagementTable: React.FC = () => {
    const [data, setData] = useState<CommunityEngagement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isEditVisible, setIsEditVisible] = useState<boolean>(false);
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
        setIsEditVisible(true);
    };

    // Implement handleDelete if needed
    // const handleDelete = (id: number): void => {
    //     // Your delete logic here
    // };

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
                    {/* Implement and uncomment if delete functionality is needed */}
                    {/* <button onClick={() => handleDelete(record.id)}>Delete</button> */}
                </>
            ),
        },
    ];

    return (
        <>
            <LemonTable
                columns={columns}
                dataSource={data}
                loading={loading}
                // Additional props as per your use-case
            />
            {editingCampaign && (
                <EditCampaignModal
                    isVisible={isEditVisible}
                    campaign={editingCampaign}
                    onClose={() => {
                        setIsEditVisible(false);
                        setEditingCampaign(null);
                    }}
                    // Add any other props you need
                />
            )}
        </>
    );
};

// EditCampaignModal component
const EditCampaignModal: React.FC<{
    isVisible: boolean;
    campaign: CommunityEngagement;
    onClose: () => void;
}> = ({ isVisible, campaign, onClose }) => {
    const [campaignName, setCampaignName] = useState<string>(campaign.campaign_name);
    const [startDate, setStartDate] = useState<string>(campaign.start_date);
    const [endDate, setEndDate] = useState<string>(campaign.end_date);
    const [contractAddress, setContractAddress] = useState<string>(campaign.contract_address);
    const [tokenAddress, setTokenAddress] = useState<string>(campaign.token_address);
    const [contractType, setContractType] = useState<'ERC-20' | 'ERC-721' | 'ERC-777'>(campaign.contract_type);


    useEffect(() => {
        setCampaignName(campaign.campaign_name);
        setStartDate(campaign.start_date);
        setEndDate(campaign.end_date);
        setContractAddress(campaign.contract_address);
        setTokenAddress(campaign.token_address);
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
