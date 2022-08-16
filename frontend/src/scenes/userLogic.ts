import{actions, afterMount, connect, kea, listeners, path, reducers, selectors}from 'kea'
import api from 'lib/api'
import type {userLogicType}from './userLogicType'
import {AvailableFeature, OrganizationBasicType, UserType}from '~/types'
import analytickit from 'analytickit-js'
import {getAppContext}from 'lib/utils/getAppContext'
import {preflightLogic}from './PreflightCheck/preflightLogic'
import { lemonToast}from 'lib/components/lemonToast'
import {loaders}from 'kea-loaders'
import {forms}from 'kea-forms'

export interface UserDetailsFormType {
first_name: string
}

export const userLogic = kea<userLogicType>([
path(['scenes', 'userLogic']),
    connect({
        values: [preflightLogic, ['preflight']],
    }),
    actions(() => ({
        loadUser: (resetOnFailure?: boolean) => ({ resetOnFailure }),
        updateCurrentTeam: (teamId: number, destination?: string) => ({ teamId, destination }),
        updateCurrentOrganization: (organizationId: string, destination?: string) => ({ organizationId, destination }),
        logout: true,
        updateUser: (user: Partial<UserType>, successCallback?: () => void) => ({ user, successCallback }),
    })),
    forms(({ actions }) => ({
        userDetails: {
            errors: ({ first_name }) => ({
                first_name: !first_name
                    ? 'You need to set a name'
                    : first_name.length > 150
                    ? 'The name you have given is too long. Please pick something shorter.'
                    : null,
            }),
            submit: (user) => {
                actions.updateUser(user)
            },
        },
    })),
    loaders(({ values, actions }) => ({
        user: [
            // TODO: Because we don't actually load the app until this request completes, `user` is never `null` (will help simplify checks across the app)
            null as UserType | null,
            {
                loadUser: async () => {
                    try {
                        return await api.get('api/users/@me/')
                    } catch (error: any) {
                        console.error(error)
                        actions.loadUserFailure(error.message)
                    }
                    return null
                },
                updateUser: async ({ user, successCallback }) => {
                    if (!values.user) {
                        throw new Error('Current user has not been loaded yet, so it cannot be updated!')
                    }
                    try {
                        const response = await api.update('api/users/@me/', user)
                        successCallback && successCallback()
                        return response
                    } catch (error: any) {
                        console.error(error)
                        actions.updateUserFailure(error.message)
                    }
                },
            },
        ],
    })),
    reducers({
        userDetails: [
            {} as UserDetailsFormType,
            {
                loadUserSuccess: (_, { user }) => ({
                    first_name: user?.first_name || '',
                }),
                updateUserSuccess: (_, { user }) => ({
                    first_name: user?.first_name || '',
                }),
            },
        ],
    }),
    listeners(({ values }) => ({
        logout: () => {
            analytickit.reset()
            window.location.href = '/logout'
        },
        loadUserSuccess: ({ user }) => {
            if (user && user.uuid) {
                const Sentry = (window as any).Sentry
                Sentry?.setUser({
                    email: user.email,
                    id: user.uuid,
                })

                if (analytickit) {
                    // If user is not anonymous and the distinct id is different from the current one, reset
                    if (
                        analytickit.get_property('$device_id') !== analytickit.get_distinct_id() &&
                        analytickit.get_distinct_id() !== user.distinct_id
                    ) {
                        analytickit.reset()
                    }

                    analytickit.identify(user.distinct_id)
                    analytickit.people.set({
                        email: user.anonymize_data ? null : user.email,
                        realm: user.realm,
                        analytickit_version: user.analytickit_version,
                    })

                    analytickit.register({
                        is_demo_project: user.team?.is_demo,
                    })

                    if (user.team) {
                        analytickit.group('project', user.team.uuid, {
                            id: user.team.id,
                            uuid: user.team.uuid,
                            name: user.team.name,
                            ingested_event: user.team.ingested_event,
                            is_demo: user.team.is_demo,
                            timezone: user.team.timezone,
                        })
                    }

                    if (user.organization) {
                        analytickit.group('organization', user.organization.id, {
                            id: user.organization.id,
                            name: user.organization.name,
                            slug: user.organization.slug,
                            created_at: user.organization.created_at,
                            available_features: user.organization.available_features,
                            ...user.organization.metadata,
                        })
                    }
                }
            }
        },
        updateUserSuccess: () => {
            lemonToast.dismiss('updateUser')
            lemonToast.success('Preferences saved', {
                toastId: 'updateUser',
            })
        },
        updateCurrentTeam: async ({ teamId, destination }, breakpoint) => {
            if (values.user?.team?.id === teamId) {
                return
            }
            await breakpoint(10)
            await api.update('api/users/@me/', { set_current_team: teamId })
            window.location.href = destination || '/'
        },
        updateCurrentOrganization: async ({ organizationId, destination }, breakpoint) => {
            if (values.user?.organization?.id === organizationId) {
                return
            }
            await breakpoint(10)
            await api.update('api/users/@me/', { set_current_organization: organizationId })
            window.location.href = destination || '/'
        },
    })),
    selectors({
        hasAvailableFeature: [
            (s) => [s.user],
            (user) => {
                return (feature: AvailableFeature) => !!user?.organization?.available_features.includes(feature)
            },
        ],
        upgradeLink: [
            (s) => [s.preflight],
            (preflight): string =>
                preflight?.cloud
                    ? '/organization/billing'
                    : 'https://license.analytickit.com?utm_medium=in-product&utm_campaign=in-product-upgrade',
        ],
        otherOrganizations: [
            (s) => [s.user],
            (user): OrganizationBasicType[] =>
                user
                    ? user.organizations
                          ?.filter((organization) => organization.id !== user.organization?.id)
                          .sort((orgA, orgB) =>
                              orgA.id === user?.organization?.id ? -2 : orgA.name.localeCompare(orgB.name)
                          ) || []
                    : [],
        ],
    }),
    afterMount(({ actions }) => {
        const preloadedUser = getAppContext()?.current_user
        if (preloadedUser) {
            actions.loadUserSuccess(preloadedUser)
        } else if (preloadedUser === null) {
            actions.loadUserFailure('Logged out')
        } else {
            actions.loadUser()
        }
    }),
])
