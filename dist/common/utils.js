"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformUrlForWebProxy = exports.invariant = exports.fetchJSON = exports.fetch = exports.noop = exports.semigroupImgixUrlParams = exports.resolveUrlFromSourceData = exports.taskEitherFromSourceDataResolver = void 0;
var pipeable_1 = require("fp-ts/lib/pipeable");
var Semigroup_1 = require("fp-ts/lib/Semigroup");
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var taskEitherFromSourceDataResolver = function (resolver, predicate) { return function (source) {
    return TE.tryCatch(function () {
        return Promise.resolve(resolver(source)).then(function (data) {
            if (data == null)
                return Promise.reject('Resolved data is null or undefined');
            if (!predicate)
                return data;
            return predicate(data)
                ? data
                : Promise.reject('Resolved data is invalid.');
        });
    }, function (reason) { return new Error(String(reason)); });
}; };
exports.taskEitherFromSourceDataResolver = taskEitherFromSourceDataResolver;
// TODO: maybe better url type here?
var resolveUrlFromSourceData = function (resolver) { return exports.taskEitherFromSourceDataResolver(resolver, function (data) { return data != null; }); };
exports.resolveUrlFromSourceData = resolveUrlFromSourceData;
exports.semigroupImgixUrlParams = Semigroup_1.getObjectSemigroup();
var noop = function () {
    // noop
};
exports.noop = noop;
var fetch = function (url) {
    return TE.tryCatch(function () { return node_fetch_1.default(url); }, function (reason) { return new Error(String(reason)); });
};
exports.fetch = fetch;
// export const taskOptionFromPromise = <T>(p: Promise<T>): Task<Option<T>> =>
var fetchJSON = function (url) {
    return pipeable_1.pipe(url, exports.fetch, TE.chain(function (res) { return TE.rightTask(function () { return res.json(); }); }));
};
exports.fetchJSON = fetchJSON;
function invariant(condition, msg, reporter) {
    if (!condition)
        reporter.panic("Invariant failed: " + msg);
}
exports.invariant = invariant;
var transformUrlForWebProxy = function (url, domain) {
    var instance = new URL("https://" + domain);
    instance.pathname = encodeURIComponent(url);
    return instance.toString();
};
exports.transformUrlForWebProxy = transformUrlForWebProxy;
//# sourceMappingURL=utils.js.map