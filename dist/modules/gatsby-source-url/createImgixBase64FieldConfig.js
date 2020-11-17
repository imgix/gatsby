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
exports.createImgixBase64FieldConfig = void 0;
var pipeable_1 = require("fp-ts/lib/pipeable");
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var graphql_1 = require("graphql");
var fetchBase64Image_1 = require("../../api/fetchBase64Image");
var utils_1 = require("../../common/utils");
function createImgixBase64FieldConfig(_a) {
    var resolveUrl = _a.resolveUrl, cache = _a.cache;
    return {
        type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        resolve: function (obj) {
            return pipeable_1.pipe(obj, utils_1.taskEitherFromSourceDataResolver(resolveUrl), TE.chain(fetchBase64Image_1.fetchImgixBase64Image(cache)), TE.getOrElse(function (e) {
                throw e;
            }))();
        },
    };
}
exports.createImgixBase64FieldConfig = createImgixBase64FieldConfig;
//# sourceMappingURL=createImgixBase64FieldConfig.js.map