declare type AnalytickitCoreOptions = {
    host?: string;
    flushAt?: number;
    flushInterval?: number;
    enable?: boolean;
    sendFeatureFlagEvent?: boolean;
    preloadFeatureFlags?: boolean;
    fetchRetryCount?: number;
    fetchRetryDelay?: number;
    sessionExpirationTimeSeconds?: number;
    captureMode?: 'json' | 'form';
};

interface IdentifyMessageV1 {
    distinctId: string;
    properties?: Record<string | number, any>;
}
interface EventMessageV1 extends IdentifyMessageV1 {
    event: string;
    groups?: Record<string, string | number>;
    sendFeatureFlags?: boolean;
}
interface GroupIdentifyMessage {
    groupType: string;
    groupKey: string;
    properties?: Record<string | number, any>;
}
declare type AnalyticKitNodeV1 = {
    /**
     * @description Capture allows you to capture anything a user does within your system,
     * which you can later use in AnalyticKit to find patterns in usage,
     * work out which features to improve or where people are giving up.
     * A capture call requires:
     * @param distinctId which uniquely identifies your user
     * @param event We recommend using [verb] [noun], like movie played or movie updated to easily identify what your events mean later on.
     * @param properties OPTIONAL | which can be a object with any information you'd like to add
     * @param groups OPTIONAL | object of what groups are related to this event, example: { company: 'id:5' }. Can be used to analyze companies instead of users.
     * @param sendFeatureFlags OPTIONAL | Used with experiments. Determines whether to send feature flag values with the event.
     */
    capture({ distinctId, event, properties, groups, sendFeatureFlags }: EventMessageV1): void;
    /**
     * @description Identify lets you add metadata on your users so you can more easily identify who they are in AnalyticKit,
     * and even do things like segment users by these properties.
     * An identify call requires:
     * @param distinctId which uniquely identifies your user
     * @param properties with a dict with any key: value pairs
     */
    identify({ distinctId, properties }: IdentifyMessageV1): void;
    /**
     * @description To marry up whatever a user does before they sign up or log in with what they do after you need to make an alias call.
     * This will allow you to answer questions like "Which marketing channels leads to users churning after a month?"
     * or "What do users do on our website before signing up?"
     * In a purely back-end implementation, this means whenever an anonymous user does something, you'll want to send a session ID with the capture call.
     * Then, when that users signs up, you want to do an alias call with the session ID and the newly created user ID.
     * The same concept applies for when a user logs in. If you're using AnalyticKit in the front-end and back-end,
     *  doing the identify call in the frontend will be enough.:
     * @param distinctId the current unique id
     * @param alias the unique ID of the user before
     */
    alias(data: {
        distinctId: string;
        alias: string;
    }): void;
    /**
     * @description AnalyticKit feature flags (https://analytickit.com/docs/features/feature-flags)
     * allow you to safely deploy and roll back new features. Once you've created a feature flag in AnalyticKit,
     * you can use this method to check if the flag is on for a given user, allowing you to create logic to turn
     * features on and off for different user groups or individual users.
     * @param key the unique key of your feature flag
     * @param distinctId the current unique id
     * @param options: dict with optional parameters below
     * @param groups optional - what groups are currently active (group analytics). Required if the flag depends on groups.
     * @param personProperties optional - what person properties are known. Used to compute flags locally, if personalApiKey is present.
     * @param groupProperties optional - what group properties are known. Used to compute flags locally, if personalApiKey is present.
     * @param onlyEvaluateLocally optional - whether to only evaluate the flag locally. Defaults to false.
     * @param sendFeatureFlagEvents optional - whether to send feature flag events. Used for Experiments. Defaults to true.
     *
     * @returns true if the flag is on, false if the flag is off, undefined if there was an error.
     */
    isFeatureEnabled(key: string, distinctId: string, options?: {
        groups?: Record<string, string>;
        personProperties?: Record<string, string>;
        groupProperties?: Record<string, Record<string, string>>;
        onlyEvaluateLocally?: boolean;
        sendFeatureFlagEvents?: boolean;
    }): Promise<boolean | undefined>;
    /**
     * @description AnalyticKit feature flags (https://analytickit.com/docs/features/feature-flags)
     * allow you to safely deploy and roll back new features. Once you've created a feature flag in AnalyticKit,
     * you can use this method to check if the flag is on for a given user, allowing you to create logic to turn
     * features on and off for different user groups or individual users.
     * @param key the unique key of your feature flag
     * @param distinctId the current unique id
     * @param options: dict with optional parameters below
     * @param groups optional - what groups are currently active (group analytics). Required if the flag depends on groups.
     * @param personProperties optional - what person properties are known. Used to compute flags locally, if personalApiKey is present.
     * @param groupProperties optional - what group properties are known. Used to compute flags locally, if personalApiKey is present.
     * @param onlyEvaluateLocally optional - whether to only evaluate the flag locally. Defaults to false.
     * @param sendFeatureFlagEvents optional - whether to send feature flag events. Used for Experiments. Defaults to true.
     *
     * @returns true or string(for multivariates) if the flag is on, false if the flag is off, undefined if there was an error.
     */
    getFeatureFlag(key: string, distinctId: string, options?: {
        groups?: Record<string, string>;
        personProperties?: Record<string, string>;
        groupProperties?: Record<string, Record<string, string>>;
        onlyEvaluateLocally?: boolean;
        sendFeatureFlagEvents?: boolean;
    }): Promise<string | boolean | undefined>;
    /**
     * @description Sets a groups properties, which allows asking questions like "Who are the most active companies"
     * using my product in AnalyticKit.
     *
     * @param groupType Type of group (ex: 'company'). Limited to 5 per project
     * @param groupKey Unique identifier for that type of group (ex: 'id:5')
     * @param properties OPTIONAL | which can be a object with any information you'd like to add
     */
    groupIdentify({ groupType, groupKey, properties }: GroupIdentifyMessage): void;
    /**
     * @description Force an immediate reload of the polled feature flags. Please note that they are
     * already polled automatically at a regular interval.
     */
    reloadFeatureFlags(): Promise<void>;
    /**
     * @description Flushes the events still in the queue and clears the feature flags poller to allow for
     * a clean shutdown.
     */
    shutdown(): void;
};

declare type AnalyticKitOptions = AnalytickitCoreOptions & {
    persistence?: 'memory';
    personalApiKey?: string;
    featureFlagsPollingInterval?: number;
    requestTimeout?: number;
    maxCacheSize?: number;
};
declare class AnalyticKitGlobal implements AnalyticKitNodeV1 {
    private _sharedClient;
    private featureFlagsPoller?;
    private maxCacheSize;
    distinctIdHasSentFlagCalls: Record<string, string[]>;
    constructor(apiKey: string, options?: AnalyticKitOptions);
    private reInit;
    enable(): void;
    disable(): void;
    capture({ distinctId, event, properties, groups, sendFeatureFlags }: EventMessageV1): void;
    identify({ distinctId, properties }: IdentifyMessageV1): void;
    alias(data: {
        distinctId: string;
        alias: string;
    }): void;
    getFeatureFlag(key: string, distinctId: string, options?: {
        groups?: Record<string, string>;
        personProperties?: Record<string, string>;
        groupProperties?: Record<string, Record<string, string>>;
        onlyEvaluateLocally?: boolean;
        sendFeatureFlagEvents?: boolean;
    }): Promise<string | boolean | undefined>;
    isFeatureEnabled(key: string, distinctId: string, options?: {
        groups?: Record<string, string>;
        personProperties?: Record<string, string>;
        groupProperties?: Record<string, Record<string, string>>;
        onlyEvaluateLocally?: boolean;
        sendFeatureFlagEvents?: boolean;
    }): Promise<boolean | undefined>;
    getAllFlags(distinctId: string, options?: {
        groups?: Record<string, string>;
        personProperties?: Record<string, string>;
        groupProperties?: Record<string, Record<string, string>>;
        onlyEvaluateLocally?: boolean;
    }): Promise<Record<string, string | boolean>>;
    groupIdentify({ groupType, groupKey, properties }: GroupIdentifyMessage): void;
    reloadFeatureFlags(): Promise<void>;
    flush(): void;
    shutdown(): void;
    shutdownAsync(): Promise<void>;
    debug(enabled?: boolean): void;
}

export { AnalyticKitGlobal, AnalyticKitOptions, AnalyticKitGlobal as default };