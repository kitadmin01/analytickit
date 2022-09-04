import React, { useState, Dispatch, SetStateAction } from 'react'
import { AnalyticKit } from 'analytickit-js'
import { getAnalyticKitContext } from './AnalyticKitContext'

/**
 * An object containing details about AnalyticKit feature flags
 * @property active - List of active feature flags
 * @property enabled - An object containing feature flags with the value of their enabled status
 */
export interface FeatureFlags {
    active?: string[]
    enabled: {
        [flag: string]: boolean | string
    }
}

/**
 * The parameters for the AnalyticKit provider
 * @property client - The initialised AnalyticKit client
 * @property children - React node(s) to be wrapped by the AnalyticKit provider
 */
interface AnalyticKitProviderProps {
    client: AnalyticKit
    children: React.ReactNode | React.ReactNode[] | null
}

/**
 * The AnalyticKit context object value
 * @property client - The initialised AnalyticKit client
 * @property featureFlags - An object containing details about AnalyticKit feature flags
 * @property setFeatureFlags - State dispatcher function for updating the stored featureFlags object
 */
export interface AnalyticKitProviderValue {
    client?: AnalyticKit
    featureFlags: FeatureFlags
    setFeatureFlags: Dispatch<SetStateAction<FeatureFlags>>
}

/**
 * The AnalyticKit provider
 * @property client - The initialised AnalyticKit client
 * @property children - React node(s) to be wrapped by the AnalyticKit provider
 * @returns React Provider node which enables child react node(s) to consume the AnalyticKit context
 */
export const AnalyticKitProvider: React.FC<AnalyticKitProviderProps> = ({ client, children }: AnalyticKitProviderProps) => {
    const AnalyticKitContext = getAnalyticKitContext()
    const [featureFlags, setFeatureFlags] = useState({ enabled: {} })

    return (
        <AnalyticKitContext.Consumer>
            {(context) => {
                if (client && context.client !== client) {
                    context = Object.assign({}, context, { client })
                }

                if (!context.client) {
                    throw new Error(
                        'AnalyticKitProvider was not passed a client instance. ' +
                            'Make sure you pass in your AnalyticKit client via the "client" prop.'
                    )
                }

                const value: AnalyticKitProviderValue = { ...context, featureFlags, setFeatureFlags }
                return <AnalyticKitContext.Provider value={value}>{children}</AnalyticKitContext.Provider>
            }}
        </AnalyticKitContext.Consumer>
    )
}
