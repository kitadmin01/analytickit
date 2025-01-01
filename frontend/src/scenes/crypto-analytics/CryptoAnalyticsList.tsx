import { Table, Button, Spin } from 'antd'
import { useActions } from 'kea'
import { cryptoAnalyticsLogic } from './cryptoAnalyticsLogic'
import { CryptoAnalytic } from './types'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

interface CryptoAnalyticsListProps {
    cryptoAnalytics: CryptoAnalytic[]
    loading: boolean
    onLoad: () => void
}

export function CryptoAnalyticsList({ cryptoAnalytics, loading, onLoad }: CryptoAnalyticsListProps): JSX.Element {
    const { deleteCryptoAnalytic } = useActions(cryptoAnalyticsLogic)

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Created By',
            dataIndex: ['created_by', 'first_name'],
            key: 'created_by',
        },
        {
            title: 'Last Modified',
            dataIndex: 'last_modified_at',
            key: 'last_modified_at',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: CryptoAnalytic) => (
                <div>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {/* Handle edit */}}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => deleteCryptoAnalytic(record.id)}
                        danger
                    />
                </div>
            ),
        },
    ]

    return (
        <Spin spinning={loading}>
            <Table
                dataSource={cryptoAnalytics}
                columns={columns}
                rowKey="id"
            />
        </Spin>
    )
}