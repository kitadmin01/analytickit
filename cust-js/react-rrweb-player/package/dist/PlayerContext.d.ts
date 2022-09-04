import React, { RefObject } from 'react';
import { Replayer } from 'rrweb';
import { eventWithTime, playerMetaData } from 'rrweb/typings/types';
interface PlayerContextProps {
    replayer: RefObject<Replayer>;
    frame: HTMLDivElement | null;
    setFrameRef: (ref: HTMLDivElement | null) => void;
    wrapper: RefObject<HTMLDivElement> | null;
    timer: RefObject<number>;
    skipping: boolean;
    playing: boolean;
    currentTime: number;
    speed: number;
    meta: playerMetaData;
    isBuffering: boolean;
    setSkipping: (val: boolean) => void;
    setPlaying: (val: boolean) => void;
    setCurrentTime: (val: number) => void;
    onPlayerTimeChange: (val: number) => void;
    setSpeed: (val: number) => void;
    setMeta: (val: playerMetaData) => void;
    handleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    toggleFullScreen: () => void;
    play: () => void;
    pause: () => void;
    togglePlayPause: () => void;
    seek: (time: number, { forcePlay }?: {
        forcePlay?: boolean | undefined;
    }) => void;
    seekBack: () => void;
    stopTimer: () => void;
    updateTime: () => void;
}
export declare const PlayerContext: React.Context<PlayerContextProps | null>;
interface PlayerContextProviderProps {
    children: React.ReactNode;
    events: eventWithTime[];
    onPlayerTimeChange?: (playerTime: number) => void;
    onPrevious?: () => void;
    onNext?: () => void;
    isBuffering?: boolean;
    duration?: number;
}
export interface PlayerRef {
    replayer: RefObject<Replayer | null>;
}
export declare const PlayerContextProvider: React.ForwardRefExoticComponent<PlayerContextProviderProps & React.RefAttributes<PlayerRef>>;
export {};
