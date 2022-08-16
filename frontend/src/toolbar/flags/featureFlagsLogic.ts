import{kea}from'kea'
import {CombinedFeatureFlagAndValueType}from '~/types'
import type {featureFlagsLogicType}from './featureFlagsLogicType'
import {toolbarFetch} from '~/toolbar/utils'
import {toolbarLogic}from '~/toolbar/toolbarLogic'
import Fuse from 'fuse.js'
import type {analytickit}from 'analytickit-js'
import {analytickit}from '~/toolbar/analytickit'
import {encodeParams}from 'kea-router'
import {FEATURE_FLAGS}from 'lib/constants'

export const featureFlagsLogic = kea<featureFlagsLogicType>({
path: ['toolbar', 'flags', 'featureFlagsLogic'],
actions: {
getUserFlags: true,
setOverriddenUserFlag: (flagKey: string, overrideValue: string | boolean) => ({ flagKey, overrideValue }),
        deleteOverriddenUserFlag: (flagKey: string) => ({ flagKey }),
        setSearchTerm: (searchTerm: string) => ({ searchTerm }),
        checkLocalOverrides: true,
        storeLocalOverrides: (localOverrides: Record<string, string | boolean>) => ({ localOverrides }),
    },
    connect: () => [toolbarLogic],
    listeners: ({ actions, values }) => ({
        checkLocalOverrides: () => {
            const { analytickit: clientanalytickit } = toolbarLogic.values
            if (clientanalytickit) {
                const locallyOverrideFeatureFlags = clientanalytickit.get_property('$override_feature_flags') || {}
                actions.storeLocalOverrides(locallyOverrideFeatureFlags)
            }
        },
        setOverriddenUserFlag: ({ flagKey, overrideValue }) => {
            const { analytickit: clientanalytickit } = toolbarLogic.values
            if (clientanalytickit) {
                clientanalytickit.featureFlags.override({ ...values.localOverrides, [flagKey]: overrideValue })
                analytickit.capture('toolbar feature flag overridden')
                actions.checkLocalOverrides()
                toolbarLogic.values.analytickit?.featureFlags.reloadFeatureFlags()
            }
        },
        deleteOverriddenUserFlag: async ({ flagKey }) => {
            const { analytickit: clientanalytickit } = toolbarLogic.values
            if (clientanalytickit) {
                const updatedFlags = { ...values.localOverrides }
                delete updatedFlags[flagKey]
                if (Object.keys(updatedFlags).length > 0) {
                    clientanalytickit.featureFlags.override({ ...updatedFlags })
                } else {
                    clientanalytickit.featureFlags.override(false)
                }
                analytickit.capture('toolbar feature flag override removed')
                actions.checkLocalOverrides()
                toolbarLogic.values.analytickit?.featureFlags.reloadFeatureFlags()
            }
        },
    }),
    loaders: () => ({
        userFlags: [
            [] as CombinedFeatureFlagAndValueType[],
            {
                getUserFlags: async (_, breakpoint) => {
                    const params = {
                        groups: getGroups(toolbarLogic.values.analytickit),
                    }
                    const response = await toolbarFetch(
                        `/api/projects/@current/feature_flags/my_flags${encodeParams(params, '?')}`
)

if(response.status >= 400) {
                        toolbarLogic.actions.tokenExpired()
                        return []
                    }

                    breakpoint()
                    if (!response.ok) {
                        return []
                    }
                    return await response.json()
                },
            },
        ],
    }),
    reducers: {
        localOverrides: [
            {} as Record<string, string | boolean>,
            {
                storeLocalOverrides: (_, { localOverrides }) => localOverrides,
            },
        ],
        searchTerm: [
            '',
            {
                setSearchTerm: (_, { searchTerm }) => searchTerm,
            },
        ],
    },
    selectors: {
        userFlagsWithOverrideInfo: [
            (s) => [s.userFlags, s.localOverrides],
            (userFlags, localOverrides) => {
                return userFlags.map((flag) => {
                    const hasVariants = (flag.feature_flag.filters?.multivariate?.variants?.length || 0) > 0

                    const currentValue =
                        flag.feature_flag.key in localOverrides ? localOverrides[flag.feature_flag.key] : flag.value

                    return {
                        ...flag,
                        hasVariants,
                        currentValue,
                        hasOverride: flag.feature_flag.key in localOverrides,
                    }
                })
            },
        ],
        filteredFlags: [
            (s) => [s.searchTerm, s.userFlagsWithOverrideInfo],
            (searchTerm, userFlagsWithOverrideInfo) => {
                return searchTerm
                    ? new Fuse(userFlagsWithOverrideInfo, {
                          threshold: 0.3,
                          keys: ['feature_flag.key', 'feature_flag.name'],
                      })
                          .search(searchTerm)
                          .map(({ item }) => item)
                    : userFlagsWithOverrideInfo
            },
        ],
        countFlagsOverridden: [(s) => [s.localOverrides], (localOverrides) => Object.keys(localOverrides).length],
        // Remove once `simplify-actions` FF is released
        shouldSimplifyActions: [
            (s) => [s.userFlagsWithOverrideInfo],
            (flags) => flags.find((f) => f.feature_flag.name === FEATURE_FLAGS.SIMPLIFY_ACTIONS)?.currentValue || false,
        ],
    },
    events: ({ actions }) => ({
        afterMount: async () => {
            await actions.getUserFlags()
            actions.checkLocalOverrides()
        },
    }),
})

function getGroups(analytickitInstance: analytickit | null): Record<string, any> {
    try {
        return analytickitInstance?.getGroups() || {}
    } catch {
        return {}
    }
}
