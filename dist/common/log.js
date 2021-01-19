"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trace = exports.createLogger = exports.log = void 0;
var debug_1 = __importDefault(require("debug"));
var ns = 'imgix:gatsby-source-url';
exports.log = debug_1.default(ns);
var createLogger = function (module) { return debug_1.default(ns + ":" + module); };
exports.createLogger = createLogger;
var trace = function (label, customLogger) { return function (v) {
    (customLogger !== null && customLogger !== void 0 ? customLogger : exports.log)("" + (label ? label + ": " : '') + JSON.stringify(v, null, 2));
    return v;
}; };
exports.trace = trace;
//# sourceMappingURL=log.js.map