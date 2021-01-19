"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.buildFluidImageData = exports.buildFixedImageData = void 0;
var E = __importStar(require("fp-ts/lib/Either"));
var function_1 = require("fp-ts/lib/function");
var imgix_core_js_1 = __importDefault(require("imgix-core-js"));
var ar_1 = require("../../common/ar");
var constants_1 = require("../../common/constants");
var uri_1 = require("../../common/uri");
function buildImageData(url, imgixParams, options) {
    var _a, _b;
    var host = uri_1.parseHost(url);
    var path = uri_1.parsePath(url);
    var client = new imgix_core_js_1.default({
        domain: host,
        includeLibraryParam: false,
    });
    var includeLibraryParam = (_a = options.includeLibraryParam) !== null && _a !== void 0 ? _a : true;
    // This is not a public API, so it is not included in the type definitions for ImgixClient
    if (includeLibraryParam) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.settings.libraryParam = "gatsby-transform-url-" + constants_1.VERSION;
    }
    var transformedImgixParams = __assign(__assign({ fit: 'crop' }, imgixParams), { ar: imgixParams.ar != null ? imgixParams.ar + ":1" : undefined });
    // We have to spread parameters because imgix-core-js builders mutate params. GH issue: https://github.com/imgix/imgix-core-js/issues/158
    var src = client.buildURL(path, __assign({}, transformedImgixParams));
    var srcset = client.buildSrcSet(path, __assign({}, transformedImgixParams));
    var srcWebp = client.buildURL(path, __assign(__assign({}, transformedImgixParams), { fm: 'webp' }));
    var srcsetWebp = client.buildSrcSet(path, __assign(__assign({}, transformedImgixParams), { fm: 'webp' }));
    if (options.type === 'fluid') {
        return {
            sizes: (_b = options.sizes) !== null && _b !== void 0 ? _b : '100vw',
            src: src,
            srcSet: srcset,
            srcWebp: srcWebp,
            srcSetWebp: srcsetWebp,
            aspectRatio: imgixParams.ar,
        };
    }
    else if (options.type === 'fixed') {
        return {
            width: imgixParams.w,
            height: imgixParams.h,
            src: src,
            srcSet: srcset,
            srcWebp: srcWebp,
            srcSetWebp: srcsetWebp,
        };
    }
    var _neverReturn = options.type; // Fixes typescript error 'not all code paths return a value'
    return _neverReturn;
}
function buildFixedImageData(
/**
 * An imgix url to transform, e.g. https://yourdomain.imgix.net/your-image.jpg
 */
url, 
/**
 * A set of imgix parameters to apply to the image.
 * Parameters ending in 64 will be base64 encoded.
 * A full list of imgix parameters can be found here: https://docs.imgix.com/apis/url
 * Width (w) and height (h) are required.
 */
imgixParams, 
/**
 * Options that are not imgix parameters.
 * Optional.
 */
options) {
    if (options === void 0) { options = {}; }
    return buildImageData(url, __assign({ fit: 'crop' }, imgixParams), __assign(__assign({}, options), { type: 'fixed' }));
}
exports.buildFixedImageData = buildFixedImageData;
function buildFluidImageData(
/**
 * An imgix url to transform, e.g. https://yourdomain.imgix.net/your-image.jpg
 */
url, 
/**
 * A set of imgix parameters to apply to the image.
 * Parameters ending in 64 will be base64 encoded.
 * A full list of imgix parameters can be found here: https://docs.imgix.com/apis/url
 * The aspect ratio (ar) as a float is required.
 */
imgixParams, 
/**
 * Options that are not imgix parameters.
 * Optional.
 */
options) {
    if (options === void 0) { options = {}; }
    var aspectRatioFloat = (function () {
        var throwError = function () {
            throw new Error('An invalid string ar parameter was provided. Either provide an aspect ratio as a number, or as a string in the format w:h, e.g. 1.61:1.');
        };
        if (typeof imgixParams.ar === 'number' && isNaN(imgixParams.ar)) {
            throwError();
        }
        if (typeof imgixParams.ar === 'number') {
            return imgixParams.ar;
        }
        return function_1.pipe(ar_1.StringAspectRatio.decode(imgixParams.ar), E.map(ar_1.parseStringARParam), E.getOrElse(throwError));
    })();
    return buildImageData(url, __assign(__assign({}, imgixParams), { ar: aspectRatioFloat }), __assign(__assign({}, options), { type: 'fluid' }));
}
exports.buildFluidImageData = buildFluidImageData;
//# sourceMappingURL=index.js.map