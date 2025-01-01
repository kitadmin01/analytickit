import { kea } from 'kea'
import api from 'lib/api'
import { DashboardType } from '~/types'
import type { dashboardsLogicType } from './dashboardsModelType'

export interface DashboardsLogicProps {
    // Add any props needed
}

export const dashboardsLogic = kea<dashboardsLogicType>({
    path: ['scenes', 'dashboards', 'dashboardsModel'],
    props: {} as DashboardsLogicProps,

    actions: {
        loadDashboards: true,
        setDashboards: (dashboards: DashboardType[]) => ({ dashboards }),
        setWeb2Dashboards: (web2Dashboards: DashboardType[]) => ({ web2Dashboards }),
        setWeb3Dashboards: (web3Dashboards: DashboardType[]) => ({ web3Dashboards }),
    },

    reducers: {
        dashboards: [
            [] as DashboardType[],
            {
                setDashboards: (_, { dashboards }) => dashboards,
            },
        ],
        web2Dashboards: [
            [] as DashboardType[],
            {
                setWeb2Dashboards: (_, { web2Dashboards }) => web2Dashboards,
            },
        ],
        web3Dashboards: [
            [] as DashboardType[],
            {
                setWeb3Dashboards: (_, { web3Dashboards }) => web3Dashboards,
            },
        ],
        loading: [
            true,
            {
                loadDashboards: () => true,
                setDashboards: () => false,
                setWeb2Dashboards: () => false,
                setWeb3Dashboards: () => false,
            },
        ],
    },

    listeners: ({ actions }) => ({
        loadDashboards: async () => {
            try {
                const [web2Response, web3Response] = await Promise.all([
                    api.get('/api/dashboards/'),
                    api.get('/api/web3-dashboard/')
                ])

                const web2Dashboards = web2Response?.data?.results || []
                const web3Dashboards = web3Response?.data?.results || []

                const formattedWeb2Dashboards = web2Dashboards.map(d => ({ ...d, type: 'web2' }))
                const formattedWeb3Dashboards = web3Dashboards.map(d => ({ ...d, type: 'web3' }))

                actions.setWeb2Dashboards(formattedWeb2Dashboards)
                actions.setWeb3Dashboards(formattedWeb3Dashboards)
                actions.setDashboards([...formattedWeb2Dashboards, ...formattedWeb3Dashboards])
            } catch (error) {
                console.error('Error loading dashboards:', error)
                actions.setDashboards([])
                actions.setWeb2Dashboards([])
                actions.setWeb3Dashboards([])
            }
        },
    }),

    selectors: {
        sortedDashboards: [
            (s) => [s.dashboards],
            (dashboards: DashboardType[]): DashboardType[] => {
                return dashboards
                    ? [...dashboards].sort((a, b) => {
                          if (a.pinned && !b.pinned) return -1
                          if (!a.pinned && b.pinned) return 1
                          return b.created_at.localeCompare(a.created_at)
                      })
                    : []
            },
        ],
        sortedWeb2Dashboards: [
            (s) => [s.web2Dashboards],
            (web2Dashboards: DashboardType[]): DashboardType[] => {
                return web2Dashboards
                    ? [...web2Dashboards].sort((a, b) => {
                          if (a.pinned && !b.pinned) return -1
                          if (!a.pinned && b.pinned) return 1
                          return b.created_at.localeCompare(a.created_at)
                      })
                    : []
            },
        ],
        sortedWeb3Dashboards: [
            (s) => [s.web3Dashboards],
            (web3Dashboards: DashboardType[]): DashboardType[] => {
                return web3Dashboards
                    ? [...web3Dashboards].sort((a, b) => {
                          if (a.pinned && !b.pinned) return -1
                          if (!a.pinned && b.pinned) return 1
                          return b.created_at.localeCompare(a.created_at)
                      })
                    : []
            },
        ],
    },

    events: ({ actions }) => ({
        afterMount: () => {
            actions.loadDashboards()
        },
    }),
})
