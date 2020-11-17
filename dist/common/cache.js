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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setToCache = exports.getFromCache = exports.withCache = void 0;
var pipeable_1 = require("fp-ts/lib/pipeable");
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var log_1 = require("./log");
var log = log_1.createLogger('cache');
exports.withCache = function (key, cache, f) {
    return pipeable_1.pipe(log_1.trace("Trying to retrieve " + key + " from cache", log)(''), function () { return exports.getFromCache(cache, key); }, TE.map(log_1.trace("Successfully retrieved " + key + " from cache with value", log)), 
    // If no cache hit, run function and store result in cache
    TE.orElse(function () {
        return pipeable_1.pipe(f(), TE.map(log_1.trace("Couldn't retrieve " + key + " from cache, replacing with value", log)), TE.chainW(exports.setToCache(key, cache)));
    }), TE.mapLeft(log_1.trace('Error in withCache', log)));
};
exports.getFromCache = function (cache, key) {
    return TE.tryCatch(function () {
        return cache.get(key).then(function (v) {
            log_1.trace("Retrieved value from cache for " + key, log)(v);
            if (v == null) {
                log("Key " + key + " doesn't exist in the cache");
                throw new Error("Key " + key + " doesn't exist in the cache");
            }
            return v;
        });
    }, function () { return new Error("Failed to get \"" + key + "\" in cache."); });
};
exports.setToCache = function (key, cache) { return function (value) {
    return pipeable_1.pipe(TE.tryCatch(function () {
        log_1.trace("Setting \"" + key + "\" in cache to", log)(value);
        return cache.set(key, value).then(function () { return value; });
    }, function () { return new Error("Failed to set \"" + key + "\" in cache to value: " + value); }), TE.map(log_1.trace("Cached value", log)), TE.mapLeft(log_1.trace("Failed to set \"" + key + "\" in cache to", log)));
}; };
//# sourceMappingURL=cache.js.map