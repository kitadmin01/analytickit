import { AnalyticKitPersistedProperty } from './types';
export declare class AnalyticKitMemoryStorage {
    private _memoryStorage;
    getProperty(key: AnalyticKitPersistedProperty): any | undefined;
    setProperty(key: AnalyticKitPersistedProperty, value: any | null): void;
}
