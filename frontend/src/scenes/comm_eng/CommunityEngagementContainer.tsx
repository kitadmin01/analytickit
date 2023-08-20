import React, { useState, useEffect } from 'react'
import CommunityEngagementTable from './components/CommunityEngagementTable'
import { fetchAllCommunityEngagements } from './services/CommunityEngagementService'
import { CommunityEngagement } from './models/CommunityEngagementModel'
import './CommunityEngagement.scss'

const CommunityEngagementContainer: React.FC = () => {
    const [data, setData] = useState<CommunityEngagement[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const result = await fetchAllCommunityEngagements()
                setData(result)
                setLoading(false)
            } catch (err: any) {
                setError(err.message)
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <p>Loading...</p>
    }
    if (error) {
        return <p>Error: {error}</p>
    }

    return (
        <div className="community-engagement-container">
            <h1>Community Engagement</h1>
            <CommunityEngagementTable data={data} />
        </div>
    )
}

export default CommunityEngagementContainer
