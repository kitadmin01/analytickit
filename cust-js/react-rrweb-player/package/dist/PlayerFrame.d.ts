import { RefObject } from 'react';
import { Replayer } from 'rrweb';
interface Props {
    replayer: Replayer | null;
    frame: RefObject<HTMLDivElement>;
}
export declare function PlayerFrame({ replayer, frame }: Props): JSX.Element;
export {};
