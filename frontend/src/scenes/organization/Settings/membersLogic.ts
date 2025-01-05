import { kea } from 'kea'
import api from 'lib/api'
import type { membersLogicType } from './membersLogicType'

export const membersLogic = kea<membersLogicType>({
    path: ['scenes', 'organization', 'Settings', 'membersLogic'],
    actions: {
        loadMembers: true,
        loadMembersSuccess: (members: any[]) => ({ members }),
    },
    reducers: {
        members: [
            [] as any[],
            {
                loadMembersSuccess: (_, { members }) => members || [],
            },
        ],
    },
    loaders: {
        members: {
            loadMembers: async () => {
                try {
                    const response = await api.get('/api/organizations/@current/members/')
                    return response.data?.results || []
                } catch (error) {
                    console.error('Failed to load members:', error)
                    return []
                }
            },
        },
    },
})
