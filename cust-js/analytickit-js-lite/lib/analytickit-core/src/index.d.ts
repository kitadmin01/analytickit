import { AnalyticKitFetchOptions, AnalyticKitFetchResponse, AnalyticKitAutocaptureElement, AnalyticKitDecideResponse, AnalyticKitCoreOptions, AnalyticKitEventProperties, AnalyticKitPersistedProperty } from './types';
import { RetriableOptions } from './utils';
export * as utils from './utils';
import { LZString } from './lz-string';
import { SimpleEventEmitter } from './eventemitter';
export declare abstract class AnalyticKitCore {
    private apiKey;
    private host;
    private flushAt;
    private flushInterval;
    private captureMode;
    private sendFeatureFlagEvent;
    private flagCallReported;
    private removeDebugCallback?;
    protected _events: SimpleEventEmitter;
    protected _flushTimer?: any;
    protected _decideResponsePromise?: Promise<AnalyticKitDecideResponse>;
    protected _decideTimer?: any;
    protected _decidePollInterval: number;
    protected _retryOptions: RetriableOptions;
    protected _sessionExpirationTimeSeconds: number;
    abstract fetch(url: string, options: AnalyticKitFetchOptions): Promise<AnalyticKitFetchResponse>;
    abstract getLibraryId(): string;
    abstract getLibraryVersion(): string;
    abstract getCustomUserAgent(): string | void;
    abstract getPersistedProperty<T>(key: AnalyticKitPersistedProperty): T | undefined;
    abstract setPersistedProperty<T>(key: AnalyticKitPersistedProperty, value: T | null): void;
    private _optoutOverride;
    constructor(apiKey: string, options?: AnalyticKitCoreOptions);
    protected getCommonEventProperties(): any;
    private get props();
    private set props(value);
    private _props;
    get optedOut(): boolean;
    optIn(): void;
    optOut(): void;
    on(event: string, cb: (...args: any[]) => void): () => void;
    reset(): void;
    debug(enabled?: boolean): void;
    private buildPayload;
    getSessionId(): string | undefined;
    resetSessionId(): void;
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
    }): this;
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
     *** FEATURE FLAGS
     ***/
    private decideAsync;
    private _decideAsync;
    getFeatureFlag(key: string, defaultResult?: string | boolean): boolean | string | undefined;
    getFeatureFlags(): AnalyticKitDecideResponse['featureFlags'] | undefined;
    isFeatureEnabled(key: string, defaultResult?: boolean): boolean;
    reloadFeatureFlagsAsync(): Promise<AnalyticKitDecideResponse['featureFlags']>;
    onFeatureFlags(cb: (flags: AnalyticKitDecideResponse['featureFlags']) => void): () => void;
    overrideFeatureFlag(flags: AnalyticKitDecideResponse['featureFlags'] | null): void;
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
