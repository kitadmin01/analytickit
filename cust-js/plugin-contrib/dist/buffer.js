"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuffer = void 0;
function createBuffer(opts) {
    console.warn('⚠️⚠️⚠️ This plugin is using the deprecated buffer implementation. If it is an official analytickit plugin, please update it to the latest version. If this is a custom plugin please use exportEvents instead. https://analytickit.com/docs/apps/build/reference#exportevents ⚠️⚠️⚠️');
    const buffer = {
        _buffer: [],
        _timeout: null,
        _points: 0,
        _options: {
            limit: 10,
            timeoutSeconds: 60,
            ...opts,
        },
        add: (object, points = 1) => {
            if (buffer._points && buffer._points + points > buffer._options.limit) {
                void buffer.flush();
            }
            buffer._points += points;
            buffer._buffer.push(object);
            if (buffer._points > buffer._options.limit) {
                void buffer.flush();
            }
            else if (!buffer._timeout) {
                buffer._timeout = setTimeout(() => void buffer.flush(), buffer._options.timeoutSeconds * 1000);
            }
        },
        flush: async () => {
            if (buffer._timeout) {
                clearTimeout(buffer._timeout);
                buffer._timeout = null;
            }
            if (buffer._buffer.length > 0 || buffer._points !== 0) {
                const oldBuffer = buffer._buffer;
                const oldPoints = buffer._points;
                buffer._buffer = [];
                buffer._points = 0;
                await buffer._options.onFlush?.(oldBuffer, oldPoints);
            }
        },
    };
    return buffer;
}
exports.createBuffer = createBuffer;
//# sourceMappingURL=buffer.js.map