import api from 'lib/api'
import { Web23FunnelData } from './web23Logic'

export const Web23Service = {
    getFunnelData: async (teamId: number, fromDate: string, days: number): Promise<Web23FunnelData> => {
        const response = await api.get(`api/web23/${teamId}/?from_date=${fromDate}&days=${days}`)
        return response
    },
} 