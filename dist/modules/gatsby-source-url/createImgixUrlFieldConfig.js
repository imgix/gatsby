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
exports.createImgixUrlSchemaFieldConfig = exports.createImgixUrlFieldConfig = void 0;
var pipeable_1 = require("fp-ts/lib/pipeable");
var T = __importStar(require("fp-ts/lib/Task"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var R = __importStar(require("ramda"));
var utils_1 = require("../../common/utils");
var graphqlTypes_1 = require("./graphqlTypes");
var createImgixUrlFieldConfig = function (_a) {
    var imgixClient = _a.imgixClient, resolveUrl = _a.resolveUrl, defaultParams = _a.defaultParams;
    return ({
        type: graphqlTypes_1.gatsbySourceImgixUrlFieldType,
        description: 'A plain imgix URL with the URL and params applied.',
        args: {
            imgixParams: {
                type: graphqlTypes_1.ImgixUrlParamsInputType,
                defaultValue: {},
            },
        },
        resolve: function (rootValue, args) {
            return pipeable_1.pipe(rootValue, utils_1.resolveUrlFromSourceData(resolveUrl), TE.map(function (url) {
                var _a;
                return imgixClient.buildURL(url, R.mergeRight(defaultParams !== null && defaultParams !== void 0 ? defaultParams : {}, (_a = args.imgixParams) !== null && _a !== void 0 ? _a : {}));
            }), TE.getOrElse(function () { return T.of(undefined); }))();
        },
    });
};
exports.createImgixUrlFieldConfig = createImgixUrlFieldConfig;
var createImgixUrlSchemaFieldConfig = function (args) {
    return exports.createImgixUrlFieldConfig(args);
};
exports.createImgixUrlSchemaFieldConfig = createImgixUrlSchemaFieldConfig;
//# sourceMappingURL=createImgixUrlFieldConfig.js.map