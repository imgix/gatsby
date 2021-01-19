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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchImgixBase64Image = exports.buildBase64URL = void 0;
var function_1 = require("fp-ts/lib/function");
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var cache_1 = require("../common/cache");
var utils_1 = require("../common/utils");
var buildBase64URL = function (contentType, base64) {
    return "data:" + contentType + ";base64," + base64;
};
exports.buildBase64URL = buildBase64URL;
var fetchImgixBase64Image = function (cache) { return function (url) {
    return cache_1.withCache("gatsby-plugin-imgix-base64-url-" + url, cache, function () {
        return function_1.pipe(url, utils_1.fetch, TE.chain(function (res) {
            return function_1.pipe(TE.rightTask(function () { return res.buffer(); }), TE.chain(function (buffer) { return TE.right(buffer.toString('base64')); }), TE.chain(function (base64) {
                return TE.right(exports.buildBase64URL(String(res.headers.get('content-type')), base64));
            }));
        }));
    });
}; };
exports.fetchImgixBase64Image = fetchImgixBase64Image;
//# sourceMappingURL=fetchBase64Image.js.map