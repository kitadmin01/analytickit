import { AnalyticKitOptions } from './types';
export declare type AnalyticKitStorage = {
    getItem: (key: string) => string | null | undefined;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    clear: () => void;
    getAllKeys: () => readonly string[];
};
export declare const cookieStore: AnalyticKitStorage;
export declare const _localStore: AnalyticKitStorage;
export declare const _sessionStore: AnalyticKitStorage;
export declare const localStore: AnalyticKitStorage | undefined;
export declare const sessionStorage: AnalyticKitStorage | undefined;
export declare const getStorage: (type: AnalyticKitOptions['persistence']) => AnalyticKitStorage;
