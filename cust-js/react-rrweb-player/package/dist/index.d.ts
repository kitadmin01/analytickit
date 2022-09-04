import React, { RefObject } from 'react';
import { Replayer } from 'rrweb';
import { eventWithTime } from 'rrweb/typings/types';
import './styles.css';
import 'rc-slider/assets/index.css';
import 'rrweb/dist/rrweb.min.css';
export { EventIndex, findCurrent } from './eventIndex';
export { formatTime } from './time';
interface Props {
    events: eventWithTime[];
    onPlayerTimeChange?: (playerTime: number) => void;
    onPrevious?: () => void;
    onNext?: () => void;
    isBuffering?: boolean;
    duration?: number;
}
export interface PlayerRef {
    replayer: RefObject<Replayer | null>;
    seek: (playerTime: number) => void;
}
export declare const Player: React.ForwardRefExoticComponent<Props & React.RefAttributes<PlayerRef>>;
