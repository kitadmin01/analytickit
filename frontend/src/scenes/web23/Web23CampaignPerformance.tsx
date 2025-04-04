import React from 'react'
import { useValues } from 'kea'
import { web23Logic } from './web23Logic'
import { Card, Table } from 'antd'

export function Web23CampaignPerformance(): JSX.Element {
    const { funnelData } = useValues(web23Logic)
    
    if (!funnelData) {
        return <div>No data available</div>
    }
    
    // Transform campaign data for table display
    const campaignData = Object.entries(funnelData.campaign_performance).map(([campaign, data]) => {
        // Get top sources and mediums
        const topSources = Object.entries(data.sources)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([source, count]) => `${source} (${count})`)
            .join(', ')
            
        const topMediums = Object.entries(data.medium)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([medium, count]) => `${medium} (${count})`)
            .join(', ')
            
        return {
            key: campaign,
            campaign: campaign === 'no_campaign' ? 'No Campaign' : campaign,
            visits: data.visits,
            topSources,
            topMediums,
        }
    }).sort((a, b) => b.visits - a.visits)
    
    const columns = [
        {
            title: 'Campaign',
            dataIndex: 'campaign',
            key: 'campaign',
        },
        {
            title: 'Visits',
            dataIndex: 'visits',
            key: 'visits',
            sorter: (a: any, b: any) => a.visits - b.visits,
        },
        {
            title: 'Top Sources',
            dataIndex: 'topSources',
            key: 'topSources',
        },
        {
            title: 'Top Mediums',
            dataIndex: 'topMediums',
            key: 'topMediums',
        },
    ]
    
    return (
        <Card title="Campaign Performance">
            <div className="web23-campaign-performance">
                <p>
                    Campaign performance metrics show which marketing campaigns are driving the most traffic and
                    engagement to your Web3 application.
                </p>
                
                <Table
                    dataSource={campaignData}
                    columns={columns}
                    className="campaign-table"
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </Card>
    )
} 