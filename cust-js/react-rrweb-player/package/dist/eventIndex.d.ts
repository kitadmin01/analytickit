import { eventWithTime } from 'rrweb/typings/types';
export interface Metadata {
    playerTime: number;
}
export interface PageMetadata extends Metadata {
    href: string;
}
export interface RecordingMetadata extends Metadata {
    resolution: string;
    width: number;
    height: number;
}
export interface LibCustomEvent {
    type: 5;
    data: {
        tag: string;
        payload: any;
    };
}
export declare class EventIndex {
    events: eventWithTime[];
    baseTime: number;
    _filterByCaches: {
        [key: string]: any[];
    };
    constructor(events: eventWithTime[]);
    getDuration: () => number;
    getPageMetadata: (playerTime: number) => [PageMetadata, number] | [null, -1];
    getRecordingMetadata: (playerTime: number) => [RecordingMetadata, number] | [null, -1];
    pageChangeEvents: () => PageMetadata[];
    recordingMetadata: () => RecordingMetadata[];
    _filterBy: <T extends Record<string, V>, V>(dataKey: string, transformer: (e: eventWithTime) => T | null) => T[];
}
export declare const findCurrent: <T extends Metadata>(playerTime: number, events: T[]) => [null, -1] | [T, number];
