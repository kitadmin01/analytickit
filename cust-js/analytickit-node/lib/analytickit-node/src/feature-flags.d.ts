/// <reference types="node" />
import { FeatureFlagCondition, AnalyticKitFeatureFlag } from './types';
import { ResponseData } from 'undici/types/dispatcher';
declare class ClientError extends Error {
    constructor(message: string);
}
declare class InconclusiveMatchError extends Error {
    constructor(message: string);
}
declare type FeatureFlagsPollerOptions = {
    personalApiKey: string;
    projectApiKey: string;
    host: string;
    pollingInterval: number;
    timeout?: number;
};
declare class FeatureFlagsPoller {
    pollingInterval: number;
    personalApiKey: string;
    projectApiKey: string;
    featureFlags: Array<AnalyticKitFeatureFlag>;
    groupTypeMapping: Record<string, string>;
    loadedSuccessfullyOnce: boolean;
    timeout?: number;
    host: FeatureFlagsPollerOptions['host'];
    poller?: NodeJS.Timeout;
    constructor({ pollingInterval, personalApiKey, projectApiKey, timeout, host }: FeatureFlagsPollerOptions);
    getFeatureFlag(key: string, distinctId: string, groups?: Record<string, string>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>): Promise<string | boolean | undefined>;
    getAllFlags(distinctId: string, groups?: Record<string, string>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>): Promise<{
        response: Record<string, string | boolean>;
        fallbackToDecide: boolean;
    }>;
    computeFlagLocally(flag: AnalyticKitFeatureFlag, distinctId: string, groups?: Record<string, string>, personProperties?: Record<string, string>, groupProperties?: Record<string, Record<string, string>>): string | boolean;
    matchFeatureFlagProperties(flag: AnalyticKitFeatureFlag, distinctId: string, properties: Record<string, string>): string | boolean;
    isConditionMatch(flag: AnalyticKitFeatureFlag, distinctId: string, condition: FeatureFlagCondition, properties: Record<string, string>): boolean;
    getMatchingVariant(flag: AnalyticKitFeatureFlag, distinctId: string): string | boolean | undefined;
    variantLookupTable(flag: AnalyticKitFeatureFlag): {
        valueMin: number;
        valueMax: number;
        key: string;
    }[];
    loadFeatureFlags(forceReload?: boolean): Promise<void>;
    _loadFeatureFlags(): Promise<void>;
    _requestFeatureFlagDefinitions(): Promise<ResponseData>;
    stopPoller(): void;
}
declare function matchProperty(property: FeatureFlagCondition['properties'][number], propertyValues: Record<string, any>): boolean;
export { FeatureFlagsPoller, matchProperty, InconclusiveMatchError, ClientError };
