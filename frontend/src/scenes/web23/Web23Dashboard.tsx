import React, { useEffect } from 'react'
import { PageHeader } from 'lib/components/PageHeader'
import { useValues, useActions } from 'kea'
import { web23Logic } from './web23Logic'
import { Spinner } from 'lib/components/Spinner/Spinner'
import { LemonButton } from 'lib/components/LemonButton'
import { Card, Col, Row, Statistic, Table, Tabs, Progress, Divider, Tooltip } from 'antd'
import { DatePicker } from 'antd'
import { teamLogic } from 'scenes/teamLogic'
import { Alert } from 'antd'
import { urls } from 'scenes/urls'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PieChart } from 'lib/components/Charts'
import moment from 'moment'

export function Web23Dashboard(): JSX.Element {
    // Get the team ID from the URL
    const teamId = window.location.pathname.split('/').pop();
    
    // Use the team ID from the URL or fall back to the current team ID
    const { currentTeamId } = useValues(teamLogic);
    const effectiveTeamId = teamId || currentTeamId?.toString();
    
    const logic = web23Logic({ dashboardItemId: null });
    const { funnelData, funnelDataLoading, fromDate, toDate, funnelDataError } = useValues(logic);
    const { loadFunnelData, setDateRange } = useActions(logic);
    
    // Only check for actual errors
    const hasError = !!funnelDataError;
    
    const { RangePicker } = DatePicker;

    // Add this effect to reload data when date range changes
    useEffect(() => {
        loadFunnelData();
    }, [fromDate, toDate]);

    return (
        <div>
            <PageHeader
                title="Web2 to Web3 Analytics"
                caption={
                    <div>
                        <div>Analyze your Web2 to Web3 conversion funnel</div>
                        {funnelData?.campaign_performance && (
                            <div className="mt-2">
                                <strong>Wallet Addresses: </strong>
                                {(() => {
                                    const allWallets = new Set<string>();
                                    Object.values(funnelData.campaign_performance).forEach((campaign: any) => {
                                        (campaign.wallet_addresses || []).forEach((wallet: string) => allWallets.add(wallet));
                                    });
                                    const walletArray = Array.from(allWallets);
                                    if (walletArray.length === 0) {
                                        return 'No wallets found';
                                    }
                                    return walletArray.map((wallet, index) => (
                                        <React.Fragment key={wallet}>
                                            <Tooltip title={wallet}>
                                                <span className="cursor-help">
                                                    {`${wallet.slice(0, 6)}...${wallet.slice(-4)}`}
                                                </span>
                                            </Tooltip>
                                            {index < walletArray.length - 1 && ', '}
                                        </React.Fragment>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>
                }
                buttons={
                    <RangePicker
                        value={[moment(fromDate), moment(toDate)]}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setDateRange(
                                    dates[0].format('YYYY-MM-DD'),
                                    dates[1].format('YYYY-MM-DD')
                                );
                            }
                        }}
                        allowClear={false}
                    />
                }
            />

            {funnelDataLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Spinner size="lg" />
                </div>
            ) : hasError ? (
                <Alert
                    type="error"
                    message={funnelDataError || "No Web2 to Web3 data found"}
                    description={
                        <div>
                            <p>We couldn't find any Web2 to Web3 data for this team.</p>
                            <LemonButton
                                type="primary"
                                to={urls.web23Dashboard(effectiveTeamId || '1')}
                                className="mt-4"
                            >
                                Go to dashboard
                            </LemonButton>
                        </div>
                    }
                />
            ) : funnelData && funnelData.summary ? (
                <div className="space-y-4">
                    {/* Summary Cards */}
                    <Row gutter={16}>
                        <Col span={6}>
                            <Card>
                                <Statistic 
                                    title="Total Visits" 
                                    value={funnelData.summary.total_visits} 
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic 
                                    title="Total Engagement" 
                                    value={funnelData.summary.total_engagement} 
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic 
                                    title="Total Conversions" 
                                    value={funnelData.summary.total_conversions} 
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic 
                                    title="Conversion Rate" 
                                    value={(funnelData.summary.overall_conversion_rate * 100).toFixed(2)} 
                                    suffix="%" 
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Funnel Stages */}
                    <Card title="Funnel Stages">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic 
                                    title="Awareness" 
                                    value={funnelData.summary.total_visits} 
                                />
                                <Progress 
                                    percent={100} 
                                    showInfo={false} 
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic 
                                    title="Engagement" 
                                    value={funnelData.summary.total_engagement} 
                                />
                                <Progress 
                                    percent={(funnelData.summary.awareness_to_engagement_rate * 100)} 
                                    showInfo={false} 
                                />
                                <small>{(funnelData.summary.awareness_to_engagement_rate * 100).toFixed(2)}% of visits</small>
                            </Col>
                            <Col span={8}>
                                <Statistic 
                                    title="Conversion" 
                                    value={funnelData.summary.total_conversions} 
                                />
                                <Progress 
                                    percent={(funnelData.summary.engagement_to_conversion_rate * 100)} 
                                    showInfo={false} 
                                />
                                <small>{(funnelData.summary.engagement_to_conversion_rate * 100).toFixed(2)}% of engagement</small>
                            </Col>
                        </Row>
                    </Card>

                    {/* Transaction Value Metrics */}
                    <Card title="Transaction Metrics">
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic 
                                    title="Total Value" 
                                    value={funnelData.summary.total_transaction_value.toFixed(2)} 
                                    prefix="$" 
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic 
                                    title="Average Value" 
                                    value={funnelData.summary.avg_transaction_value.toFixed(2)} 
                                    prefix="$" 
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic 
                                    title="Median Value" 
                                    value={funnelData.summary.median_transaction_value.toFixed(2)} 
                                    prefix="$" 
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic 
                                    title="Standard Deviation" 
                                    value={funnelData.summary.std_dev_transaction_value.toFixed(2)} 
                                    prefix="$" 
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Time to Conversion */}
                    <Card title="Time to Conversion">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic 
                                    title="Average Time" 
                                    value={funnelData.time_to_conversion.avg_minutes.toFixed(0)} 
                                    suffix="minutes" 
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic 
                                    title="Median Time" 
                                    value={funnelData.time_to_conversion.median_minutes.toFixed(0)} 
                                    suffix="minutes" 
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <h4>Distribution</h4>
                        <PieChart
                            data={Object.entries(funnelData.time_to_conversion.distribution).map(([key, value]) => ({
                                name: key,
                                value: value
                            }))}
                        />
                    </Card>

                    {/* Weekly Metrics */}
                    <Card title="Weekly Metrics">
                        <Table
                            dataSource={funnelData.weekly_metrics.map(week => ({
                                ...week,
                                key: week.week,
                                visits_wow_formatted: week.visits_wow ? `${(week.visits_wow * 100).toFixed(2)}%` : '-',
                                engagement_wow_formatted: week.engagement_wow ? `${(week.engagement_wow * 100).toFixed(2)}%` : '-',
                                transactions_wow_formatted: week.transactions_wow ? `${(week.transactions_wow * 100).toFixed(2)}%` : '-',
                                conversion_rate_formatted: `${(week.conversion_rate * 100).toFixed(2)}%`,
                                conversion_rate_wow_formatted: week.conversion_rate_wow ? `${(week.conversion_rate_wow * 100).toFixed(2)}%` : '-',
                            }))}
                            columns={[
                                {
                                    title: 'Week',
                                    dataIndex: 'week',
                                    render: (_, record) => `Week ${record.week} (${record.date_range})`,
                                },
                                {
                                    title: 'Visits',
                                    dataIndex: 'visits',
                                },
                                {
                                    title: 'WoW',
                                    dataIndex: 'visits_wow_formatted',
                                },
                                {
                                    title: 'Engagement',
                                    dataIndex: 'engagement',
                                },
                                {
                                    title: 'WoW',
                                    dataIndex: 'engagement_wow_formatted',
                                },
                                {
                                    title: 'Transactions',
                                    dataIndex: 'transactions',
                                },
                                {
                                    title: 'WoW',
                                    dataIndex: 'transactions_wow_formatted',
                                },
                                {
                                    title: 'Conversion Rate',
                                    dataIndex: 'conversion_rate_formatted',
                                },
                                {
                                    title: 'WoW',
                                    dataIndex: 'conversion_rate_wow_formatted',
                                },
                            ]}
                        />
                    </Card>

                    {/* Device Analytics */}
                    <Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab="Devices" key="1">
                            <PieChart
                                data={Object.entries(funnelData.device_analytics.devices).map(([key, value]) => ({
                                    name: key,
                                    value: value
                                }))}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Browsers" key="2">
                            <PieChart
                                data={Object.entries(funnelData.device_analytics.browsers).map(([key, value]) => ({
                                    name: key,
                                    value: value
                                }))}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Operating Systems" key="3">
                            <PieChart
                                data={Object.entries(funnelData.device_analytics.operating_systems).map(([key, value]) => ({
                                    name: key,
                                    value: value
                                }))}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Geo Analytics" key="4">
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Card title="Continents">
                                        <PieChart
                                            data={Object.entries(funnelData.geo_analytics.continents).map(([key, value]) => ({
                                                name: key,
                                                value: value
                                            }))}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card title="Countries">
                                        <PieChart
                                            data={Object.entries(funnelData.geo_analytics.countries).map(([key, value]) => ({
                                                name: key,
                                                value: value
                                            }))}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card title="Cities">
                                        <PieChart
                                            data={Object.entries(funnelData.geo_analytics.cities).map(([key, value]) => ({
                                                name: key,
                                                value: value
                                            }))}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card title="Regions">
                                        <PieChart
                                            data={Object.entries(funnelData.geo_analytics.regions).map(([key, value]) => ({
                                                name: key,
                                                value: value
                                            }))}
                                        />
                                    </Card>
                                </Col>
                                <Col span={24}>
                                    <Card title="Timezones">
                                        <PieChart
                                            data={Object.entries(funnelData.geo_analytics.timezones).map(([key, value]) => ({
                                                name: key,
                                                value: value
                                            }))}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Tabs.TabPane>
                    </Tabs>

                    {/* Campaign Performance */}
                    <Card title="Campaign Performance">
                        <Table
                            dataSource={Object.entries(funnelData.campaign_performance || {}).map(([campaign, data]: [string, any]) => ({
                                key: campaign,
                                campaign: campaign,
                                visits: data.visits || 0,
                                sources: Object.entries(data.sources || {})
                                    .map(([source, count]) => `${source} (${count})`)
                                    .join(', ') || 'No sources',
                                medium: Object.entries(data.medium || {})
                                    .map(([medium, count]) => `${medium} (${count})`)
                                    .join(', ') || 'No medium',
                                geo: Object.entries(data.geo || {})
                                    .map(([geo, count]) => `${geo} (${count})`)
                                    .join(', ') || 'No locations',
                                wallets: (data.wallet_addresses || [])
                                    .map((wallet: string) => `${wallet.slice(0, 6)}...${wallet.slice(-4)}`)
                                    .join(', ') || 'No wallets'
                            }))}
                            columns={[
                                {
                                    title: 'Campaign',
                                    dataIndex: 'campaign',
                                    key: 'campaign'
                                },
                                {
                                    title: 'Visits',
                                    dataIndex: 'visits',
                                    key: 'visits',
                                    sorter: (a: any, b: any) => a.visits - b.visits
                                },
                                {
                                    title: 'Sources',
                                    dataIndex: 'sources',
                                    key: 'sources'
                                },
                                {
                                    title: 'Medium',
                                    dataIndex: 'medium',
                                    key: 'medium'
                                },
                                {
                                    title: 'Locations',
                                    dataIndex: 'geo',
                                    key: 'geo'
                                },
                                {
                                    title: 'Wallet Addresses',
                                    dataIndex: 'wallets',
                                    key: 'wallets'
                                }
                            ]}
                            pagination={false}
                            locale={{ emptyText: 'No campaign data available' }}
                        />
                    </Card>
                </div>
            ) : (
                <div className="flex justify-center items-center h-40">
                    <div className="text-center">
                        <h3>No data available</h3>
                        <p>Try adjusting your date range or check back later.</p>
                        <LemonButton type="primary" onClick={() => loadFunnelData()}>
                            Reload Data
                        </LemonButton>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Web23Dashboard 