export declare class RetryError extends Error {
    _attempt: number | undefined;
    _maxAttempts: number | undefined;
    constructor(message?: string);
    get nameWithAttempts(): string;
    toString(): string;
}
