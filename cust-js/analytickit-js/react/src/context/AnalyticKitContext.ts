import React, { useContext } from 'react'
import { AnalyticKitProviderValue } from './AnalyticKitProvider'

// Track the AnalyticKit context in global state to ensure that all consumers of the context
// are accessing the same context object
const cache = new Map<typeof React.createContext, React.Context<any>>()

/**
 * A helper function that stores the AnalyticKit context in global state
 * @returns The React context that contains the AnalyticKit context
 */
export function getAnalyticKitContext(): React.Context<any> {
    let context: React.Context<any> | undefined = cache.get(React.createContext)
    if (!context) {
        context = React.createContext<any>({})
        cache.set(React.createContext, context)
    }
    return context
}

/**
 * An abstraction for consuming the AnalyticKit context
 * @returns The AnalyticKit context object
 */
export function useAnalyticKitContext(): AnalyticKitProviderValue {
    const context = useContext(getAnalyticKitContext())
    if (!context.client) {
        throw new Error(
            'No AnalyticKit client instance can be found. ' +
                'Please ensure that your application is wrapped by `AnalyticKitProvider`.'
        )
    }
    return context
}
