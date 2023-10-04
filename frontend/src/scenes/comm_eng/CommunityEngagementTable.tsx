import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CommunityEngagement } from './CommunityEngagementModel';
import { LemonTableColumn } from 'lib/components/LemonTable/types';
import './CommunityEngagement.scss';

interface Props {
    data: CommunityEngagement[];
}

const EditButton: React.FC<{ record: CommunityEngagement; onEdit: (record: CommunityEngagement) => void }> = ({ record, onEdit }) => (
    <button onClick={() => onEdit(record)}>Edit</button>
);

const DeleteButton: React.FC<{ id: number; onDelete: (id: number) => void }> = ({ id, onDelete }) => (
    <button onClick={() => onDelete(id)}>Delete</button>
);

const CommunityEngagementTable: React.FC<Props> = ({ data: propData }) => {
    const [data, setData] = useState<CommunityEngagement[]>(propData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = (): void => {
        axios
            .get('/api/campaign/')
            .then((response) => {
                console.log('Fetched data:', response.data.results);
                setData(response.data.results);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    };

    const handleEdit = (campaign: CommunityEngagement): void => {
        // Your edit logic here
    };

    const handleDelete = (id: number): void => {
        axios
            .delete(`/api/campaign/${id}/`)
            .then(() => {
                fetchCampaigns();
            })
            .catch((error) => {
                console.error('Error deleting campaign:', error);
            });
    };

    const renderCampaignName = (campaignName?: string): JSX.Element => {
        if (!campaignName) {
            return <span>Error: Invalid Campaign Name</span>;
        }

        const campaign = data.find((c) => c.campaign_name === campaignName);
        console.log('Found campaign for name:', campaignName, campaign);

        if (!campaign) {
            return <span>Error: Invalid Campaign</span>;
        }

        return (
            <button className="campaign-button" onClick={() => handleEdit(campaign)}>
                {campaignName}
            </button>
        );
    };

    const columns: LemonTableColumn<CommunityEngagement, keyof CommunityEngagement>[] = [
        { title: 'Campaign Name', dataIndex: 'campaign_name', render: renderCampaignName },
        { title: 'Start Date', dataIndex: 'start_date' },
        { title: 'End Date', dataIndex: 'end_date' },
        {
            title: 'Actions',
            dataIndex: 'actions' as keyof CommunityEngagement,
            render: (record: CommunityEngagement) => (
                <>
                    <EditButton record={record} onEdit={handleEdit} />
                    <DeleteButton id={record.id} onDelete={handleDelete} />
                </>
            ),
        },
    ];

    return (
        <div className="community-engagement">
            <div className="table-container">
                {/* Your LemonTable component should be used here, using the columns defined above */}
            </div>
        </div>
    );
}

export default CommunityEngagementTable;
