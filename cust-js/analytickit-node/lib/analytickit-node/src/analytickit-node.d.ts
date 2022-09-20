import { AnalytickitCoreOptions } from '../../analytickit-core/src';
import { EventMessageV1, GroupIdentifyMessage, IdentifyMessageV1, AnalyticKitNodeV1 } from 'analytickit-node/lib/analytickit-node/src/types';
export declare type AnalyticKitOptions = AnalytickitCoreOptions & {
    persistence?: 'memory';
    personalApiKey?: string;
    featureFlagsPollingInterval?: number;
    requestTimeout?: number;
    maxCacheSize?: number;
};
export declare class AnalyticKitGlobal implements AnalyticKitNodeV1 {
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
