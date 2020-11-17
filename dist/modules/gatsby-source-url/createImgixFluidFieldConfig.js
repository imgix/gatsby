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
exports.createImgixFluidSchemaFieldConfig = exports.createImgixFluidFieldConfig = void 0;
var Do_1 = require("fp-ts-contrib/lib/Do");
var function_1 = require("fp-ts/lib/function");
var T = __importStar(require("fp-ts/lib/Task"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var graphql_1 = require("graphql");
var fpTsUtils_1 = require("../../common/fpTsUtils");
var graphqlTypes_1 = require("./graphqlTypes");
var objectBuilders_1 = require("./objectBuilders");
var resolveDimensions_1 = require("./resolveDimensions");
var utils_1 = require("../../common/utils");
var DEFAULT_FLUID_MAX_WIDTH = 8192;
exports.createImgixFluidFieldConfig = function (_a) {
    var imgixClient = _a.imgixClient, resolveUrl = _a.resolveUrl, _b = _a.resolveWidth, resolveWidth = _b === void 0 ? function () { return undefined; } : _b, _c = _a.resolveHeight, resolveHeight = _c === void 0 ? function () { return undefined; } : _c, cache = _a.cache, defaultParams = _a.defaultParams;
    return ({
        type: graphqlTypes_1.createGatsbySourceImgixFluidFieldType(cache),
        description: "Should be used to generate fluid-width images (i.e. images that change when the size of the browser changes). Returns data compatible with gatsby-image. Instead of accessing this data directly, the GatsbySourceImgixFluid fragment should be used. See the project's README for more information.",
        args: {
            imgixParams: {
                type: graphqlTypes_1.ImgixUrlParamsInputType,
                description: "The imgix parameters (transformations) to apply to the image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url",
                defaultValue: {},
            },
            maxWidth: {
                type: graphql_1.GraphQLInt,
                description: "The maximum px width of the *image* to be *requested*. This does NOT affect the width of the image displayed.",
                defaultValue: DEFAULT_FLUID_MAX_WIDTH,
            },
            maxHeight: {
                description: "The maximum px height of the *image* to be *requested*. This does NOT affect the height of the image displayed.",
                type: graphql_1.GraphQLInt,
            },
            srcSetBreakpoints: {
                type: new graphql_1.GraphQLList(graphql_1.GraphQLInt),
                description: "A custom set of widths (in px) to use for the srcset widths. This feature is not recommended as the default widths are optimized for imgix's caching infrastructure.",
            },
            placeholderImgixParams: {
                type: graphqlTypes_1.ImgixUrlParamsInputType,
                description: "Any imgix parameters to use only for the blur-up/placeholder image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url",
                defaultValue: {},
            },
        },
        resolve: function (rootValue, args) {
            return function_1.pipe(Do_1.Do(TE.taskEither)
                .let('rootValue', rootValue)
                .sequenceSL(function (_a) {
                var rootValue = _a.rootValue;
                return ({
                    url: utils_1.resolveUrlFromSourceData(resolveUrl)(rootValue),
                    manualWidth: function_1.pipe(utils_1.taskEitherFromSourceDataResolver(resolveWidth)(rootValue), fpTsUtils_1.TaskOptionFromTE, TE.fromTask),
                    manualHeight: function_1.pipe(utils_1.taskEitherFromSourceDataResolver(resolveHeight)(rootValue), fpTsUtils_1.TaskOptionFromTE, TE.fromTask),
                });
            })
                .bindL('dimensions', function (_a) {
                var url = _a.url, manualWidth = _a.manualWidth, manualHeight = _a.manualHeight;
                return resolveDimensions_1.resolveDimensions({
                    url: url,
                    manualHeight: manualHeight,
                    manualWidth: manualWidth,
                    cache: cache,
                    client: imgixClient,
                });
            })
                .return(function (_a) {
                var url = _a.url, _b = _a.dimensions, width = _b.width, height = _b.height;
                return objectBuilders_1.buildFluidObject({
                    client: imgixClient,
                    args: args,
                    sourceHeight: height,
                    sourceWidth: width,
                    url: url,
                    defaultParams: defaultParams,
                    defaultPlaceholderParams: {},
                });
            }), TE.getOrElseW(function () { return T.of(undefined); }))();
        },
    });
};
exports.createImgixFluidSchemaFieldConfig = function (args) {
    return exports.createImgixFluidFieldConfig(args);
};
//# sourceMappingURL=createImgixFluidFieldConfig.js.map