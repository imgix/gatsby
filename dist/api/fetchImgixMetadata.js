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
exports.fetchImgixMetadata = exports.ImgixMetadata = void 0;
var E = __importStar(require("fp-ts/lib/Either"));
var function_1 = require("fp-ts/lib/function");
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var t = __importStar(require("io-ts"));
var log_1 = require("../common/log");
var cache_1 = require("../common/cache");
var utils_1 = require("../common/utils");
var log = log_1.createLogger('fetchImgixMetadata');
exports.ImgixMetadata = t.type({
    'Content-Type': t.string,
    PixelWidth: t.number,
    PixelHeight: t.number,
});
exports.fetchImgixMetadata = function (cache, client) { return function (url) {
    return cache_1.withCache("gatsby-plugin-imgix-metadata-" + url, cache, function () {
        return function_1.pipe(client.buildURL(url, { fm: 'json' }), log_1.trace('imgix metadata url', log), utils_1.fetchJSON, TE.map(log_1.trace('imgix metadata result', log)), TE.chain(function_1.flow(exports.ImgixMetadata.decode, E.orElse(function () {
            return E.left(new Error('Problem when decoding imgix metadata.'));
        }), TE.fromEither)), TE.map(log_1.trace('decoded data', log)), TE.mapLeft(log_1.trace('imgix metadata error', log)));
    });
}; };
//# sourceMappingURL=fetchImgixMetadata.js.map