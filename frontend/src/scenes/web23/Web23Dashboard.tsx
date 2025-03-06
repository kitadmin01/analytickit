import React from 'react'
import { PageHeader } from 'lib/components/PageHeader'
import { useValues, useActions } from 'kea'
import { web23Logic } from './web23Logic'
import { Spinner } from 'lib/components/Spinner/Spinner'
import { LemonButton } from 'lib/components/LemonButton'
import { Card } from 'antd'
import { Table } from 'antd'
import { DateFilter } from 'lib/components/DateFilter/DateFilter'
import { teamLogic } from 'scenes/teamLogic'

export function Web23Dashboard(): JSX.Element {
    const { currentTeamId } = useValues(teamLogic)
    const logic = web23Logic({ dashboardItemId: currentTeamId?.toString() || 'web23_dashboard' })
    const { funnelData, funnelDataLoading, fromDate, toDate } = useValues(logic)
    const { loadFunnelData, setDateRange } = useActions(logic)

    return (
        <div>
            <PageHeader
                title="Web2 to Web3 Analytics"
                caption="Analyze your Web2 to Web3 conversion funnel"
                buttons={
                    <DateFilter
                        dateFrom={fromDate}
                        dateTo={toDate}
                        onChange={(fromDate, toDate) => setDateRange(fromDate, toDate)}
                        defaultValue="Last 30 days"
                    />
                }
            />

            {funnelDataLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Spinner size="lg" />
                </div>
            ) : funnelData ? (
                <div className="space-y-4">
                    <Card title="Summary">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <h5>Total Visits</h5>
                                <div className="text-2xl font-bold">{funnelData.summary.total_visits}</div>
                            </div>
                            <div>
                                <h5>Total Engagement</h5>
                                <div className="text-2xl font-bold">{funnelData.summary.total_engagement}</div>
                            </div>
                            <div>
                                <h5>Total Conversions</h5>
                                <div className="text-2xl font-bold">{funnelData.summary.total_conversions}</div>
                            </div>
                            <div>
                                <h5>Conversion Rate</h5>
                                <div className="text-2xl font-bold">
                                    {(funnelData.summary.overall_conversion_rate * 100).toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Weekly Metrics">
                        <Table
                            dataSource={funnelData.weekly_metrics}
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
                                    title: 'Engagement',
                                    dataIndex: 'engagement',
                                },
                                {
                                    title: 'Transactions',
                                    dataIndex: 'transactions',
                                },
                                {
                                    title: 'Conversion Rate',
                                    dataIndex: 'conversion_rate',
                                    render: (value) => `${(value * 100).toFixed(2)}%`,
                                },
                            ]}
                        />
                    </Card>

                    <Card title="Device Analytics">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h5>Devices</h5>
                                <Table
                                    dataSource={Object.entries(funnelData.device_analytics.devices).map(
                                        ([device, count], index) => ({
                                            key: index,
                                            device,
                                            count,
                                        })
                                    )}
                                    columns={[
                                        {
                                            title: 'Device',
                                            dataIndex: 'device',
                                        },
                                        {
                                            title: 'Count',
                                            dataIndex: 'count',
                                        },
                                    ]}
                                />
                            </div>
                            <div>
                                <h5>Browsers</h5>
                                <Table
                                    dataSource={Object.entries(funnelData.device_analytics.browsers).map(
                                        ([browser, count], index) => ({
                                            key: index,
                                            browser,
                                            count,
                                        })
                                    )}
                                    columns={[
                                        {
                                            title: 'Browser',
                                            dataIndex: 'browser',
                                        },
                                        {
                                            title: 'Count',
                                            dataIndex: 'count',
                                        },
                                    ]}
                                />
                            </div>
                        </div>
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