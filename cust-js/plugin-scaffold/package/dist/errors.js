"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryError = void 0;
class RetryError extends Error {
    constructor(message) {
        super(message);
        this.name = "RetryError";
    }
    get nameWithAttempts() {
        return this._attempt && this._maxAttempts ? `${this.name} (attempt ${this._attempt}/${this._maxAttempts})` : this.name;
    }
    toString() {
        return this.message ? `${this.nameWithAttempts}: ${this.message}` : this.nameWithAttempts;
    }
}
exports.RetryError = RetryError;
//# sourceMappingURL=errors.js.map