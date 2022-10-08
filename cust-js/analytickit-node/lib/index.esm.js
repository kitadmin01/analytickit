import undici, { request } from 'undici';
import { createHash } from 'crypto';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */
var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p))
                d[p] = b[p]; };
    return extendStatics(d, b);
};
function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function () {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (_)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
}
function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar)
                    ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var version = "2.0.1";

var AnalyticKitPersistedProperty;
(function (AnalyticKitPersistedProperty) {
    AnalyticKitPersistedProperty["AnonymousId"] = "anonymous_id";
    AnalyticKitPersistedProperty["DistinctId"] = "distinct_id";
    AnalyticKitPersistedProperty["Props"] = "props";
    AnalyticKitPersistedProperty["FeatureFlags"] = "feature_flags";
    AnalyticKitPersistedProperty["OverrideFeatureFlags"] = "override_feature_flags";
    AnalyticKitPersistedProperty["Queue"] = "queue";
    AnalyticKitPersistedProperty["OptedOut"] = "opted_out";
    AnalyticKitPersistedProperty["SessionId"] = "session_id";
    AnalyticKitPersistedProperty["SessionLastTimestamp"] = "session_timestamp";
    AnalyticKitPersistedProperty["PersonProperties"] = "person_properties";
    AnalyticKitPersistedProperty["GroupProperties"] = "group_properties";
})(AnalyticKitPersistedProperty || (AnalyticKitPersistedProperty = {}));

function assert(truthyValue, message) {
    if (!truthyValue) {
        throw new Error(message);
    }
}
function removeTrailingSlash(url) {
    return url === null || url === void 0 ? void 0 : url.replace(/\/+$/, '');
}
function retriable(fn, props) {
    if (props === void 0) { props = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, retryCount, _b, retryDelay, _c, retryCheck, lastError, i, res, e_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = props.retryCount, retryCount = _a === void 0 ? 3 : _a, _b = props.retryDelay, retryDelay = _b === void 0 ? 5000 : _b, _c = props.retryCheck, retryCheck = _c === void 0 ? function () { return true; } : _c;
                    lastError = null;
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < retryCount + 1)) return [3 /*break*/, 8];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fn()];
                case 3:
                    res = _d.sent();
                    return [2 /*return*/, res];
                case 4:
                    e_1 = _d.sent();
                    lastError = e_1;
                    if (!retryCheck(e_1)) {
                        throw e_1;
                    }
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, retryDelay); })];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8: throw lastError;
            }
        });
    });
}
// https://stackoverflow.com/a/8809472
function generateUUID(globalThis) {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 = (globalThis && globalThis.performance && globalThis.performance.now && globalThis.performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
            //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        }
        else {
            //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}
function currentTimestamp() {
    return new Date().getTime();
}
function currentISOTime() {
    return new Date().toISOString();
}
function safeSetTimeout(fn, timeout) {
    // NOTE: we use this so rarely that it is totally fine to do `safeSetTimeout(fn, 0)``
    // rather than setImmediate.
    var t = setTimeout(fn, timeout);
    // We unref if available to prevent Node.js hanging on exit
    (t === null || t === void 0 ? void 0 : t.unref) && (t === null || t === void 0 ? void 0 : t.unref());
    return t;
}

// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
// private property
var f = String.fromCharCode;
var keyStrBase64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var baseReverseDic = {};
function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
        baseReverseDic[alphabet] = {};
        for (var i = 0; i < alphabet.length; i++) {
            baseReverseDic[alphabet][alphabet.charAt(i)] = i;
        }
    }
    return baseReverseDic[alphabet][character];
}
var LZString = {
    compressToBase64: function (input) {
        if (input == null) {
            return '';
        }
        var res = LZString._compress(input, 6, function (a) {
            return keyStrBase64.charAt(a);
        });
        switch (res.length % 4 // To produce valid Base64
        ) {
            default: // When could this happen ?
            case 0:
                return res;
            case 1:
                return res + '===';
            case 2:
                return res + '==';
            case 3:
                return res + '=';
        }
    },
    decompressFromBase64: function (input) {
        if (input == null) {
            return '';
        }
        if (input == '') {
            return null;
        }
        return LZString._decompress(input.length, 32, function (index) {
            return getBaseValue(keyStrBase64, input.charAt(index));
        });
    },
    compress: function (uncompressed) {
        return LZString._compress(uncompressed, 16, function (a) {
            return f(a);
        });
    },
    _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
        if (uncompressed == null) {
            return '';
        }
        var context_dictionary = {}, context_dictionaryToCreate = {}, context_data = [];
        var i, value, context_c = '', context_wc = '', context_w = '', context_enlargeIn = 2, // Compensate for the first entry which should not count
        context_dictSize = 3, context_numBits = 2, context_data_val = 0, context_data_position = 0, ii;
        for (ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = true;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                context_w = context_wc;
            }
            else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = context_data_val << 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                }
                else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                // Add wc to the dictionary.
                context_dictionary[context_wc] = context_dictSize++;
                context_w = String(context_c);
            }
        }
        // Output the code for w.
        if (context_w !== '') {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | value;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = 0;
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            }
            else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    }
                    else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
        }
        // Mark the end of the stream
        value = 2;
        for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
            }
            else {
                context_data_position++;
            }
            value = value >> 1;
        }
        // Flush the last char
        while (true) {
            context_data_val = context_data_val << 1;
            if (context_data_position == bitsPerChar - 1) {
                context_data.push(getCharFromInt(context_data_val));
                break;
            }
            else {
                context_data_position++;
            }
        }
        return context_data.join('');
    },
    decompress: function (compressed) {
        if (compressed == null) {
            return '';
        }
        if (compressed == '') {
            return null;
        }
        return LZString._decompress(compressed.length, 32768, function (index) {
            return compressed.charCodeAt(index);
        });
    },
    _decompress: function (length, resetValue, getNextValue) {
        var dictionary = [], result = [], data = { val: getNextValue(0), position: resetValue, index: 1 };
        var enlargeIn = 4, dictSize = 4, numBits = 3, entry = '', i, w, bits, resb, maxpower, power, c;
        for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
        }
        bits = 0;
        maxpower = Math.pow(2, 2);
        power = 1;
        while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        switch ((bits)) {
            case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = f(bits);
                break;
            case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = f(bits);
                break;
            case 2:
                return '';
        }
        dictionary[3] = c;
        w = c;
        result.push(c);
        while (true) {
            if (data.index > length) {
                return '';
            }
            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            switch ((c = bits)) {
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize++] = f(bits);
                    c = dictSize - 1;
                    enlargeIn--;
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize++] = f(bits);
                    c = dictSize - 1;
                    enlargeIn--;
                    break;
                case 2:
                    return result.join('');
            }
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
            if (dictionary[c]) {
                entry = dictionary[c];
            }
            else {
                if (c === dictSize) {
                    entry = w + w.charAt(0);
                }
                else {
                    return null;
                }
            }
            result.push(entry);
            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;
            w = entry;
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
        }
    },
};

var SimpleEventEmitter = /** @class */ (function () {
    function SimpleEventEmitter() {
        this.events = {};
        this.events = {};
    }
    SimpleEventEmitter.prototype.on = function (event, listener) {
        var _this = this;
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return function () {
            _this.events[event] = _this.events[event].filter(function (x) { return x !== listener; });
        };
    };
    SimpleEventEmitter.prototype.emit = function (event, payload) {
        for (var _i = 0, _a = this.events[event] || []; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener(payload);
        }
        for (var _b = 0, _c = this.events['*'] || []; _b < _c.length; _b++) {
            var listener = _c[_b];
            listener(event, payload);
        }
    };
    return SimpleEventEmitter;
}());

var AnalyticKitCore = /** @class */ (function () {
    function AnalyticKitCore(apiKey, options) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this.flagCallReported = {};
        // internal
        this._events = new SimpleEventEmitter();
        assert(apiKey, "You must pass your AnalyticKit project's api key.");
        this.apiKey = apiKey;
        this.host = removeTrailingSlash((options === null || options === void 0 ? void 0 : options.host) || 'https://app.analytickit.com');
        this.flushAt = (options === null || options === void 0 ? void 0 : options.flushAt) ? Math.max(options === null || options === void 0 ? void 0 : options.flushAt, 1) : 20;
        this.flushInterval = (_a = options === null || options === void 0 ? void 0 : options.flushInterval) !== null && _a !== void 0 ? _a : 10000;
        this.captureMode = (options === null || options === void 0 ? void 0 : options.captureMode) || 'form';
        this.sendFeatureFlagEvent = (_b = options === null || options === void 0 ? void 0 : options.sendFeatureFlagEvent) !== null && _b !== void 0 ? _b : true;
        // If enable is explicitly set to false we override the optout
        this._optoutOverride = (options === null || options === void 0 ? void 0 : options.enable) === false;
        this._retryOptions = {
            retryCount: (_c = options === null || options === void 0 ? void 0 : options.fetchRetryCount) !== null && _c !== void 0 ? _c : 3,
            retryDelay: (_d = options === null || options === void 0 ? void 0 : options.fetchRetryDelay) !== null && _d !== void 0 ? _d : 3000,
        };
        this._sessionExpirationTimeSeconds = (_e = options === null || options === void 0 ? void 0 : options.sessionExpirationTimeSeconds) !== null && _e !== void 0 ? _e : 1800; // 30 minutes
        // NOTE: It is important we don't initiate anything in the constructor as some async IO may still be underway on the parent
        if ((options === null || options === void 0 ? void 0 : options.preloadFeatureFlags) !== false) {
            safeSetTimeout(function () {
                void _this.reloadFeatureFlagsAsync();
            }, 1);
        }
    }
    AnalyticKitCore.prototype.getCommonEventProperties = function () {
        var featureFlags = this.getFeatureFlags();
        var featureVariantProperties = {};
        if (featureFlags) {
            for (var _i = 0, _a = Object.entries(featureFlags); _i < _a.length; _i++) {
                var _b = _a[_i], feature = _b[0], variant = _b[1];
                featureVariantProperties["$feature/".concat(feature)] = variant;
            }
        }
        return __assign({ $lib: this.getLibraryId(), $lib_version: this.getLibraryVersion(), $active_feature_flags: featureFlags ? Object.keys(featureFlags) : undefined }, featureVariantProperties);
    };
    Object.defineProperty(AnalyticKitCore.prototype, "props", {
        // NOTE: Props are lazy loaded from localstorage hence the complex getter setter logic
        get: function () {
            if (!this._props) {
                this._props = this.getPersistedProperty(AnalyticKitPersistedProperty.Props);
            }
            return this._props || {};
        },
        set: function (val) {
            this._props = val;
        },
        enumerable: false,
        configurable: true
    });
    AnalyticKitCore.prototype.clearProps = function () {
        this.props = undefined;
    };
    Object.defineProperty(AnalyticKitCore.prototype, "optedOut", {
        get: function () {
            var _a, _b;
            return (_b = (_a = this.getPersistedProperty(AnalyticKitPersistedProperty.OptedOut)) !== null && _a !== void 0 ? _a : this._optoutOverride) !== null && _b !== void 0 ? _b : false;
        },
        enumerable: false,
        configurable: true
    });
    AnalyticKitCore.prototype.optIn = function () {
        this.setPersistedProperty(AnalyticKitPersistedProperty.OptedOut, false);
    };
    AnalyticKitCore.prototype.optOut = function () {
        this.setPersistedProperty(AnalyticKitPersistedProperty.OptedOut, true);
    };
    AnalyticKitCore.prototype.on = function (event, cb) {
        return this._events.on(event, cb);
    };
    AnalyticKitCore.prototype.reset = function (propertiesToKeep) {
        var allPropertiesToKeep = __spreadArray([AnalyticKitPersistedProperty.Queue], (propertiesToKeep || []), true);
        // clean up props
        this.clearProps();
        for (var _i = 0, _a = Object.keys(AnalyticKitPersistedProperty); _i < _a.length; _i++) {
            var key = _a[_i];
            if (!allPropertiesToKeep.includes(AnalyticKitPersistedProperty[key])) {
                this.setPersistedProperty(AnalyticKitPersistedProperty[key], null);
            }
        }
    };
    AnalyticKitCore.prototype.debug = function (enabled) {
        var _a;
        if (enabled === void 0) { enabled = true; }
        (_a = this.removeDebugCallback) === null || _a === void 0 ? void 0 : _a.call(this);
        if (enabled) {
            this.removeDebugCallback = this.on('*', function (event, payload) { return console.log('AnalyticKit Debug', event, payload); });
        }
    };
    AnalyticKitCore.prototype.buildPayload = function (payload) {
        return {
            distinct_id: payload.distinct_id || this.getDistinctId(),
            event: payload.event,
            properties: __assign(__assign(__assign(__assign({}, this.props), (payload.properties || {})), this.getCommonEventProperties()), { $session_id: this.getSessionId() }),
        };
    };
    AnalyticKitCore.prototype.getSessionId = function () {
        var sessionId = this.getPersistedProperty(AnalyticKitPersistedProperty.SessionId);
        var sessionTimestamp = this.getPersistedProperty(AnalyticKitPersistedProperty.SessionLastTimestamp) || 0;
        if (!sessionId || Date.now() - sessionTimestamp > this._sessionExpirationTimeSeconds * 1000) {
            sessionId = generateUUID(globalThis);
            this.setPersistedProperty(AnalyticKitPersistedProperty.SessionId, sessionId);
        }
        this.setPersistedProperty(AnalyticKitPersistedProperty.SessionLastTimestamp, Date.now());
        return sessionId;
    };
    AnalyticKitCore.prototype.resetSessionId = function () {
        this.setPersistedProperty(AnalyticKitPersistedProperty.SessionId, null);
    };
    AnalyticKitCore.prototype.getAnonymousId = function () {
        var anonId = this.getPersistedProperty(AnalyticKitPersistedProperty.AnonymousId);
        if (!anonId) {
            anonId = generateUUID(globalThis);
            this.setPersistedProperty(AnalyticKitPersistedProperty.AnonymousId, anonId);
        }
        return anonId;
    };
    AnalyticKitCore.prototype.getDistinctId = function () {
        return this.getPersistedProperty(AnalyticKitPersistedProperty.DistinctId) || this.getAnonymousId();
    };
    AnalyticKitCore.prototype.register = function (properties) {
        this.props = __assign(__assign({}, this.props), properties);
        this.setPersistedProperty(AnalyticKitPersistedProperty.Props, this.props);
    };
    AnalyticKitCore.prototype.unregister = function (property) {
        delete this.props[property];
        this.setPersistedProperty(AnalyticKitPersistedProperty.Props, this.props);
    };
    /***
     *** TRACKING
     ***/
    AnalyticKitCore.prototype.identify = function (distinctId, properties) {
        var previousDistinctId = this.getDistinctId();
        distinctId = distinctId || previousDistinctId;
        if (properties === null || properties === void 0 ? void 0 : properties.$groups) {
            this.groups(properties.$groups);
        }
        var payload = __assign(__assign({}, this.buildPayload({
            distinct_id: distinctId,
            event: '$identify',
            properties: __assign(__assign({}, (properties || {})), { $anon_distinct_id: this.getAnonymousId() }),
        })), { $set: properties });
        if (distinctId !== previousDistinctId) {
            // We keep the AnonymousId to be used by decide calls and identify to link the previousId
            this.setPersistedProperty(AnalyticKitPersistedProperty.AnonymousId, previousDistinctId);
            this.setPersistedProperty(AnalyticKitPersistedProperty.DistinctId, distinctId);
            if (this.getFeatureFlags()) {
                void this.reloadFeatureFlagsAsync();
            }
        }
        this.enqueue('identify', payload);
        return this;
    };
    AnalyticKitCore.prototype.capture = function (event, properties, forceSendFeatureFlags) {
        if (forceSendFeatureFlags === void 0) { forceSendFeatureFlags = false; }
        if (properties === null || properties === void 0 ? void 0 : properties.$groups) {
            this.groups(properties.$groups);
        }
        if (forceSendFeatureFlags) {
            this._sendFeatureFlags(event, properties);
        }
        else {
            var payload = this.buildPayload({ event: event, properties: properties });
            this.enqueue('capture', payload);
        }
        return this;
    };
    AnalyticKitCore.prototype.alias = function (alias) {
        var distinctId = this.getDistinctId();
        var payload = this.buildPayload({
            event: '$create_alias',
            properties: {
                distinct_id: distinctId,
                alias: alias,
            },
        });
        this.enqueue('alias', payload);
        return this;
    };
    AnalyticKitCore.prototype.autocapture = function (eventType, elements, properties) {
        if (properties === void 0) { properties = {}; }
        var payload = this.buildPayload({
            event: '$autocapture',
            properties: __assign(__assign({}, properties), { $event_type: eventType, $elements: elements }),
        });
        this.enqueue('autocapture', payload);
        return this;
    };
    /***
     *** GROUPS
     ***/
    AnalyticKitCore.prototype.groups = function (groups) {
        // Get persisted groups
        var existingGroups = this.props.$groups || {};
        this.register({
            $groups: __assign(__assign({}, existingGroups), groups),
        });
        if (Object.keys(groups).find(function (type) { return existingGroups[type] !== groups[type]; }) && this.getFeatureFlags()) {
            void this.reloadFeatureFlagsAsync();
        }
        return this;
    };
    AnalyticKitCore.prototype.group = function (groupType, groupKey, groupProperties) {
        var _a;
        this.groups((_a = {},
            _a[groupType] = groupKey,
            _a));
        if (groupProperties) {
            this.groupIdentify(groupType, groupKey, groupProperties);
        }
        return this;
    };
    AnalyticKitCore.prototype.groupIdentify = function (groupType, groupKey, groupProperties) {
        var payload = {
            event: '$groupidentify',
            distinctId: "$".concat(groupType, "_").concat(groupKey),
            properties: __assign({ $group_type: groupType, $group_key: groupKey, $group_set: groupProperties || {} }, this.getCommonEventProperties()),
        };
        this.enqueue('capture', payload);
        return this;
    };
    /***
     * PROPERTIES
     ***/
    AnalyticKitCore.prototype.personProperties = function (properties) {
        // Get persisted person properties
        var existingProperties = this.getPersistedProperty(AnalyticKitPersistedProperty.PersonProperties) || {};
        this.setPersistedProperty(AnalyticKitPersistedProperty.PersonProperties, __assign(__assign({}, existingProperties), properties));
        return this;
    };
    AnalyticKitCore.prototype.groupProperties = function (properties) {
        // Get persisted group properties
        var existingProperties = this.getPersistedProperty(AnalyticKitPersistedProperty.GroupProperties) || {};
        if (Object.keys(existingProperties).length !== 0) {
            Object.keys(existingProperties).forEach(function (groupType) {
                existingProperties[groupType] = __assign(__assign({}, existingProperties[groupType]), properties[groupType]);
                delete properties[groupType];
            });
        }
        this.setPersistedProperty(AnalyticKitPersistedProperty.GroupProperties, __assign(__assign({}, existingProperties), properties));
        return this;
    };
    /***
     *** FEATURE FLAGS
     ***/
    AnalyticKitCore.prototype.decideAsync = function (sendAnonDistinctId) {
        if (sendAnonDistinctId === void 0) { sendAnonDistinctId = true; }
        if (this._decideResponsePromise) {
            return this._decideResponsePromise;
        }
        return this._decideAsync(sendAnonDistinctId);
    };
    AnalyticKitCore.prototype._decideAsync = function (sendAnonDistinctId) {
        if (sendAnonDistinctId === void 0) { sendAnonDistinctId = true; }
        return __awaiter(this, void 0, void 0, function () {
            var url, distinctId, groups, personProperties, groupProperties, fetchOptions;
            var _this = this;
            return __generator(this, function (_a) {
                url = "".concat(this.host, "/decide/?v=2");
                distinctId = this.getDistinctId();
                groups = this.props.$groups || {};
                personProperties = this.getPersistedProperty(AnalyticKitPersistedProperty.PersonProperties) || {};
                groupProperties = this.getPersistedProperty(AnalyticKitPersistedProperty.GroupProperties) || {};
                fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: this.apiKey,
                        distinct_id: distinctId,
                        $anon_distinct_id: sendAnonDistinctId ? this.getAnonymousId() : undefined,
                        groups: groups,
                        person_properties: personProperties,
                        group_properties: groupProperties,
                    }),
                };
                this._decideResponsePromise = this.fetchWithRetry(url, fetchOptions)
                    .then(function (r) { return r.json(); })
                    .then(function (res) {
                    if (res.featureFlags) {
                        _this.setPersistedProperty(AnalyticKitPersistedProperty.FeatureFlags, res.featureFlags);
                        _this._events.emit('featureflags', res.featureFlags);
                    }
                    return res;
                })
                    .finally(function () {
                    _this._decideResponsePromise = undefined;
                });
                return [2 /*return*/, this._decideResponsePromise];
            });
        });
    };
    AnalyticKitCore.prototype.getFeatureFlag = function (key) {
        var featureFlags = this.getFeatureFlags();
        if (!featureFlags) {
            // If we haven't loaded flags yet, or errored out, we respond with undefined
            return undefined;
        }
        var response = featureFlags[key];
        if (response === undefined) {
            // `/decide` returns nothing for flags which are false.
            response = false;
        }
        if (this.sendFeatureFlagEvent && !this.flagCallReported[key]) {
            this.flagCallReported[key] = true;
            this.capture('$feature_flag_called', {
                $feature_flag: key,
                $feature_flag_response: response,
            });
        }
        // If we have flags we either return the value (true or string) or false
        return response;
    };
    AnalyticKitCore.prototype.getFeatureFlags = function () {
        var flags = this.getPersistedProperty(AnalyticKitPersistedProperty.FeatureFlags);
        var overriddenFlags = this.getPersistedProperty(AnalyticKitPersistedProperty.OverrideFeatureFlags);
        if (!overriddenFlags) {
            return flags;
        }
        flags = flags || {};
        for (var key in overriddenFlags) {
            if (!overriddenFlags[key]) {
                delete flags[key];
            }
            else {
                flags[key] = overriddenFlags[key];
            }
        }
        return flags;
    };
    AnalyticKitCore.prototype.isFeatureEnabled = function (key) {
        var response = this.getFeatureFlag(key);
        if (response === undefined) {
            return undefined;
        }
        return !!response;
    };
    AnalyticKitCore.prototype.reloadFeatureFlagsAsync = function (sendAnonDistinctId) {
        if (sendAnonDistinctId === void 0) { sendAnonDistinctId = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.decideAsync(sendAnonDistinctId)];
                    case 1: return [2 /*return*/, (_a.sent()).featureFlags];
                }
            });
        });
    };
    AnalyticKitCore.prototype.onFeatureFlags = function (cb) {
        var _this = this;
        return this.on('featureflags', function () { return __awaiter(_this, void 0, void 0, function () {
            var flags;
            return __generator(this, function (_a) {
                flags = this.getFeatureFlags();
                if (flags) {
                    cb(flags);
                }
                return [2 /*return*/];
            });
        }); });
    };
    AnalyticKitCore.prototype.onFeatureFlag = function (key, cb) {
        var _this = this;
        return this.on('featureflags', function () { return __awaiter(_this, void 0, void 0, function () {
            var flagResponse;
            return __generator(this, function (_a) {
                flagResponse = this.getFeatureFlag(key);
                if (flagResponse !== undefined) {
                    cb(flagResponse);
                }
                return [2 /*return*/];
            });
        }); });
    };
    AnalyticKitCore.prototype.overrideFeatureFlag = function (flags) {
        if (flags === null) {
            return this.setPersistedProperty(AnalyticKitPersistedProperty.OverrideFeatureFlags, null);
        }
        return this.setPersistedProperty(AnalyticKitPersistedProperty.OverrideFeatureFlags, flags);
    };
    AnalyticKitCore.prototype._sendFeatureFlags = function (event, properties) {
        var _this = this;
        this.reloadFeatureFlagsAsync(false).finally(function () {
            // Try to enqueue message irrespective of errors during feature flag fetching
            var payload = _this.buildPayload({ event: event, properties: properties });
            _this.enqueue('capture', payload);
        });
    };
    /***
     *** QUEUEING AND FLUSHING
     ***/
    AnalyticKitCore.prototype.enqueue = function (type, _message) {
        var _this = this;
        if (this.optedOut) {
            return;
        }
        var message = __assign(__assign({}, _message), { type: type, library: this.getLibraryId(), library_version: this.getLibraryVersion(), timestamp: _message.timestamp ? _message.timestamp : currentISOTime() });
        if (message.distinctId) {
            message.distinct_id = message.distinctId;
            delete message.distinctId;
        }
        var queue = this.getPersistedProperty(AnalyticKitPersistedProperty.Queue) || [];
        queue.push({ message: message });
        this.setPersistedProperty(AnalyticKitPersistedProperty.Queue, queue);
        this._events.emit(type, message);
        // Flush queued events if we meet the flushAt length
        if (queue.length >= this.flushAt) {
            this.flush();
        }
        if (this.flushInterval && !this._flushTimer) {
            this._flushTimer = safeSetTimeout(function () { return _this.flush(); }, this.flushInterval);
        }
    };
    AnalyticKitCore.prototype.flushAsync = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.flush(function (err, data) {
                return err ? reject(err) : resolve(data);
            });
        });
    };
    AnalyticKitCore.prototype.flush = function (callback) {
        var _this = this;
        if (this.optedOut) {
            return callback === null || callback === void 0 ? void 0 : callback();
        }
        if (this._flushTimer) {
            clearTimeout(this._flushTimer);
            this._flushTimer = null;
        }
        var queue = this.getPersistedProperty(AnalyticKitPersistedProperty.Queue) || [];
        if (!queue.length) {
            return callback === null || callback === void 0 ? void 0 : callback();
        }
        var items = queue.splice(0, this.flushAt);
        this.setPersistedProperty(AnalyticKitPersistedProperty.Queue, queue);
        var messages = items.map(function (item) { return item.message; });
        var data = {
            api_key: this.apiKey,
            batch: messages,
            sent_at: currentISOTime(),
        };
        var done = function (err) {
            callback === null || callback === void 0 ? void 0 : callback(err, messages);
            _this._events.emit('flush', messages);
        };
        // Don't set the user agent if we're not on a browser. The latest spec allows
        // the User-Agent header (see https://fetch.spec.whatwg.org/#terminology-headers
        // and https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader),
        // but browsers such as Chrome and Safari have not caught up.
        this.getCustomUserAgent();
        var payload = JSON.stringify(data);
        var url = this.captureMode === 'form'
            ? "".concat(this.host, "/e/?ip=1&_=").concat(currentTimestamp(), "&v=").concat(this.getLibraryVersion())
            : "".concat(this.host, "/batch/");
        var fetchOptions = this.captureMode === 'form'
            ? {
                method: 'POST',
                mode: 'no-cors',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: "data=".concat(encodeURIComponent(LZString.compressToBase64(payload)), "&compression=lz64"),
            }
            : {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
            };
        this.fetchWithRetry(url, fetchOptions)
            .then(function () { return done(); })
            .catch(function (err) {
            if (err.response) {
                var error = new Error(err.response.statusText);
                return done(error);
            }
            done(err);
        });
    };
    AnalyticKitCore.prototype.fetchWithRetry = function (url, options, retryOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, retriable(function () { return _this.fetch(url, options); }, retryOptions || this._retryOptions)];
            });
        });
    };
    AnalyticKitCore.prototype.shutdownAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clearTimeout(this._flushTimer);
                        return [4 /*yield*/, this.flushAsync()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AnalyticKitCore.prototype.shutdown = function () {
        void this.shutdownAsync();
    };
    return AnalyticKitCore;
}());

var AnalyticKitMemoryStorage = /** @class */ (function () {
    function AnalyticKitMemoryStorage() {
        this._memoryStorage = {};
    }
    AnalyticKitMemoryStorage.prototype.getProperty = function (key) {
        return this._memoryStorage[key];
    };
    AnalyticKitMemoryStorage.prototype.setProperty = function (key, value) {
        this._memoryStorage[key] = value !== null ? value : undefined;
    };
    return AnalyticKitMemoryStorage;
}());

var LONG_SCALE = 0xfffffffffffffff;

var ClientError =
/** @class */
function (_super) {
  __extends(ClientError, _super);

  function ClientError(message) {
    var _this = _super.call(this) || this;

    Error.captureStackTrace(_this, _this.constructor);
    _this.name = 'ClientError';
    _this.message = message;
    Object.setPrototypeOf(_this, ClientError.prototype);
    return _this;
  }

  return ClientError;
}(Error);

var InconclusiveMatchError =
/** @class */
function (_super) {
  __extends(InconclusiveMatchError, _super);

  function InconclusiveMatchError(message) {
    var _this = _super.call(this, message) || this;

    _this.name = _this.constructor.name;
    Error.captureStackTrace(_this, _this.constructor); // instanceof doesn't work in ES3 or ES5
    // https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
    // this is the workaround

    Object.setPrototypeOf(_this, InconclusiveMatchError.prototype);
    return _this;
  }

  return InconclusiveMatchError;
}(Error);

var FeatureFlagsPoller =
/** @class */
function () {
  function FeatureFlagsPoller(_a) {
    var pollingInterval = _a.pollingInterval,
        personalApiKey = _a.personalApiKey,
        projectApiKey = _a.projectApiKey,
        timeout = _a.timeout,
        host = _a.host;
    this.pollingInterval = pollingInterval;
    this.personalApiKey = personalApiKey;
    this.featureFlags = [];
    this.groupTypeMapping = {};
    this.loadedSuccessfullyOnce = false;
    this.timeout = timeout;
    this.projectApiKey = projectApiKey;
    this.host = host;
    this.poller = undefined;
    void this.loadFeatureFlags();
  }

  FeatureFlagsPoller.prototype.getFeatureFlag = function (key, distinctId, groups, personProperties, groupProperties) {
    if (groups === void 0) {
      groups = {};
    }

    if (personProperties === void 0) {
      personProperties = {};
    }

    if (groupProperties === void 0) {
      groupProperties = {};
    }

    return __awaiter(this, void 0, void 0, function () {
      var response, featureFlag, _i, _a, flag;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4
            /*yield*/
            , this.loadFeatureFlags()];

          case 1:
            _b.sent();

            response = undefined;
            featureFlag = undefined;

            if (!this.loadedSuccessfullyOnce) {
              return [2
              /*return*/
              , response];
            }

            for (_i = 0, _a = this.featureFlags; _i < _a.length; _i++) {
              flag = _a[_i];

              if (key === flag.key) {
                featureFlag = flag;
                break;
              }
            }

            if (featureFlag !== undefined) {
              try {
                response = this.computeFlagLocally(featureFlag, distinctId, groups, personProperties, groupProperties);
                console.debug("Successfully computed flag locally: ".concat(key, " -> ").concat(response));
              } catch (e) {
                if (e instanceof InconclusiveMatchError) {
                  console.debug("Can't compute flag locally: ".concat(key, ": ").concat(e));
                } else if (e instanceof Error) {
                  console.error("Error computing flag locally: ".concat(key, ": ").concat(e));
                }
              }
            }

            return [2
            /*return*/
            , response];
        }
      });
    });
  };

  FeatureFlagsPoller.prototype.getAllFlags = function (distinctId, groups, personProperties, groupProperties) {
    if (groups === void 0) {
      groups = {};
    }

    if (personProperties === void 0) {
      personProperties = {};
    }

    if (groupProperties === void 0) {
      groupProperties = {};
    }

    return __awaiter(this, void 0, void 0, function () {
      var response, fallbackToDecide;

      var _this = this;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , this.loadFeatureFlags()];

          case 1:
            _a.sent();

            response = {};
            fallbackToDecide = this.featureFlags.length == 0;
            this.featureFlags.map(function (flag) {
              try {
                response[flag.key] = _this.computeFlagLocally(flag, distinctId, groups, personProperties, groupProperties);
              } catch (e) {
                if (e instanceof InconclusiveMatchError) ; else if (e instanceof Error) {
                  console.error("Error computing flag locally: ".concat(flag.key, ": ").concat(e));
                }

                fallbackToDecide = true;
              }
            });
            return [2
            /*return*/
            , {
              response: response,
              fallbackToDecide: fallbackToDecide
            }];
        }
      });
    });
  };

  FeatureFlagsPoller.prototype.computeFlagLocally = function (flag, distinctId, groups, personProperties, groupProperties) {
    if (groups === void 0) {
      groups = {};
    }

    if (personProperties === void 0) {
      personProperties = {};
    }

    if (groupProperties === void 0) {
      groupProperties = {};
    }

    if (flag.ensure_experience_continuity) {
      throw new InconclusiveMatchError('Flag has experience continuity enabled');
    }

    if (!flag.active) {
      return false;
    }

    var flagFilters = flag.filters || {};
    var aggregation_group_type_index = flagFilters.aggregation_group_type_index;

    if (aggregation_group_type_index != undefined) {
      var groupName = this.groupTypeMapping[String(aggregation_group_type_index)];

      if (!groupName) {
        console.warn("[FEATURE FLAGS] Unknown group type index ".concat(aggregation_group_type_index, " for feature flag ").concat(flag.key));
        throw new InconclusiveMatchError('Flag has unknown group type index');
      }

      if (!(groupName in groups)) {
        console.warn("[FEATURE FLAGS] Can't compute group feature flag: ".concat(flag.key, " without group names passed in"));
        return false;
      }

      var focusedGroupProperties = groupProperties[groupName];
      return this.matchFeatureFlagProperties(flag, groups[groupName], focusedGroupProperties);
    } else {
      return this.matchFeatureFlagProperties(flag, distinctId, personProperties);
    }
  };

  FeatureFlagsPoller.prototype.matchFeatureFlagProperties = function (flag, distinctId, properties) {
    var _this = this;

    var flagFilters = flag.filters || {};
    var flagConditions = flagFilters.groups || [];
    var isInconclusive = false;
    var result = undefined;
    flagConditions.forEach(function (condition) {
      try {
        if (_this.isConditionMatch(flag, distinctId, condition, properties)) {
          result = _this.getMatchingVariant(flag, distinctId) || true;
        }
      } catch (e) {
        if (e instanceof InconclusiveMatchError) {
          isInconclusive = true;
        } else {
          throw e;
        }
      }
    });

    if (result !== undefined) {
      return result;
    } else if (isInconclusive) {
      throw new InconclusiveMatchError("Can't determine if feature flag is enabled or not with given properties");
    } // We can only return False when all conditions are False


    return false;
  };

  FeatureFlagsPoller.prototype.isConditionMatch = function (flag, distinctId, condition, properties) {
    var rolloutPercentage = condition.rollout_percentage;

    if ((condition.properties || []).length > 0) {
      var matchAll = condition.properties.every(function (property) {
        return matchProperty(property, properties);
      });

      if (!matchAll) {
        return false;
      } else if (rolloutPercentage == undefined) {
        // == to include `null` as a match, not just `undefined`
        return true;
      }
    }

    if (rolloutPercentage != undefined && _hash(flag.key, distinctId) > rolloutPercentage / 100.0) {
      return false;
    }

    return true;
  };

  FeatureFlagsPoller.prototype.getMatchingVariant = function (flag, distinctId) {
    var hashValue = _hash(flag.key, distinctId, 'variant');

    var matchingVariant = this.variantLookupTable(flag).find(function (variant) {
      return hashValue >= variant.valueMin && hashValue < variant.valueMax;
    });

    if (matchingVariant) {
      return matchingVariant.key;
    }

    return undefined;
  };

  FeatureFlagsPoller.prototype.variantLookupTable = function (flag) {
    var _a;

    var lookupTable = [];
    var valueMin = 0;
    var valueMax = 0;
    var flagFilters = flag.filters || {};
    var multivariates = ((_a = flagFilters.multivariate) === null || _a === void 0 ? void 0 : _a.variants) || [];
    multivariates.forEach(function (variant) {
      valueMax = valueMin + variant.rollout_percentage / 100.0;
      lookupTable.push({
        valueMin: valueMin,
        valueMax: valueMax,
        key: variant.key
      });
      valueMin = valueMax;
    });
    return lookupTable;
  };

  FeatureFlagsPoller.prototype.loadFeatureFlags = function (forceReload) {
    if (forceReload === void 0) {
      forceReload = false;
    }

    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(!this.loadedSuccessfullyOnce || forceReload)) return [3
            /*break*/
            , 2];
            return [4
            /*yield*/
            , this._loadFeatureFlags()];

          case 1:
            _a.sent();

            _a.label = 2;

          case 2:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  FeatureFlagsPoller.prototype._loadFeatureFlags = function () {
    return __awaiter(this, void 0, void 0, function () {
      var res, responseJson, err_1;

      var _this = this;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.poller) {
              clearTimeout(this.poller);
              this.poller = undefined;
            }

            this.poller = setTimeout(function () {
              return _this._loadFeatureFlags();
            }, this.pollingInterval);
            _a.label = 1;

          case 1:
            _a.trys.push([1, 4,, 5]);

            return [4
            /*yield*/
            , this._requestFeatureFlagDefinitions()];

          case 2:
            res = _a.sent();

            if (res && res.statusCode === 401) {
              throw new ClientError("Your personalApiKey is invalid. Are you sure you're not using your Project API key? More information: https://analytickit.com/docs/api/overview");
            }

            return [4
            /*yield*/
            , res.body.json()];

          case 3:
            responseJson = _a.sent();

            if (!('flags' in responseJson)) {
              console.error("Invalid response when getting feature flags: ".concat(JSON.stringify(responseJson)));
            }

            this.featureFlags = responseJson.flags || [];
            this.groupTypeMapping = responseJson.group_type_mapping || {};
            this.loadedSuccessfullyOnce = true;
            return [3
            /*break*/
            , 5];

          case 4:
            err_1 = _a.sent(); // if an error that is not an instance of ClientError is thrown
            // we silently ignore the error when reloading feature flags

            if (err_1 instanceof ClientError) {
              throw err_1;
            }

            return [3
            /*break*/
            , 5];

          case 5:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  FeatureFlagsPoller.prototype._requestFeatureFlagDefinitions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var url, headers, options, res, err_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            url = "".concat(this.host, "/api/feature_flag/local_evaluation?token=").concat(this.projectApiKey);
            headers = {
              'Content-Type': 'application/json',
              Authorization: "Bearer ".concat(this.personalApiKey),
              'user-agent': "analytickit-node/".concat(version)
            };
            options = {
              method: 'GET',
              headers: headers
            };

            if (this.timeout && typeof this.timeout === 'number') {
              options.bodyTimeout = this.timeout;
            }

            _a.label = 1;

          case 1:
            _a.trys.push([1, 3,, 4]);

            return [4
            /*yield*/
            , request(url, options)];

          case 2:
            res = _a.sent();
            return [3
            /*break*/
            , 4];

          case 3:
            err_2 = _a.sent();
            throw new Error("Request failed with error: ".concat(err_2));

          case 4:
            return [2
            /*return*/
            , res];
        }
      });
    });
  };

  FeatureFlagsPoller.prototype.stopPoller = function () {
    clearTimeout(this.poller);
  };

  return FeatureFlagsPoller;
}(); // # This function takes a distinct_id and a feature flag key and returns a float between 0 and 1.
// # Given the same distinct_id and key, it'll always return the same float. These floats are
// # uniformly distributed between 0 and 1, so if we want to show this feature to 20% of traffic
// # we can do _hash(key, distinct_id) < 0.2


function _hash(key, distinctId, salt) {
  if (salt === void 0) {
    salt = '';
  }

  var sha1Hash = createHash('sha1');
  sha1Hash.update("".concat(key, ".").concat(distinctId).concat(salt));
  return parseInt(sha1Hash.digest('hex').slice(0, 15), 16) / LONG_SCALE;
}

function matchProperty(property, propertyValues) {
  var key = property.key;
  var value = property.value;
  var operator = property.operator || 'exact';

  if (!(key in propertyValues)) {
    throw new InconclusiveMatchError("Property ".concat(key, " not found in propertyValues"));
  } else if (operator === 'is_not_set') {
    throw new InconclusiveMatchError("Operator is_not_set is not supported");
  }

  var overrideValue = propertyValues[key];

  switch (operator) {
    case 'exact':
      return Array.isArray(value) ? value.indexOf(overrideValue) !== -1 : value === overrideValue;

    case 'is_not':
      return Array.isArray(value) ? value.indexOf(overrideValue) === -1 : value !== overrideValue;

    case 'is_set':
      return key in propertyValues;

    case 'icontains':
      return String(overrideValue).toLowerCase().includes(String(value).toLowerCase());

    case 'not_icontains':
      return !String(overrideValue).toLowerCase().includes(String(value).toLowerCase());

    case 'regex':
      return isValidRegex(String(value)) && String(overrideValue).match(String(value)) !== null;

    case 'not_regex':
      return isValidRegex(String(value)) && String(overrideValue).match(String(value)) === null;

    case 'gt':
      return typeof overrideValue == typeof value && overrideValue > value;

    case 'gte':
      return typeof overrideValue == typeof value && overrideValue >= value;

    case 'lt':
      return typeof overrideValue == typeof value && overrideValue < value;

    case 'lte':
      return typeof overrideValue == typeof value && overrideValue <= value;

    default:
      console.error("Unknown operator: ".concat(operator));
      return false;
  }
}

function isValidRegex(regex) {
  try {
    new RegExp(regex);
    return true;
  } catch (err) {
    return false;
  }
}

var THIRTY_SECONDS = 30 * 1000;
var MAX_CACHE_SIZE = 50 * 1000;

var AnalyticKit =
/** @class */
function (_super) {
  __extends(AnalyticKit, _super);

  function AnalyticKit(apiKey, options) {
    if (options === void 0) {
      options = {};
    }

    var _this = this;

    options.captureMode = (options === null || options === void 0 ? void 0 : options.captureMode) || 'json';
    options.preloadFeatureFlags = false; // Don't preload as this makes no sense without a distinctId

    options.sendFeatureFlagEvent = false; // Let `analytickit-node` handle this on its own, since we're dealing with multiple distinctIDs

    _this = _super.call(this, apiKey, options) || this;
    _this._memoryStorage = new AnalyticKitMemoryStorage();
    return _this;
  }

  AnalyticKit.prototype.getPersistedProperty = function (key) {
    return this._memoryStorage.getProperty(key);
  };

  AnalyticKit.prototype.setPersistedProperty = function (key, value) {
    return this._memoryStorage.setProperty(key, value);
  };

  AnalyticKit.prototype.getSessionId = function () {
    // Sessions don't make sense for Node
    return undefined;
  };

  AnalyticKit.prototype.fetch = function (url, options) {
    return undici.fetch(url, options);
  };

  AnalyticKit.prototype.getLibraryId = function () {
    return 'analytickit-node';
  };

  AnalyticKit.prototype.getLibraryVersion = function () {
    return version;
  };

  AnalyticKit.prototype.getCustomUserAgent = function () {
    return "analytickit-node/".concat(version);
  };

  return AnalyticKit;
}(AnalyticKitCore); // The actual exported Nodejs API.


var AnalyticKitGlobal =
/** @class */
function () {
  function AnalyticKitGlobal(apiKey, options) {
    if (options === void 0) {
      options = {};
    }

    this._sharedClient = new AnalyticKit(apiKey, options);

    if (options.personalApiKey) {
      this.featureFlagsPoller = new FeatureFlagsPoller({
        pollingInterval: typeof options.featureFlagsPollingInterval === 'number' ? options.featureFlagsPollingInterval : THIRTY_SECONDS,
        personalApiKey: options.personalApiKey,
        projectApiKey: apiKey,
        timeout: options.requestTimeout,
        host: this._sharedClient.host
      });
    }

    this.distinctIdHasSentFlagCalls = {};
    this.maxCacheSize = options.maxCacheSize || MAX_CACHE_SIZE;
  }

  AnalyticKitGlobal.prototype.reInit = function (distinctId) {
    // Certain properties we want to persist. Queue is persisted always by default.
    this._sharedClient.reset([AnalyticKitPersistedProperty.OptedOut]);

    this._sharedClient.setPersistedProperty(AnalyticKitPersistedProperty.DistinctId, distinctId);
  };

  AnalyticKitGlobal.prototype.enable = function () {
    return this._sharedClient.optIn();
  };

  AnalyticKitGlobal.prototype.disable = function () {
    return this._sharedClient.optOut();
  };

  AnalyticKitGlobal.prototype.capture = function (_a) {
    var distinctId = _a.distinctId,
        event = _a.event,
        properties = _a.properties,
        groups = _a.groups,
        sendFeatureFlags = _a.sendFeatureFlags;
    this.reInit(distinctId);

    if (groups) {
      this._sharedClient.groups(groups);
    }

    this._sharedClient.capture(event, properties, sendFeatureFlags || false);
  };

  AnalyticKitGlobal.prototype.identify = function (_a) {
    var distinctId = _a.distinctId,
        properties = _a.properties;
    this.reInit(distinctId);

    this._sharedClient.identify(distinctId, properties);
  };

  AnalyticKitGlobal.prototype.alias = function (data) {
    this.reInit(data.distinctId);

    this._sharedClient.alias(data.alias);
  };

  AnalyticKitGlobal.prototype.getFeatureFlag = function (key, distinctId, options) {
    var _a;

    return __awaiter(this, void 0, void 0, function () {
      var _b, groups, personProperties, groupProperties, _c, onlyEvaluateLocally, sendFeatureFlagEvents, response, flagWasLocallyEvaluated, featureFlagReportedKey;

      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _b = options || {}, groups = _b.groups, personProperties = _b.personProperties, groupProperties = _b.groupProperties;
            _c = options || {}, onlyEvaluateLocally = _c.onlyEvaluateLocally, sendFeatureFlagEvents = _c.sendFeatureFlagEvents; // set defaults

            if (onlyEvaluateLocally == undefined) {
              onlyEvaluateLocally = false;
            }

            if (sendFeatureFlagEvents == undefined) {
              sendFeatureFlagEvents = true;
            }

            return [4
            /*yield*/
            , (_a = this.featureFlagsPoller) === null || _a === void 0 ? void 0 : _a.getFeatureFlag(key, distinctId, groups, personProperties, groupProperties)];

          case 1:
            response = _d.sent();
            flagWasLocallyEvaluated = response !== undefined;
            if (!(!flagWasLocallyEvaluated && !onlyEvaluateLocally)) return [3
            /*break*/
            , 3];
            this.reInit(distinctId);

            if (groups != undefined) {
              this._sharedClient.groups(groups);
            }

            if (personProperties) {
              this._sharedClient.personProperties(personProperties);
            }

            if (groupProperties) {
              this._sharedClient.groupProperties(groupProperties);
            }

            return [4
            /*yield*/
            , this._sharedClient.reloadFeatureFlagsAsync(false)];

          case 2:
            _d.sent();

            response = this._sharedClient.getFeatureFlag(key);
            _d.label = 3;

          case 3:
            featureFlagReportedKey = "".concat(key, "_").concat(response);

            if (sendFeatureFlagEvents && (!(distinctId in this.distinctIdHasSentFlagCalls) || !this.distinctIdHasSentFlagCalls[distinctId].includes(featureFlagReportedKey))) {
              if (Object.keys(this.distinctIdHasSentFlagCalls).length >= this.maxCacheSize) {
                this.distinctIdHasSentFlagCalls = {};
              }

              if (Array.isArray(this.distinctIdHasSentFlagCalls[distinctId])) {
                this.distinctIdHasSentFlagCalls[distinctId].push(featureFlagReportedKey);
              } else {
                this.distinctIdHasSentFlagCalls[distinctId] = [featureFlagReportedKey];
              }

              this.capture({
                distinctId: distinctId,
                event: '$feature_flag_called',
                properties: {
                  $feature_flag: key,
                  $feature_flag_response: response,
                  locally_evaluated: flagWasLocallyEvaluated
                },
                groups: groups
              });
            }

            return [2
            /*return*/
            , response];
        }
      });
    });
  };

  AnalyticKitGlobal.prototype.isFeatureEnabled = function (key, distinctId, options) {
    return __awaiter(this, void 0, void 0, function () {
      var feat;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , this.getFeatureFlag(key, distinctId, options)];

          case 1:
            feat = _a.sent();

            if (feat === undefined) {
              return [2
              /*return*/
              , undefined];
            }

            return [2
            /*return*/
            , !!feat || false];
        }
      });
    });
  };

  AnalyticKitGlobal.prototype.getAllFlags = function (distinctId, options) {
    var _a;

    return __awaiter(this, void 0, void 0, function () {
      var _b, groups, personProperties, groupProperties, onlyEvaluateLocally, localEvaluationResult, response, fallbackToDecide, remoteEvaluationResult;

      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _b = options || {}, groups = _b.groups, personProperties = _b.personProperties, groupProperties = _b.groupProperties;
            onlyEvaluateLocally = (options || {}).onlyEvaluateLocally; // set defaults

            if (onlyEvaluateLocally == undefined) {
              onlyEvaluateLocally = false;
            }

            return [4
            /*yield*/
            , (_a = this.featureFlagsPoller) === null || _a === void 0 ? void 0 : _a.getAllFlags(distinctId, groups, personProperties, groupProperties)];

          case 1:
            localEvaluationResult = _c.sent();
            response = {};
            fallbackToDecide = true;

            if (localEvaluationResult) {
              response = localEvaluationResult.response;
              fallbackToDecide = localEvaluationResult.fallbackToDecide;
            }

            if (!(fallbackToDecide && !onlyEvaluateLocally)) return [3
            /*break*/
            , 3];
            this.reInit(distinctId);

            if (groups) {
              this._sharedClient.groups(groups);
            }

            if (personProperties) {
              this._sharedClient.personProperties(personProperties);
            }

            if (groupProperties) {
              this._sharedClient.groupProperties(groupProperties);
            }

            return [4
            /*yield*/
            , this._sharedClient.reloadFeatureFlagsAsync(false)];

          case 2:
            _c.sent();

            remoteEvaluationResult = this._sharedClient.getFeatureFlags();
            return [2
            /*return*/
            , __assign(__assign({}, response), remoteEvaluationResult)];

          case 3:
            return [2
            /*return*/
            , response];
        }
      });
    });
  };

  AnalyticKitGlobal.prototype.groupIdentify = function (_a) {
    var groupType = _a.groupType,
        groupKey = _a.groupKey,
        properties = _a.properties;

    this._sharedClient.groupIdentify(groupType, groupKey, properties);
  };

  AnalyticKitGlobal.prototype.reloadFeatureFlags = function () {
    var _a;

    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4
            /*yield*/
            , (_a = this.featureFlagsPoller) === null || _a === void 0 ? void 0 : _a.loadFeatureFlags(true)];

          case 1:
            _b.sent();

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  AnalyticKitGlobal.prototype.flush = function () {
    this._sharedClient.flush();
  };

  AnalyticKitGlobal.prototype.shutdown = function () {
    void this.shutdownAsync();
  };

  AnalyticKitGlobal.prototype.shutdownAsync = function () {
    var _a;

    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_b) {
        (_a = this.featureFlagsPoller) === null || _a === void 0 ? void 0 : _a.stopPoller();
        return [2
        /*return*/
        , this._sharedClient.shutdownAsync()];
      });
    });
  };

  AnalyticKitGlobal.prototype.debug = function (enabled) {
    return this._sharedClient.debug(enabled);
  };

  return AnalyticKitGlobal;
}();

export { AnalyticKitGlobal, AnalyticKitGlobal as default };
//# sourceMappingURL=index.esm.js.map