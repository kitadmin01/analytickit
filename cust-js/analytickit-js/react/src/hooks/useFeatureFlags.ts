import { useEffect, useCallback } from 'react'
import { useAnalyticKitContext, FeatureFlags } from '../context'

/**
 * A hook that fetches active feature flags and determines which flags are enabled for the user.
 * @param props.refreshInterval - How often to refresh the feature flags, in seconds.
 * @param props.sendEvent - A flag that controls whether an event will be sent on flag refresh.
 * @returns An object containing active flags and flags that are enabled for the user.
 */
export function useFeatureFlags(props: { refreshInterval?: number; sendEvent?: boolean } = {}): FeatureFlags {
    const { refreshInterval = 0, sendEvent = true } = props
    const { client: analytickit, featureFlags, setFeatureFlags } = useAnalyticKitContext()

    const getEnabledFlags = useCallback(
        (flags): void => {
            const enabled = flags.reduce((result: FeatureFlags['enabled'], flag: string) => {
                const flagValue = analytickit?.getFeatureFlag(flag, {
                    send_event: sendEvent,
                })
                if (typeof flagValue !== 'undefined') {
                    result[flag] = flagValue
                }
                return result
            }, {})
            setFeatureFlags({ active: flags, enabled })
        },
        [analytickit, sendEvent, setFeatureFlags]
    )

    useEffect(() => {
        if (analytickit && refreshInterval > 0) {
            const interval = setInterval(() => {
                analytickit?.featureFlags.reloadFeatureFlags()
            }, refreshInterval * 1000)
            return () => clearInterval(interval)
        }
    }, [analytickit, refreshInterval, getEnabledFlags])

    useEffect(() => {
        analytickit?.onFeatureFlags(getEnabledFlags)
    }, [analytickit, getEnabledFlags])

    return featureFlags
}