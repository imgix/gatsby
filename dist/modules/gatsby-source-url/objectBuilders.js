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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildImgixFixed = exports.buildFluidObject = void 0;
var R = __importStar(require("ramda"));
var log_1 = require("../../common/log");
var createImgixFixedFieldConfig_1 = require("./createImgixFixedFieldConfig");
var parseAspectRatioFloatFromString = R.pipe(R.split(':'), R.head, function (v) { return parseInt(v); });
var DEFAULT_LQIP_PARAMS = { w: 20, blur: 15, q: 20 };
var buildFluidObject = function (_a) {
    var client = _a.client, url = _a.url, sourceWidth = _a.sourceWidth, sourceHeight = _a.sourceHeight, args = _a.args, defaultParams = _a.defaultParams, defaultPlaceholderParams = _a.defaultPlaceholderParams;
    var maxWidthAndHeightSet = args.maxHeight != null && args.maxWidth != null;
    var aspectRatio = (function () {
        if (args.imgixParams.ar != null) {
            return parseAspectRatioFloatFromString(args.imgixParams.ar);
        }
        if (args.maxHeight != null && args.maxWidth != null) {
            return args.maxWidth / args.maxHeight;
        }
        return sourceWidth / sourceHeight;
    })();
    var maxWidth = args.maxWidth;
    var imgixParams = __assign(__assign(__assign({ fit: 'crop' }, defaultParams), args.imgixParams), (maxWidthAndHeightSet && {
        ar: aspectRatio + ":1",
    }));
    // This base64 URL will be resolved by this resolver, and then be resolved again by the base64 resolver which is set on the field. See createImgixBase64FieldConfig
    var base64 = client.buildURL(url, __assign(__assign(__assign(__assign({}, DEFAULT_LQIP_PARAMS), defaultPlaceholderParams), args.imgixParams), args.placeholderImgixParams));
    var srcImgixParams = __assign(__assign({}, imgixParams), { w: maxWidth, h: args.maxHeight });
    var src = client.buildURL(url, srcImgixParams);
    var srcWebp = client.buildURL(url, __assign(__assign({}, srcImgixParams), { fm: 'webp' }));
    var srcsetOptions = {
        maxWidth: maxWidth,
        widths: args.srcSetBreakpoints,
    };
    var srcsetImgixParams = imgixParams;
    // We have to spread parameters because .buildSrcSet mutates params. GH issue: https://github.com/imgix/imgix-core-js/issues/158
    var srcset = client.buildSrcSet(url, __assign({}, srcsetImgixParams), srcsetOptions);
    var srcsetWebp = client.buildSrcSet(url, __assign(__assign({}, srcsetImgixParams), { fm: 'webp' }), srcsetOptions);
    return {
        base64: base64,
        aspectRatio: aspectRatio,
        src: src,
        srcWebp: srcWebp,
        srcSet: srcset,
        srcSetWebp: srcsetWebp,
        // TODO: use max-width here
        sizes: '(min-width: 8192px) 8192px, 100vw',
    };
};
exports.buildFluidObject = buildFluidObject;
function buildImgixFixed(_a) {
    var client = _a.client, url = _a.url, sourceWidth = _a.sourceWidth, sourceHeight = _a.sourceHeight, args = _a.args, defaultParams = _a.defaultParams, defaultPlaceholderParams = _a.defaultPlaceholderParams;
    var aspectRatio = (function () {
        if (args.imgixParams.ar != null) {
            return parseAspectRatioFloatFromString(args.imgixParams.ar);
        }
        if (args.height != null && args.width != null) {
            return args.width / args.height;
        }
        return sourceWidth / sourceHeight;
    })();
    log_1.log(args.width, args.height, aspectRatio, Math.round(args.width / aspectRatio));
    var _b = (function () {
        if (args.width != null && args.height != null) {
            return { width: args.width, height: args.height };
        }
        else if (args.width != null) {
            return {
                width: args.width,
                height: Math.round(args.width / aspectRatio),
            };
        }
        else if (args.height != null) {
            return {
                width: Math.round(args.height * aspectRatio),
                height: args.height,
            };
        }
        else {
            return {
                width: createImgixFixedFieldConfig_1.DEFAULT_FIXED_WIDTH,
                height: Math.round(createImgixFixedFieldConfig_1.DEFAULT_FIXED_WIDTH / aspectRatio),
            };
        }
    })(), width = _b.width, height = _b.height;
    var imgixParams = __assign(__assign(__assign({ fit: 'crop' }, defaultParams), args.imgixParams), { w: width, h: height });
    var base64 = client.buildURL(url, __assign(__assign(__assign(__assign({}, DEFAULT_LQIP_PARAMS), defaultPlaceholderParams), args.imgixParams), args.placeholderImgixParams));
    // We have to spread parameters because .buildURL and .buildSrcSet mutates params. GH issue: https://github.com/imgix/imgix-core-js/issues/158
    var src = client.buildURL(url, __assign({}, imgixParams));
    var srcWebp = client.buildURL(url, __assign(__assign({}, imgixParams), { fm: 'webp' }));
    var srcsetOptions = {
    // maxWidth,
    // widths: args.srcSetBreakpoints,
    };
    var srcsetImgixParams = imgixParams;
    var srcset = client.buildSrcSet(url, __assign({}, srcsetImgixParams), srcsetOptions);
    var srcsetWebp = client.buildSrcSet(url, __assign(__assign({}, srcsetImgixParams), { fm: 'webp' }), srcsetOptions);
    log_1.trace('buildFixedImage output')({
        base64: base64,
        width: width,
        height: height,
        src: src,
        srcWebp: srcWebp,
        srcSet: srcset,
        srcSetWebp: srcsetWebp,
    });
    return {
        base64: base64,
        width: width,
        height: height,
        src: src,
        srcWebp: srcWebp,
        srcSet: srcset,
        srcSetWebp: srcsetWebp,
    };
}
exports.buildImgixFixed = buildImgixFixed;
//# sourceMappingURL=objectBuilders.js.map