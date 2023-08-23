import { CommunityEngagement, CommunityEngagementCreatePayload } from './CommunityEngagementModel'

const API_ENDPOINT = '/api/com_eng'

export const fetchAllCommunityEngagements = async (): Promise<CommunityEngagement[]> => {
    const response = await fetch(API_ENDPOINT)
    if (!response.ok) {
        throw new Error('Failed to fetch Community Engagements')
    }
    return await response.json()
}

export const fetchCommunityEngagementById = async (id: number): Promise<CommunityEngagement> => {
    const response = await fetch(`${API_ENDPOINT}/${id}`)
    if (!response.ok) {
        throw new Error(`Failed to fetch Community Engagement with ID: ${id}`)
    }
    return await response.json()
}

export const createCommunityEngagement = async (
    payload: CommunityEngagementCreatePayload
): Promise<CommunityEngagement> => {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    if (!response.ok) {
        throw new Error('Failed to create Community Engagement')
    }
    return await response.json()
}

export const updateCommunityEngagement = async (
    id: number,
    payload: CommunityEngagement
): Promise<CommunityEngagement> => {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    if (!response.ok) {
        throw new Error(`Failed to update Community Engagement with ID: ${id}`)
    }
    return await response.json()
}

export const deleteCommunityEngagement = async (id: number): Promise<void> => {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'DELETE',
    })
    if (!response.ok) {
        throw new Error(`Failed to delete Community Engagement with ID: ${id}`)
    }
}
