import { City } from '@maxmind/geoip2-node';
import { Response } from 'node-fetch';
export declare type PluginInput = {
    config?: Record<string, any>;
    attachments?: Record<string, PluginAttachment | undefined>;
    global?: Record<string, any>;
    jobs?: Record<string, JobOptions>;
    metrics?: Record<string, AllowedMetricsOperations>;
};
export interface Plugin<Input extends PluginInput = {}> {
    setupPlugin?: (meta: Meta<Input>) => void;
    teardownPlugin?: (meta: Meta<Input>) => void;
    processEvent?: (event: PluginEvent, meta: Meta<Input>) => PluginEvent | null | Promise<PluginEvent | null>;
    processEventBatch?: (eventBatch: PluginEvent[], meta: Meta<Input>) => PluginEvent[] | Promise<PluginEvent[]>;
    exportEvents?: (events: ProcessedPluginEvent[], meta: Meta<Input>) => void | Promise<void>;
    onEvent?: (event: ProcessedPluginEvent, meta: Meta<Input>) => void | Promise<void>;
    onSnapshot?: (event: ProcessedPluginEvent, meta: Meta<Input>) => void | Promise<void>;
    runEveryMinute?: (meta: Meta<Input>) => void;
    runEveryHour?: (meta: Meta<Input>) => void;
    runEveryDay?: (meta: Meta<Input>) => void;
    jobs?: {
        [K in keyof Meta<Input>['jobs']]: (opts: Parameters<Meta<Input>['jobs'][K]>[0], meta: Meta<Input>) => void | Promise<void>;
    };
    metrics?: {
        [K in keyof Meta<Input>['metrics']]: AllowedMetricsOperations;
    };
    __internalMeta?: Meta<Input>;
}
export declare enum MetricsOperation {
    Sum = "sum",
    Min = "min",
    Max = "max"
}
export declare type AllowedMetricsOperations = MetricsOperation.Sum | MetricsOperation.Max | MetricsOperation.Min;
export declare type PluginMeta<T> = T extends {
    __internalMeta?: infer M;
} ? M : never;
export declare type Properties = Record<string, any>;
export interface Element {
    text?: string;
    tag_name?: string;
    href?: string;
    attr_id?: string;
    attr_class?: string[];
    nth_child?: number;
    nth_of_type?: number;
    attributes?: Record<string, any>;
    event_id?: number;
    order?: number;
    group_id?: number;
}
export interface PluginEvent {
    distinct_id: string;
    ip: string | null;
    site_url: string;
    team_id: number;
    now: string;
    event: string;
    sent_at?: string;
    properties?: Properties;
    timestamp?: string;
    offset?: number;
    $set?: Properties;
    $set_once?: Properties;
    uuid: string;
    person?: PluginPerson;
}
export interface ProcessedPluginEvent {
    distinct_id: string;
    ip: string | null;
    team_id: number;
    event: string;
    properties: Properties;
    timestamp: string;
    $set?: Properties;
    $set_once?: Properties;
    uuid: string;
    person?: PluginPerson;
    elements?: Element[];
}
export interface PluginPerson {
    uuid: string;
    team_id: number;
    properties: Properties;
    created_at: string;
}
export interface PluginAttachment {
    content_type: string;
    file_name: string;
    contents: any;
}
interface BasePluginMeta {
    cache: CacheExtension;
    storage: StorageExtension;
    geoip: GeoIPExtension;
    config: Record<string, any>;
    global: Record<string, any>;
    attachments: Record<string, PluginAttachment | undefined>;
    jobs: Record<string, (opts: any) => JobControls>;
    metrics: Record<string, Partial<FullMetricsControls>>;
    utils: UtilsExtension;
}
declare type JobOptions = Record<string, any> | undefined;
declare type JobControls = {
    runNow: () => Promise<void>;
    runIn: (duration: number, unit: string) => Promise<void>;
    runAt: (date: Date) => Promise<void>;
};
interface MetricsControlsIncrement {
    increment: (value: number) => Promise<void>;
}
interface MetricsControlsMax {
    max: (value: number) => Promise<void>;
}
interface MetricsControlsMin {
    min: (value: number) => Promise<void>;
}
declare type FullMetricsControls = MetricsControlsIncrement & MetricsControlsMax & MetricsControlsMin;
declare type MetricsControls<V> = V extends MetricsOperation.Sum ? MetricsControlsIncrement : V extends MetricsOperation.Max ? MetricsControlsMax : MetricsControlsMin;
declare type MetaMetricsFromMetricsOptions<J extends Record<string, string>> = {
    [K in keyof J]: MetricsControls<J[K]>;
};
declare type MetaJobsFromJobOptions<J extends Record<string, JobOptions>> = {
    [K in keyof J]: (opts: J[K]) => JobControls;
};
export interface Meta<Input extends PluginInput = {}> extends BasePluginMeta {
    attachments: Input['attachments'] extends Record<string, PluginAttachment | undefined> ? Input['attachments'] : Record<string, PluginAttachment | undefined>;
    config: Input['config'] extends Record<string, any> ? Input['config'] : Record<string, any>;
    global: Input['global'] extends Record<string, any> ? Input['global'] : Record<string, any>;
    jobs: Input['jobs'] extends Record<string, JobOptions> ? MetaJobsFromJobOptions<Input['jobs']> : Record<string, (opts: any) => JobControls>;
    metrics: Input['metrics'] extends Record<string, AllowedMetricsOperations> ? MetaMetricsFromMetricsOptions<Input['metrics']> : Record<string, FullMetricsControls>;
}
declare type ConfigDependencyArrayValue = string | undefined;
declare type ConfigDependencySubArray = ConfigDependencyArrayValue[];
declare type ConfigDependencyArray = ConfigDependencySubArray[];
export interface PluginConfigStructure {
    key?: string;
    name?: string;
    default?: string;
    hint?: string;
    markdown?: string;
    order?: number;
    required?: boolean;
    secret?: boolean;
    required_if?: ConfigDependencyArray;
    visible_if?: ConfigDependencyArray;
}
export interface PluginConfigDefault extends PluginConfigStructure {
    type?: 'string' | 'json' | 'attachment';
}
export interface PluginConfigChoice extends PluginConfigStructure {
    type: 'choice';
    choices: string[];
}
export declare type PluginConfigSchema = PluginConfigDefault | PluginConfigChoice;
export interface CacheOptions {
    jsonSerialize?: boolean;
}
export interface CacheExtension {
    set: (key: string, value: unknown, ttlSeconds?: number, options?: CacheOptions) => Promise<void>;
    get: (key: string, defaultValue: unknown, options?: CacheOptions) => Promise<unknown>;
    incr: (key: string) => Promise<number>;
    expire: (key: string, ttlSeconds: number) => Promise<boolean>;
    lpush: (key: string, elementOrArray: unknown[]) => Promise<number>;
    lrange: (key: string, startIndex: number, endIndex: number) => Promise<string[]>;
    llen: (key: string) => Promise<number>;
    lpop: (key: string, count: number) => Promise<string[]>;
    lrem: (key: string, count: number, elementKey: string) => Promise<number>;
}
export interface StorageExtension {
    set: (key: string, value: unknown) => Promise<void>;
    get: (key: string, defaultValue: unknown) => Promise<unknown>;
    del: (key: string) => Promise<void>;
}
export interface ConsoleExtension {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
}
export interface GeoIPExtension {
    locate: (ip: string) => Promise<City | null>;
}
export interface UtilsExtension {
    cursor: CursorUtils;
}
export interface CursorUtils {
    init: (key: string, initialValue?: number) => Promise<void>;
    increment: (key: string, incrementBy?: number) => Promise<number>;
}
interface ApiMethodOptions {
    headers?: Headers;
    data?: Record<string, any>;
    host?: string;
    projectApiKey?: string;
    personalApiKey?: string;
}
export interface ApiExtension {
    get(path: string, options?: ApiMethodOptions): Promise<Response>;
    post(path: string, options?: ApiMethodOptions): Promise<Response>;
    put(path: string, options?: ApiMethodOptions): Promise<Response>;
    delete(path: string, options?: ApiMethodOptions): Promise<Response>;
}
export interface AnalyticKitExtension {
    capture(event: string, properties?: Record<string, any>): Promise<void>;
    api: ApiExtension;
}
export {};
