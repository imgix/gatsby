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
exports.ImgixGatsbyOptionsIOTS = exports.ImgixGatsbyFieldsIOTS = exports.ImgixGatsbyFieldSingleUrlIOTS = exports.ImgixGatsbyFieldMultipleUrlsIOTS = exports.ImgixSourceType = void 0;
var parameters_json_1 = __importDefault(require("imgix-url-params/dist/parameters.json"));
var R = __importStar(require("ramda"));
var t = __importStar(require("./common/ioTs"));
var ImgixSourceType;
(function (ImgixSourceType) {
    ImgixSourceType["AmazonS3"] = "s3";
    ImgixSourceType["GoogleCloudStorage"] = "gcs";
    ImgixSourceType["MicrosoftAzure"] = "azure";
    ImgixSourceType["WebFolder"] = "webFolder";
    ImgixSourceType["WebProxy"] = "webProxy";
})(ImgixSourceType = exports.ImgixSourceType || (exports.ImgixSourceType = {}));
var ImgixParamValueIOTS = t.union([
    t.string,
    t.number,
    t.boolean,
    t.undefined,
    t.null,
    t.array(t.string),
    t.array(t.number),
    t.array(t.boolean),
], 'ImgixParamValue');
var mapToImgixParamValue = function (obj) {
    return R.mapObjIndexed(function () { return ImgixParamValueIOTS; }, obj);
};
var ImgixParamsIOTS = t.partial(__assign(__assign({}, mapToImgixParamValue(parameters_json_1.default.aliases)), mapToImgixParamValue(parameters_json_1.default.parameters)), 'ImgixParams');
var ImgixGatsbyFieldBaseIOTS = t.type({
    nodeType: t.string,
    fieldName: t.string,
});
exports.ImgixGatsbyFieldMultipleUrlsIOTS = t.intersection([
    ImgixGatsbyFieldBaseIOTS,
    t.type({
        getURLs: t.Function,
    }),
]);
exports.ImgixGatsbyFieldSingleUrlIOTS = t.intersection([
    ImgixGatsbyFieldBaseIOTS,
    t.type({
        getURL: t.Function,
    }),
]);
exports.ImgixGatsbyFieldsIOTS = t.array(t.union([exports.ImgixGatsbyFieldSingleUrlIOTS, exports.ImgixGatsbyFieldMultipleUrlsIOTS]));
exports.ImgixGatsbyOptionsIOTS = t.typeOptional({
    domain: t.string,
    defaultImgixParams: t.optional(ImgixParamsIOTS),
    disableIxlibParam: t.optional(t.boolean),
    secureURLToken: t.optional(t.string),
    sourceType: t.optional(t.fromEnum('GatsbySourceUrlSourceType', ImgixSourceType)),
    fields: t.optional(exports.ImgixGatsbyFieldsIOTS),
}, 'GatsbySourceUrlOptions');
//# sourceMappingURL=publicTypes.js.map