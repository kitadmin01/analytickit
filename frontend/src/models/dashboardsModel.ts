import { kea } from 'kea'
import { router } from 'kea-router'
import api from 'lib/api'
import { delay, idToKey, isUserLoggedIn } from 'lib/utils'
import { DashboardEventSource, eventUsageLogic } from 'lib/utils/eventUsageLogic'
import React from 'react'
import type { dashboardsModelType } from './dashboardsModelType'
import { InsightModel, DashboardType, InsightShortId, CryptoDashboardType } from '~/types'
import { urls } from 'scenes/urls'
import { teamLogic } from 'scenes/teamLogic'
import { lemonToast } from 'lib/components/lemonToast'

export const dashboardsModel = kea<dashboardsModelType>({
    path: ['models', 'dashboardsModel'],
    actions: () => ({
        delayedDeleteDashboard: (id: string) => ({ id }),
        setDiveSourceId: (id: InsightShortId | null) => ({ id }),
        setLastDashboardId: (id: string) => ({ id }),
        addDashboardSuccess: (dashboard: DashboardType | CryptoDashboardType) => ({ dashboard }),
        updateDashboardItem: (item: InsightModel, dashboardIds?: Array<string>) => ({
            item,
            dashboardIds,
        }),
        updateDashboardRefreshStatus: (
            shortId: string | undefined | null,
            refreshing: boolean | null,
            last_refresh: string | null
        ) => ({
            shortId,
            refreshing,
            last_refresh,
        }),
        pinDashboard: (id: string, source: DashboardEventSource) => ({ id, source }),
        unpinDashboard: (id: string, source: DashboardEventSource) => ({ id, source }),
        loadDashboards: true,
        duplicateDashboard: ({ id, name, show }: { id: string; name?: string; show?: boolean }) => ({
            id,
            name: name || `#${id}`,
            show: show || false,
        }),
    }),
    loaders: ({ values }) => ({
        rawDashboards: [
            {} as Record<string, DashboardType | CryptoDashboardType>,
            {
                loadDashboards: async (_, breakpoint) => {
                    const exportedDashboard = window.ANALYTICKIT_EXPORTED_DATA?.dashboard
                    if (exportedDashboard?.id && exportedDashboard?.items) {
                        return { [`web2-${exportedDashboard.id}`]: exportedDashboard }
                    }

                    await breakpoint(50)

                    if (!isUserLoggedIn()) {
                        return {}
                    }

                    // Fetch Web2 dashboards
                    const { results: web2Dashboards } = await api.get(
                        `api/projects/${teamLogic.values.currentTeamId}/dashboards/?limit=300`
                    )

                    // Add type "Web2" and prefix ID
                    const web2DashboardsWithType = web2Dashboards.map((dashboard: DashboardType) => ({
                        ...dashboard,
                        id: `web2-${dashboard.id}`,
                        type: 'Web2',
                    }))

                    // Fetch Crypto dashboards
                    const { results: cryptoDashboards } = await api.get(`api/web3-dashboard/?limit=300`)

                    // Add type "Web3" and prefix ID
                    const cryptoDashboardsWithType = cryptoDashboards.map((dashboard: CryptoDashboardType) => ({
                        ...dashboard,
                        id: `web3-${dashboard.id}`,
                        type: 'Web3',
                    }))

                    // Combine both Web2 and Web3 dashboards
                    const allDashboards = [...web2DashboardsWithType, ...cryptoDashboardsWithType]

                    return idToKey(allDashboards ?? [])
                },
            },
        ],
        dashboard: {
            __default: null as null | DashboardType | CryptoDashboardType,
            updateDashboard: async ({ id, ...payload }, breakpoint) => {
                if (!Object.entries(payload).length) {
                    return
                }
                await breakpoint(700)

                const [prefix, dashboardId] = id.split('-')
                const url =
                    prefix === 'web2'
                        ? `api/projects/${teamLogic.values.currentTeamId}/dashboards/${dashboardId}`
                        : `api/web3-dashboard-detail/${dashboardId}`

                const response = (await api.update(url, payload)) as DashboardType | CryptoDashboardType
                return response
            },
            deleteDashboard: async ({ id }) => {
                const [prefix, dashboardId] = id.split('-')
                const url =
                    prefix === 'web2'
                        ? `api/projects/${teamLogic.values.currentTeamId}/dashboards/${dashboardId}`
                        : `api/web3-dashboard-detail/${dashboardId}`
                return (await api.update(url, {
                    deleted: true,
                })) as DashboardType | CryptoDashboardType
            },
            restoreDashboard: async ({ id }) => {
                const [prefix, dashboardId] = id.split('-')
                const url =
                    prefix === 'web2'
                        ? `api/projects/${teamLogic.values.currentTeamId}/dashboards/${dashboardId}`
                        : `api/crypto-dashboard/${dashboardId}`
                return (await api.update(url, {
                    deleted: false,
                })) as DashboardType | CryptoDashboardType
            },
            pinDashboard: async ({ id, source }) => {
                const [prefix, dashboardId] = id.split('-')
                const url =
                    prefix === 'web2'
                        ? `api/projects/${teamLogic.values.currentTeamId}/dashboards/${dashboardId}`
                        : `api/crypto-dashboard/${dashboardId}`
                const response = (await api.update(url, {
                    pinned: true,
                })) as DashboardType | CryptoDashboardType
                eventUsageLogic.actions.reportDashboardPinToggled(true, source)
                return response
            },
            unpinDashboard: async ({ id, source }) => {
                const [prefix, dashboardId] = id.split('-')
                const url =
                    prefix === 'web2'
                        ? `api/projects/${teamLogic.values.currentTeamId}/dashboards/${dashboardId}`
                        : `api/crypto-dashboard/${dashboardId}`
                const response = (await api.update(url, {
                    pinned: false,
                })) as DashboardType | CryptoDashboardType
                eventUsageLogic.actions.reportDashboardPinToggled(false, source)
                return response
            },
            duplicateDashboard: async ({ id, name, show }) => {
                const [prefix, dashboardId] = id.split('-')
                const url =
                    prefix === 'web2'
                        ? `api/projects/${teamLogic.values.currentTeamId}/dashboards/`
                        : `api/crypto-dashboard/`
                const result = (await api.create(url, {
                    use_dashboard: dashboardId,
                    name: `${name} (Copy)`,
                })) as DashboardType | CryptoDashboardType
                if (show) {
                    router.actions.push(urls.dashboard(result.id))
                }
                return result
            },
        },
    }),

    reducers: {
        redirect: [
            true,
            {
                deleteDashboard: (state, { redirect }) => (typeof redirect !== 'undefined' ? redirect : state),
                restoreDashboard: (state, { redirect }) => (typeof redirect !== 'undefined' ? redirect : state),
            },
        ],
        rawDashboards: {
            addDashboardSuccess: (state, { dashboard }) => ({ ...state, [dashboard.id]: dashboard }),
            restoreDashboardSuccess: (state, { dashboard }) => ({ ...state, [dashboard.id]: dashboard }),
            updateDashboardSuccess: (state, { dashboard }) =>
                dashboard ? { ...state, [dashboard.id]: dashboard } : state,
            deleteDashboardSuccess: (state, { dashboard }) => ({
                ...state,
                [dashboard.id]: { ...state[dashboard.id], deleted: true },
            }),
            delayedDeleteDashboard: (state, { id }) => {
                const { [id]: _discard, ...rest } = state
                return rest
            },
            pinDashboardSuccess: (state, { dashboard }) => ({ ...state, [dashboard.id]: dashboard }),
            unpinDashboardSuccess: (state, { dashboard }) => ({ ...state, [dashboard.id]: dashboard }),
            duplicateDashboardSuccess: (state, { dashboard }) => ({
                ...state,
                [dashboard.id]: { ...dashboard, _highlight: true },
            }),
        },
        lastDashboardId: [
            null as null | string,
            { persist: true },
            {
                setLastDashboardId: (_, { id }) => id,
            },
        ],
    },

    selectors: ({ selectors }) => ({
        nameSortedDashboards: [
            () => [selectors.rawDashboards],
            (rawDashboards) => {
                return [...Object.values(rawDashboards)].sort((a, b) =>
                    (a.name ?? 'Untitled').localeCompare(b.name ?? 'Untitled')
                )
            },
        ],
        pinSortedDashboards: [
            () => [selectors.nameSortedDashboards],
            (nameSortedDashboards) => {
                return [...nameSortedDashboards].sort(
                    (a, b) =>
                        (Number(b.pinned) - Number(a.pinned)) * 10 +
                        (a.name ?? 'Untitled').localeCompare(b.name ?? 'Untitled')
                )
            },
        ],
        dashboardsLoading: [() => [selectors.rawDashboardsLoading], (dashesLoading) => dashesLoading],
        pinnedDashboards: [
            () => [selectors.nameSortedDashboards],
            (nameSortedDashboards) => nameSortedDashboards.filter((d) => d.pinned),
        ],
    }),

    events: ({ actions }) => ({
        afterMount: () => actions.loadDashboards(),
    }),

    listeners: ({ actions, values }) => ({
        addDashboardSuccess: ({ dashboard }) => {
            lemonToast.success('Dashboard created', {
                button: {
                    label: 'View',
                    action: () => router.actions.push(urls.dashboard(dashboard.id)),
                },
            })
        },

        restoreDashboardSuccess: ({ dashboard }) => {
            lemonToast.success(`Dashboard ${dashboard.name} restored`)
            if (values.redirect) {
                router.actions.push(urls.dashboard(dashboard.id))
            }
        },

        deleteDashboardSuccess: async ({ dashboard }) => {
            lemonToast.success(`Dashboard ${dashboard.name} deleted`, {
                button: {
                    label: 'Undo',
                    action: () => {
                        actions.restoreDashboard({ id: dashboard.id, redirect: values.redirect })
                    },
                },
            })

            const { id } = dashboard
            const nextDashboard = values.pinSortedDashboards.find((d) => d.id !== id && !d.deleted)

            if (values.redirect) {
                if (nextDashboard) {
                    router.actions.push(urls.dashboard(nextDashboard.id))
                } else {
                    router.actions.push(urls.dashboards())
                }
                await delay(500)
            }

            actions.delayedDeleteDashboard(id)
        },

        duplicateDashboardSuccess: async ({ dashboard }) => {
            lemonToast.success(`Dashboard copied as ${dashboard.name}`)
        },
    }),

    urlToAction: ({ actions }) => ({
        '/dashboard/:id': ({ id }) => {
            if (id) {
                actions.setLastDashboardId(id)
            }
        },
    }),
})
