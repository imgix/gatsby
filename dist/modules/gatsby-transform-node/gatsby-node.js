"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchemaCustomization = exports.onCreateNode = void 0;
var imgix_core_js_1 = __importDefault(require("imgix-core-js"));
var __1 = require("../..");
var utils_1 = require("../../common/utils");
var createImgixFixedFieldConfig_1 = require("../gatsby-source-url/createImgixFixedFieldConfig");
var createImgixFluidFieldConfig_1 = require("../gatsby-source-url/createImgixFluidFieldConfig");
var createImgixUrlFieldConfig_1 = require("../gatsby-source-url/createImgixUrlFieldConfig");
var graphqlTypes_1 = require("../gatsby-source-url/graphqlTypes");
exports.onCreateNode = function (gatsbyContext, pluginOptions) { return __awaiter(void 0, void 0, void 0, function () {
    var node, actions, reporter, createNodeField, domain, secureURLToken, sourceType, _a, fields, fieldOptions, _i, fieldOptions_1, field;
    return __generator(this, function (_b) {
        node = gatsbyContext.node, actions = gatsbyContext.actions, reporter = gatsbyContext.reporter;
        createNodeField = actions.createNodeField;
        domain = pluginOptions.domain, secureURLToken = pluginOptions.secureURLToken, sourceType = pluginOptions.sourceType, _a = pluginOptions.fields, fields = _a === void 0 ? [] : _a;
        utils_1.invariant(Array.isArray(fields), 'fields must be an array of field options', reporter);
        fieldOptions = fields.filter(function (fieldOptions) { return fieldOptions.nodeType === node.internal.type; });
        if (fieldOptions.length < 1)
            return [2 /*return*/];
        for (_i = 0, fieldOptions_1 = fieldOptions; _i < fieldOptions_1.length; _i++) {
            field = fieldOptions_1[_i];
            if (sourceType === __1.ImgixSourceType.WebProxy) {
                utils_1.invariant(domain !== undefined, 'an Imgix domain must be provided if sourceType is webProxy', reporter);
                utils_1.invariant(secureURLToken !== undefined, 'a secure URL token must be provided if sourceType is webProxy', reporter);
                // TODO: remove
                createNodeField({ node: node, name: field.fieldName, value: 'test' });
            }
        }
        return [2 /*return*/];
    });
}); };
var getFieldValue = function (_a) {
    var fieldOptions = _a.fieldOptions, node = _a.node, domain = _a.domain, reporter = _a.reporter;
    var fieldValue = undefined;
    if (fieldOptions.hasOwnProperty('getURL')) {
        fieldValue = fieldOptions.getURL(node);
        utils_1.invariant(fieldValue == null || typeof fieldValue === 'string', 'getURL must return a URL string', reporter);
    }
    else if (fieldOptions.hasOwnProperty('getURLs')) {
        fieldValue = fieldOptions.getURLs(node);
        utils_1.invariant(Array.isArray(fieldValue), 'getURLs must return an array of URLs', reporter);
    }
    if (!fieldValue)
        throw new Error('No field value');
    return fieldValue;
    // if (Array.isArray(fieldValue))
    //   return fieldValue.map((url) => transformUrlForWebProxy(url, domain));
    // else {
    //   return transformUrlForWebProxy(fieldValue, domain);
    // }
};
exports.createSchemaCustomization = function (gatsbyContext, pluginOptions) { return __awaiter(void 0, void 0, void 0, function () {
    var actions, cache, schema, reporter, createTypes, domain, secureURLToken, sourceType, 
    // namespace,
    defaultImgixParams, _a, 
    // defaultPlaceholderImgixParams,
    fields, imgixClient, ImgixFixedType, ImgixFluidType, ImgixImageCustomType, fieldTypes;
    return __generator(this, function (_b) {
        actions = gatsbyContext.actions, cache = gatsbyContext.cache, schema = gatsbyContext.schema, reporter = gatsbyContext.reporter;
        createTypes = actions.createTypes;
        domain = pluginOptions.domain, secureURLToken = pluginOptions.secureURLToken, sourceType = pluginOptions.sourceType, defaultImgixParams = pluginOptions.defaultImgixParams, _a = pluginOptions.fields, fields = _a === void 0 ? [] : _a;
        utils_1.invariant(Array.isArray(fields), 'fields must be an array of field options', reporter);
        utils_1.invariant(sourceType !== __1.ImgixSourceType.WebProxy || Boolean(secureURLToken), 'a secure URL token must be provided if sourceType is webProxy', reporter);
        imgixClient = new imgix_core_js_1.default({
            domain: domain,
            secureURLToken: secureURLToken,
        });
        ImgixFixedType = graphqlTypes_1.createImgixFixedType({
            name: 'ImgixNodeFixed',
            cache: cache,
        });
        ImgixFluidType = graphqlTypes_1.createImgixFluidType({
            name: 'ImgixNodeFluid',
            cache: cache,
        });
        ImgixImageCustomType = schema.buildObjectType({
            name: 'ImgixNodeRoot',
            fields: {
                url: createImgixUrlFieldConfig_1.createImgixUrlSchemaFieldConfig({
                    resolveUrl: function (url) { return url; },
                    imgixClient: imgixClient,
                    defaultParams: defaultImgixParams,
                }),
                fluid: createImgixFluidFieldConfig_1.createImgixFluidSchemaFieldConfig({
                    type: ImgixFluidType,
                    cache: cache,
                    imgixClient: imgixClient,
                    resolveUrl: function (url) { return url; },
                }),
                fixed: createImgixFixedFieldConfig_1.createImgixFixedSchemaFieldConfig({
                    type: ImgixFixedType,
                    cache: cache,
                    imgixClient: imgixClient,
                    resolveUrl: function (url) { return url; },
                }),
            },
        });
        fieldTypes = fields.map(function (fieldOptions) {
            var _a;
            return schema.buildObjectType({
                name: "" + fieldOptions.nodeType,
                fields: (_a = {},
                    _a[fieldOptions.fieldName] = {
                        type: 'getURLs' in fieldOptions
                            ? "[" + ImgixImageCustomType.config.name + "]"
                            : ImgixImageCustomType.config.name,
                        resolve: function (node) {
                            return getFieldValue({
                                fieldOptions: fieldOptions,
                                node: node,
                                domain: domain,
                                reporter: reporter,
                            });
                        },
                    },
                    _a),
            });
        });
        createTypes([ImgixFixedType, ImgixFluidType]);
        createTypes(__spreadArrays([ImgixImageCustomType], fieldTypes));
        return [2 /*return*/];
    });
}); };
//# sourceMappingURL=gatsby-node.js.map