import { AnalyticKitCore, AnalyticKitFetchOptions, AnalyticKitFetchResponse, AnalyticKitPersistedProperty } from '../../analytickit-core/src';
import { AnalyticKitOptions } from './types';
export declare class AnalyticKit extends AnalyticKitCore {
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
