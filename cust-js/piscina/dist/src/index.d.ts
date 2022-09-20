/// <reference types="node" />
import { Worker, MessagePort } from 'worker_threads';
import EventEmitterAsyncResource from 'eventemitter-asyncresource';
import { AsyncResource } from 'async_hooks';
import { ResponseMessage, Transferable, Task, TaskQueue, kQueueOptions } from './common';
interface AbortSignalEventTargetAddOptions {
    once: boolean;
}
interface AbortSignalEventTarget {
    addEventListener: (name: 'abort', listener: () => void, options?: AbortSignalEventTargetAddOptions) => void;
    removeEventListener: (name: 'abort', listener: () => void) => void;
    aborted?: boolean;
}
interface AbortSignalEventEmitter {
    off: (name: 'abort', listener: () => void) => void;
    once: (name: 'abort', listener: () => void) => void;
}
declare type AbortSignalAny = AbortSignalEventTarget | AbortSignalEventEmitter;
declare type ResourceLimits = Worker extends {
    resourceLimits?: infer T;
} ? T : {};
declare type EnvSpecifier = typeof Worker extends {
    new (filename: never, options?: {
        env: infer T;
    }): Worker;
} ? T : never;
interface Options {
    filename?: string | null;
    name?: string;
    minThreads?: number;
    maxThreads?: number;
    idleTimeout?: number;
    maxQueue?: number | 'auto';
    concurrentTasksPerWorker?: number;
    useAtomics?: boolean;
    resourceLimits?: ResourceLimits;
    argv?: string[];
    execArgv?: string[];
    env?: EnvSpecifier;
    workerData?: any;
    taskQueue?: TaskQueue;
    niceIncrement?: number;
    trackUnmanagedFds?: boolean;
    atomicsTimeout?: number;
}
interface FilledOptions extends Options {
    filename: string | null;
    name: string;
    minThreads: number;
    maxThreads: number;
    idleTimeout: number;
    maxQueue: number;
    concurrentTasksPerWorker: number;
    useAtomics: boolean;
    taskQueue: TaskQueue;
    niceIncrement: number;
    atomicsTimeout: number;
}
interface RunOptions {
    transferList?: TransferList;
    filename?: string | null;
    signal?: AbortSignalAny | null;
    name?: string | null;
    workerInfo?: WorkerInfo | null;
}
declare type TaskCallback = (err: Error, result: any) => void;
declare type TransferList = MessagePort extends {
    postMessage(value: any, transferList: infer T): any;
} ? T : never;
declare type TransferListItem = TransferList extends (infer T)[] ? T : never;
declare class TaskInfo extends AsyncResource implements Task {
    callback: TaskCallback;
    task: any;
    transferList: TransferList;
    filename: string;
    name: string;
    taskId: number;
    abortSignal: AbortSignalAny | null;
    abortListener: (() => void) | null;
    workerInfo: WorkerInfo | null;
    created: number;
    started: number;
    constructor(task: any, transferList: TransferList, filename: string, name: string, callback: TaskCallback, abortSignal: AbortSignalAny | null, triggerAsyncId: number);
    releaseTask(): any;
    done(err: Error | null, result?: any): void;
    get [kQueueOptions](): object | null;
}
declare abstract class AsynchronouslyCreatedResource {
    onreadyListeners: (() => void)[] | null;
    markAsReady(): void;
    isReady(): boolean;
    onReady(fn: () => void): void;
    abstract currentUsage(): number;
}
declare type ResponseCallback = (response: ResponseMessage) => void;
declare class WorkerInfo extends AsynchronouslyCreatedResource {
    worker: Worker;
    taskInfos: Map<number, TaskInfo>;
    idleTimeout: NodeJS.Timeout | null;
    port: MessagePort;
    sharedBuffer: Int32Array;
    lastSeenResponseCount: number;
    onMessage: ResponseCallback;
    constructor(worker: Worker, port: MessagePort, onMessage: ResponseCallback);
    destroy(): void;
    clearIdleTimeout(): void;
    ref(): WorkerInfo;
    unref(): WorkerInfo;
    _handleResponse(message: ResponseMessage): void;
    postTask(taskInfo: TaskInfo): void;
    processPendingMessages(): void;
    isRunningAbortableTask(): boolean;
    currentUsage(): number;
}
declare class Piscina extends EventEmitterAsyncResource {
    #private;
    constructor(options?: Options);
    /** @deprecated Use run(task, options) instead **/
    runTask(task: any, transferList?: TransferList, filename?: string, abortSignal?: AbortSignalAny): Promise<any>;
    /** @deprecated Use run(task, options) instead **/
    runTask(task: any, transferList?: TransferList, filename?: AbortSignalAny, abortSignal?: undefined): Promise<any>;
    /** @deprecated Use run(task, options) instead **/
    runTask(task: any, transferList?: string, filename?: AbortSignalAny, abortSignal?: undefined): Promise<any>;
    /** @deprecated Use run(task, options) instead **/
    runTask(task: any, transferList?: AbortSignalAny, filename?: undefined, abortSignal?: undefined): Promise<any>;
    run(task: any, options?: RunOptions): Promise<any>;
    broadcastTask(task: any, transferList?: TransferList, filename?: string, signal?: AbortSignalAny): Promise<any[]>;
    broadcastTask(task: any, transferList?: TransferList, filename?: AbortSignalAny, signal?: undefined): Promise<any[]>;
    broadcastTask(task: any, transferList?: string, filename?: AbortSignalAny, signal?: undefined): Promise<any[]>;
    broadcastTask(task: any, transferList?: AbortSignalAny, filename?: undefined, signal?: undefined): Promise<any[]>;
    destroy(): Promise<void>;
    get options(): FilledOptions;
    get threads(): Worker[];
    get queueSize(): number;
    get completed(): number;
    get waitTime(): any;
    get runTime(): any;
    get utilization(): number;
    get duration(): number;
    static get isWorkerThread(): boolean;
    static get workerData(): any;
    static get version(): string;
    static get Piscina(): typeof Piscina;
    static move(val: Transferable | TransferListItem | ArrayBufferView | ArrayBuffer | MessagePort): ArrayBuffer | ArrayBufferView | MessagePort | Transferable;
    static get transferableSymbol(): symbol;
    static get valueSymbol(): symbol;
    static get queueOptionsSymbol(): symbol;
}
export = Piscina;
