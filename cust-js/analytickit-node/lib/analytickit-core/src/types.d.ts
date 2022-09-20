export declare type AnalytickitCoreOptions = {
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
export declare enum AnalyticKitPersistedProperty {
    AnonymousId = "anonymous_id",
    DistinctId = "distinct_id",
    Props = "props",
    FeatureFlags = "feature_flags",
    OverrideFeatureFlags = "override_feature_flags",
    Queue = "queue",
    OptedOut = "opted_out",
    SessionId = "session_id",
    SessionLastTimestamp = "session_timestamp",
    PersonProperties = "person_properties",
    GroupProperties = "group_properties"
}
export declare type AnalyticKitFetchOptions = {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH';
    mode?: 'no-cors';
    credentials?: 'omit';
    headers: {
        [key: string]: string;
    };
    body: string;
};
export declare type AnalyticKitFetchResponse = {
    status: number;
    text: () => Promise<string>;
    json: () => Promise<any>;
};
export declare type AnalyticKitQueueItem = {
    message: any;
    callback?: (err: any) => void;
};
export declare type AnalyticKitEventProperties = {
    [key: string]: any;
};
export declare type AnalyticKitAutocaptureElement = {
    $el_text?: string;
    tag_name: string;
    href?: string;
    nth_child?: number;
    nth_of_type?: number;
    order?: number;
} & {
    [key: string]: any;
};
export declare type AnalyticKitDecideResponse = {
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
