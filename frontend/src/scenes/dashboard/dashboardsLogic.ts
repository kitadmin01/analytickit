import { kea } from 'kea'
import Fuse from 'fuse.js'
import { dashboardsModel } from '~/models/dashboardsModel'
import type { dashboardsLogicType } from './dashboardsLogicType'
import { DashboardType, CryptoDashboardType, DashboardMode, InsightModel } from '~/types'
import type { DashboardEventSource } from '../../lib/utils/eventUsageLogic'
import { uniqueBy, toParams } from 'lib/utils'
import api from 'lib/api'
import { teamLogic } from 'scenes/teamLogic'

export enum DashboardsTab {
    All = 'all',
    Pinned = 'pinned',
    Shared = 'shared',
}

export const dashboardsLogic = kea<dashboardsLogicType>({
    path: ['scenes', 'dashboard', 'dashboardsLogic'],
    connect: {
        values: [teamLogic, ['currentTeamId']], // Connect the currentTeamId from teamLogic
    },
    actions: {
        setSearchTerm: (searchTerm: string) => ({ searchTerm }),
        setCurrentTab: (tab: DashboardsTab) => ({ tab }),
        setDashboardMode: (mode: DashboardMode | null, source: DashboardEventSource | null, isCrypto?: boolean) => ({
            mode,
            source,
            isCrypto,
        }),
        setReceivedErrorsFromAPI: (receivedErrors: boolean) => ({ receivedErrors }),
        setDates: (dateFrom: string, dateTo: string, refresh: boolean) => ({ dateFrom, dateTo, refresh }),
    },
    reducers: {
        searchTerm: {
            setSearchTerm: (_, { searchTerm }) => searchTerm,
        },
        currentTab: [
            DashboardsTab.All as DashboardsTab,
            {
                setCurrentTab: (_, { tab }) => tab,
            },
        ],
        receivedErrorsFromAPI: [
            false as boolean,
            {
                setReceivedErrorsFromAPI: (_, { receivedErrors }) => receivedErrors,
            },
        ],
    },
    selectors: {
        dashboards: [
            (selectors) => [dashboardsModel.selectors.nameSortedDashboards, selectors.searchTerm, selectors.currentTab],
            (dashboards, searchTerm, currentTab) => {
                dashboards = dashboards
                    .filter((d) => !d.deleted)
                    .sort((a, b) => (a.name ?? 'Untitled').localeCompare(b.name ?? 'Untitled'))
                if (currentTab === DashboardsTab.Pinned) {
                    dashboards = dashboards.filter((d) => d.pinned)
                } else if (currentTab === DashboardsTab.Shared) {
                    dashboards = dashboards.filter((d) => d.is_shared)
                }
                if (!searchTerm) {
                    return dashboards
                }
                return new Fuse(dashboards, {
                    keys: ['key', 'name'],
                    threshold: 0.3,
                })
                    .search(searchTerm)
                    .map((result) => result.item)
            },
        ],
        dashboardTags: [
            () => [dashboardsModel.selectors.nameSortedDashboards],
            (dashboards: DashboardType[]): string[] =>
                uniqueBy(
                    dashboards.flatMap(({ tags }) => tags || ''),
                    (item) => item
                ).sort(),
        ],
    },
    loaders: ({ actions, values }) => ({
        allItems: [
            [] as Array<DashboardType | CryptoDashboardType>,
            {
                loadDashboardItems: async ({ refresh }) => {
                    actions.setReceivedErrorsFromAPI(false)

                    try {
                        // Fetch Web2 dashboards
                        const web2Dashboards = await api.get(
                            `api/projects/${values.currentTeamId}/dashboards/?${toParams({ refresh })}`
                        )
                        console.log('Web2 Dashboards:', web2Dashboards)

                        // Fetch Web3 dashboards
                        const cryptoDashboards = await api.get(`api/web3-dashboard/?${toParams({ refresh })}`)
                        console.log('Web3 Dashboards:', cryptoDashboards)

                        // Combine both dashboards
                        const combinedDashboards = [...web2Dashboards.results, ...cryptoDashboards.results]
                        console.log('Combined Dashboards:', combinedDashboards)

                        return combinedDashboards
                    } catch (error: any) {
                        actions.setReceivedErrorsFromAPI(true)
                        if (error.status === 404) {
                            return []
                        }
                        throw error
                    }
                },
            },
        ],
    }),
    listeners: ({ actions, values, props }) => ({
        updateAndRefreshDashboard: async (_, breakpoint) => {
            console.log('Props in updateAndRefreshDashboard:', props)
            await breakpoint(200)
            const isCrypto = true // Determine if this is a CryptoDashboard
            const apiUrl = isCrypto
                ? `api/web3-dashboard/${props.id}`
                : `api/projects/${values.currentTeamId}/dashboards/${props.id}`
            await api.update(apiUrl, {
                filters: values.filters,
            })
            actions.loadDashboardItems({ refresh: true })
        },

        removeItem: async ({ insight }) => {
            console.log('Props in removeItem:', props)
            const isCrypto = props.isCrypto // Determine if this is a CryptoDashboard
            const apiUrl = isCrypto
                ? `api/crypto-analytics/${insight.id}`
                : `api/projects/${values.currentTeamId}/insights/${insight.id}`
            return api.update(apiUrl, {
                dashboards: insight.dashboards?.filter((id) => id !== props.id) ?? [],
            } as Partial<InsightModel>)
        },
    }),
})
