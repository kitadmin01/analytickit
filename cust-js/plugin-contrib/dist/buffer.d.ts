/// <reference types="node" />
declare type BufferOptions = {
    limit: number;
    timeoutSeconds: number;
    onFlush: (objects: any[], points: number) => void | Promise<void>;
};
export declare function createBuffer(opts: Partial<BufferOptions>): {
    _buffer: any[];
    _timeout: NodeJS.Timeout | null;
    _points: number;
    _options: BufferOptions;
    add: (object: any, points?: number) => void;
    flush: () => Promise<void>;
};
export {};
