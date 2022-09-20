import { AnalyticKitFetchOptions, AnalyticKitFetchResponse, AnalyticKitAutocaptureElement, AnalyticKitDecideResponse, AnalyticKitCoreOptions, AnalyticKitEventProperties, AnalyticKitPersistedProperty } from './types';
import { RetriableOptions } from './utils';
export * as utils from './utils';
import { LZString } from './lz-string';
import { SimpleEventEmitter } from './eventemitter';
export declare abstract class AnalyticKitCore {
    private apiKey;
    host: string;
    private flushAt;
    private flushInterval;
    private captureMode;
    private sendFeatureFlagEvent;
    private flagCallReported;
    private removeDebugCallback?;
    protected _events: SimpleEventEmitter;
    protected _flushTimer?: any;
    protected _decideResponsePromise?: Promise<AnalyticKitDecideResponse>;
    protected _retryOptions: RetriableOptions;
    protected _sessionExpirationTimeSeconds: number;
    abstract fetch(url: string, options: AnalyticKitFetchOptions): Promise<AnalyticKitFetchResponse>;
    abstract getLibraryId(): string;
    abstract getLibraryVersion(): string;
    abstract getCustomUserAgent(): string | void;
    abstract getPersistedProperty<T>(key: AnalyticKitPersistedProperty): T | undefined;
    abstract setPersistedProperty<T>(key: AnalyticKitPersistedProperty, value: T | null): void;
    private _optoutOverride;
    constructor(apiKey: string, options?: AnalytickitCoreOptions);
    protected getCommonEventProperties(): any;
    private get props();
    private set props(value);
    private clearProps;
    private _props;
    get optedOut(): boolean;
    optIn(): void;
    optOut(): void;
    on(event: string, cb: (...args: any[]) => void): () => void;
    reset(propertiesToKeep?: AnalyticKitPersistedProperty[]): void;
    debug(enabled?: boolean): void;
    private buildPayload;
    getSessionId(): string | undefined;
    resetSessionId(): void;
    getAnonymousId(): string;
    getDistinctId(): string;
    register(properties: {
        [key: string]: any;
    }): void;
    unregister(property: string): void;
    /***
     *** TRACKING
     ***/
    identify(distinctId?: string, properties?: AnalyticKitEventProperties): this;
    capture(event: string, properties?: {
        [key: string]: any;
    }, forceSendFeatureFlags?: boolean): this;
    alias(alias: string): this;
    autocapture(eventType: string, elements: AnalyticKitAutocaptureElement[], properties?: AnalyticKitEventProperties): this;
    /***
     *** GROUPS
     ***/
    groups(groups: {
        [type: string]: string | number;
    }): this;
    group(groupType: string, groupKey: string | number, groupProperties?: AnalyticKitEventProperties): this;
    groupIdentify(groupType: string, groupKey: string | number, groupProperties?: AnalyticKitEventProperties): this;
    /***
     * PROPERTIES
     ***/
    personProperties(properties: {
        [type: string]: string;
    }): this;
    groupProperties(properties: {
        [type: string]: Record<string, string>;
    }): this;
    /***
     *** FEATURE FLAGS
     ***/
    private decideAsync;
    private _decideAsync;
    getFeatureFlag(key: string): boolean | string | undefined;
    getFeatureFlags(): AnalyticKitDecideResponse['featureFlags'] | undefined;
    isFeatureEnabled(key: string): boolean | undefined;
    reloadFeatureFlagsAsync(sendAnonDistinctId?: boolean): Promise<AnalyticKitDecideResponse['featureFlags']>;
    onFeatureFlags(cb: (flags: AnalyticKitDecideResponse['featureFlags']) => void): () => void;
    onFeatureFlag(key: string, cb: (value: string | boolean) => void): () => void;
    overrideFeatureFlag(flags: AnalyticKitDecideResponse['featureFlags'] | null): void;
    _sendFeatureFlags(event: string, properties?: {
        [key: string]: any;
    }): void;
    /***
     *** QUEUEING AND FLUSHING
     ***/
    private enqueue;
    flushAsync(): Promise<any>;
    flush(callback?: (err?: any, data?: any) => void): void;
    private fetchWithRetry;
    shutdownAsync(): Promise<void>;
    shutdown(): void;
}
export * from './types';
export { LZString };
