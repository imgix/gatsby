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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatsbySourceImgixUrlFieldType = exports.createImgixFixedType = exports.getImgixFluidType = exports.createImgixFluidType = exports.ImgixUrlParamsInputType = void 0;
var camel_case_1 = require("camel-case");
var graphql_1 = require("graphql");
var parameters_json_1 = __importDefault(require("imgix-url-params/dist/parameters.json"));
var createImgixBase64FieldConfig_1 = require("./createImgixBase64FieldConfig");
exports.ImgixUrlParamsInputType = new graphql_1.GraphQLInputObjectType({
    name: 'ImgixParamsInput',
    fields: Object.keys(parameters_json_1.default.parameters).reduce(function (fields, param) {
        var spec = parameters_json_1.default.parameters[param];
        // The param name is camel-cased here to appease the GraphQL field
        // requirements. This will need to be reversed with param-case when the
        // URL is constructed in `buildImgixUrl`.
        var name = camel_case_1.camelCase(param);
        var expects = spec.expects;
        var expectsTypes = Array.from(new Set(expects.map(function (expect) { return expect.type; })));
        // TODO: Clean up this mess.
        var type = expectsTypes.every(function (type) { return type === 'integer' || type === 'unit_scalar'; })
            ? graphql_1.GraphQLInt
            : expectsTypes.every(function (type) {
                return type === 'integer' || type === 'unit_scalar' || type === 'number';
            })
                ? graphql_1.GraphQLFloat
                : expectsTypes.every(function (type) { return type === 'boolean'; })
                    ? graphql_1.GraphQLBoolean
                    : graphql_1.GraphQLString;
        fields[name] = {
            type: type,
            description: spec.short_description +
                // Ensure the description ends with a period.
                (spec.short_description.slice(-1) === '.' ? '' : '.'),
        };
        // Add the default value as part of the description. Setting it as a
        // GraphQL default value will automatically assign it in the final URL.
        // Doing so would result in a huge number of unwanted params.
        if ('default' in spec)
            fields[name].description =
                fields[name].description + (" Default: `" + spec.default + "`.");
        // Add Imgix documentation URL as part of the description.
        if ('url' in spec)
            fields[name].description =
                fields[name].description + (" [See docs](" + spec.url + ").");
        // Create aliased fields.
        if ('aliases' in spec)
            for (var _i = 0, _a = spec.aliases; _i < _a.length; _i++) {
                var alias = _a[_i];
                fields[camel_case_1.camelCase(alias)] = __assign(__assign({}, fields[name]), { description: "Alias for `" + name + "`." });
            }
        return fields;
    }, {}),
});
var createBase64ConfigWithResolver = function (cache) {
    return createImgixBase64FieldConfig_1.createImgixBase64FieldConfig({
        resolveUrl: function (obj) { return obj.base64; },
        cache: cache,
    });
};
var createImgixFluidType = function (_a) {
    var cache = _a.cache, name = _a.name;
    return new graphql_1.GraphQLObjectType({
        name: name !== null && name !== void 0 ? name : 'ImgixFluid',
        fields: {
            base64: createBase64ConfigWithResolver(cache),
            src: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            srcSet: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            srcWebp: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            srcSetWebp: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            sizes: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            aspectRatio: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLFloat) },
        },
    });
};
exports.createImgixFluidType = createImgixFluidType;
var fluidType;
var getImgixFluidType = function (args) {
    if (!fluidType) {
        fluidType = exports.createImgixFluidType.apply(void 0, args);
    }
    return fluidType;
};
exports.getImgixFluidType = getImgixFluidType;
var createImgixFixedType = function (_a) {
    var name = _a.name, cache = _a.cache;
    return new graphql_1.GraphQLObjectType({
        name: name !== null && name !== void 0 ? name : 'ImgixFixed',
        fields: {
            base64: createBase64ConfigWithResolver(cache),
            src: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            srcSet: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            srcWebp: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            srcSetWebp: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            sizes: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            width: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
            height: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        },
    });
};
exports.createImgixFixedType = createImgixFixedType;
exports.gatsbySourceImgixUrlFieldType = graphql_1.GraphQLString;
//# sourceMappingURL=graphqlTypes.js.map