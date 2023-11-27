import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CommunityEngagement } from './CommunityEngagementModel';
import { LemonTable } from '../../lib/components/LemonTable/LemonTable';
import './CommunityEngagement.scss';
import { LemonButton } from '../../lib/components/LemonButton';
import CampaignModal from './CampaignModal';



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
            <LemonButton type="primary" onClick={handleNewCampaign}>
                New Campaign
            </LemonButton>
            <LemonTable
                columns={columns}
                dataSource={data}
                loading={loading}
            />
            <CampaignModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                campaign={editingCampaign}
            />
        </>
    );
    
};

    


export default CommunityEngagementTable;
