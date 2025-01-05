// frontend/src/scenes/crypto-analytics/CryptoAnalyticsTypeScene.tsx
import React from 'react'
import { useEffect, useState } from 'react'
import { Select, Input, Button, DatePicker } from 'antd'
import { CryptoAnalyticsGraph } from './CryptoAnalyticsGraph'
import { ACTIVE_USER_TYPES, DATE_RANGES, DAY_RANGES } from './constants'
import api from 'lib/api'

export function CryptoAnalyticsTypeScene(): JSX.Element {
    const [activeUserType, setActiveUserType] = useState(ACTIVE_USER_TYPES[0].value)
    const [dateRange, setDateRange] = useState(DATE_RANGES[0].value)
    const [dayRange, setDayRange] = useState(DAY_RANGES[0].value)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [graphData, setGraphData] = useState(null)

    useEffect(() => {
        loadGraphData()
    }, [activeUserType, dateRange, dayRange])

    const loadGraphData = async (): Promise<void> => {
        try {
            const response = await api.get(`/api/crypto/analytics/graph-data/?campaign_id=2`)

            if (!response.data?.data) {
                console.error('No data received from API')
                return
            }

            const formattedData = {
                data: response.data.data
                    .filter((item) => item && item.creation_ts && item.active_users)
                    .map((item: any) => ({
                        date: new Date(item.creation_ts).toISOString().split('T')[0],
                        value: item.active_users,
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
                metric: 'active_users',
            }
            setGraphData(formattedData)
        } catch (error) {
            console.error('Error loading graph data:', error)
        }
    }

    const handleSave = async (): Promise<void> => {
        try {
            await api.post('/api/crypto/analytics/save/', {
                title,
                description,
                metric: 'active_users',
                date_range: dateRange,
                day_range: dayRange,
                campaign_id: 2,
            })
            // Show success message
            alert('Analytics saved successfully!')
        } catch (error) {
            console.error('Error saving analytics:', error)
            alert('Error saving analytics')
        }
    }

    return (
        <div className="crypto-analytics-container">
            <div className="settings-panel">
                <div className="input-group">
                    <Input
                        placeholder="Enter title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                    />
                    <Input.TextArea
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                    />
                </div>

                <div className="filters">
                    <Select
                        style={{ width: 200, marginRight: '1rem' }}
                        options={ACTIVE_USER_TYPES}
                        value={activeUserType}
                        onChange={setActiveUserType}
                    />
                    <Select
                        style={{ width: 200, marginRight: '1rem' }}
                        options={DATE_RANGES}
                        value={dateRange}
                        onChange={setDateRange}
                    />
                    <Select style={{ width: 200 }} options={DAY_RANGES} value={dayRange} onChange={setDayRange} />
                </div>

                <Button type="primary" onClick={handleSave} style={{ marginTop: '1rem' }}>
                    Save
                </Button>
            </div>

            <div className="graph-container">
                {graphData && (
                    <CryptoAnalyticsGraph
                        data={graphData.data}
                        filters={{
                            token_type: activeUserType,
                            activeFilter: 'active_users',
                        }}
                    />
                )}
            </div>
        </div>
    )
}
