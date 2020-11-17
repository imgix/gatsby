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
exports.createRootImgixImageType = void 0;
var graphql_1 = require("graphql");
var R = __importStar(require("ramda"));
var createImgixFixedFieldConfig_1 = require("./createImgixFixedFieldConfig");
var createImgixFluidFieldConfig_1 = require("./createImgixFluidFieldConfig");
var createImgixUrlFieldConfig_1 = require("./createImgixUrlFieldConfig");
exports.createRootImgixImageType = function (imgixClient, cache, defaultParams) { return ({
    args: {
        url: {
            type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
            description: 'The path of the image to render. If using a Web Proxy Source, this must be a fully-qualified URL.',
        },
    },
    type: new graphql_1.GraphQLObjectType({
        name: 'ImgixSourceImage',
        fields: {
            url: createImgixUrlFieldConfig_1.createImgixUrlFieldConfig({
                imgixClient: imgixClient,
                resolveUrl: R.prop('rawUrl'),
                defaultParams: defaultParams,
            }),
            fluid: createImgixFluidFieldConfig_1.createImgixFluidFieldConfig({
                imgixClient: imgixClient,
                resolveUrl: R.prop('rawUrl'),
                cache: cache,
                defaultParams: defaultParams,
            }),
            fixed: createImgixFixedFieldConfig_1.createImgixFixedFieldConfig({
                imgixClient: imgixClient,
                resolveUrl: R.prop('rawUrl'),
                cache: cache,
                defaultParams: defaultParams,
            }),
        },
    }),
    resolve: function (_, args) {
        return { rawUrl: args.url };
    },
}); };
//# sourceMappingURL=createRootImgixImageType.js.map