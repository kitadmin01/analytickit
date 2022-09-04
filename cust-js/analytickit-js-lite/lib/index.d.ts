declare type AnalyticKitCoreOptions = {
    host?: string;
    flushAt?: number;
    flushInterval?: number;
    enable?: boolean;
    sendFeatureFlagEvent?: boolean;
    preloadFeatureFlags?: boolean;
    decidePollInterval?: number;
    fetchRetryCount?: number;
    fetchRetryDelay?: number;
    sessionExpirationTimeSeconds?: number;
    captureMode?: 'json' | 'form';
};
declare enum AnalyticKitPersistedProperty {
    DistinctId = "distinct_id",
    Props = "props",
    FeatureFlags = "feature_flags",
    OverrideFeatureFlags = "override_feature_flags",
    Queue = "queue",
    OptedOut = "opted_out",
    SessionId = "session_id",
    SessionLastTimestamp = "session_timestamp"
}
declare type AnalyticKitFetchOptions = {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH';
    mode?: 'no-cors';
    credentials?: 'omit';
    headers: {
        [key: string]: string;
    };
    body: string;
};
declare type AnalyticKitFetchResponse = {
    status: number;
    text: () => Promise<string>;
};
declare type AnalyticKitEventProperties = {
    [key: string]: any;
};
declare type AnalyticKitAutocaptureElement = {
    $el_text?: string;
    tag_name: string;
    href?: string;
    nth_child?: number;
    nth_of_type?: number;
    order?: number;
} & {
    [key: string]: any;
};
declare type AnalyticKitDecideResponse = {
    config: {
        enable_collect_everything: boolean;
    };
    editorParams: {
        toolbarVersion: string;
        jsURL: string;
    };
    isAuthenticated: true;
    supportedCompression: string[];
    featureFlags: {
        [key: string]: string | boolean;
    };
    sessionRecording: boolean;
};

interface RetriableOptions {
    retryCount?: number;
    retryDelay?: number;
    retryCheck?: (err: any) => true;
}

declare class SimpleEventEmitter {
    events: {
        [key: string]: ((...args: any[]) => void)[];
    };
    constructor();
    on(event: string, listener: (...args: any[]) => void): () => void;
    emit(event: string, payload: any): void;
}

declare abstract class AnalyticKitCore {
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

declare type AnalyticKitOptions = {
    autocapture?: boolean;
    persistence?: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory';
    persistence_name?: string;
} & AnalyticKitCoreOptions;

declare class AnalyticKit extends AnalyticKitCore {
    private _storage;
    private _storageCache;
    private _storageKey;
    constructor(apiKey: string, options?: AnalyticKitOptions);
    getPersistedProperty<T>(key: AnalyticKitPersistedProperty): T | undefined;
    setPersistedProperty<T>(key: AnalyticKitPersistedProperty, value: T | null): void;
    fetch(url: string, options: AnalyticKitFetchOptions): Promise<AnalyticKitFetchResponse>;
    getLibraryId(): string;
    getLibraryVersion(): string;
    getCustomUserAgent(): void;
    getCommonEventProperties(): any;
}

export { AnalyticKit, AnalyticKit as default };
