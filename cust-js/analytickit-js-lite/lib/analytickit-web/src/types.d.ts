import { AnalyticKitCoreOptions } from '../../analytickit-core/src';
export declare type AnalyticKitOptions = {
    autocapture?: boolean;
    persistence?: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory';
    persistence_name?: string;
} & AnalyticKitCoreOptions;
