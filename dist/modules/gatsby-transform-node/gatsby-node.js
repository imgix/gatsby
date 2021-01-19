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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchemaCustomization = void 0;
var Do_1 = require("fp-ts-contrib/lib/Do");
var E = __importStar(require("fp-ts/lib/Either"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var graphql_1 = require("graphql");
var PathReporter_1 = require("io-ts/PathReporter");
var R = __importStar(require("ramda"));
var read_pkg_up_1 = __importDefault(require("read-pkg-up"));
var __1 = require("../..");
var imgix_core_js_wrapper_1 = require("../../common/imgix-core-js-wrapper");
var publicTypes_1 = require("../../publicTypes");
var createImgixFixedFieldConfig_1 = require("../gatsby-source-url/createImgixFixedFieldConfig");
var createImgixFluidFieldConfig_1 = require("../gatsby-source-url/createImgixFluidFieldConfig");
var createImgixUrlFieldConfig_1 = require("../gatsby-source-url/createImgixUrlFieldConfig");
var graphqlTypes_1 = require("../gatsby-source-url/graphqlTypes");
function isStringArray(value) {
    return (Array.isArray(value) &&
        value.every(function (element) { return typeof element === 'string'; }));
}
var getFieldValue = function (_a) {
    var fieldOptions = _a.fieldOptions, node = _a.node;
    return (function () {
        if ('getURL' in fieldOptions) {
            return pipeable_1.pipe(fieldOptions.getURL(node), function (value) {
                return value == null || typeof value !== 'string'
                    ? E.left(new Error('getURL must return a URL string'))
                    : E.right(value);
            });
        }
        else if ('getURLs' in fieldOptions) {
            return pipeable_1.pipe(fieldOptions.getURLs(node), function (value) {
                return !isStringArray(value)
                    ? E.left(new Error('getURL must return a URL string'))
                    : E.right(value);
            });
        }
        var _neverReturn = fieldOptions; // Fixes typescript error 'not all code paths return a value'
        return _neverReturn;
    })();
};
var decodeOptionsE = function (options) {
    return pipeable_1.pipe(options, publicTypes_1.ImgixGatsbyOptionsIOTS.decode, E.mapLeft(function (errs) {
        return new Error("The plugin config is not in the correct format. Errors: " + PathReporter_1.PathReporter.report(E.left(errs)));
    }), E.chain(function (options) {
        if (options.sourceType === 'webProxy' &&
            (options.secureURLToken == null || options.secureURLToken.trim() === '')) {
            return E.left(new Error("The plugin option 'secureURLToken' is required when sourceType is 'webProxy'."));
        }
        if (options.fields != null && !Array.isArray(options.fields)) {
            return E.left(new Error('Fields must be an array of field options'));
        }
        if (options.sourceType === __1.ImgixSourceType.WebProxy &&
            (options.secureURLToken == null || options.secureURLToken.trim() === '')) {
            return E.left(new Error('A secure URL token must be provided if sourceType is webProxy'));
        }
        return E.right(options);
    }));
};
var getPackageVersionE = function () {
    var _a, _b;
    return pipeable_1.pipe((_b = (_a = read_pkg_up_1.default.sync({ cwd: __dirname })) === null || _a === void 0 ? void 0 : _a.packageJson) === null || _b === void 0 ? void 0 : _b.version, E.fromNullable(new Error('Could not read package version.')));
};
var setupImgixClientE = function (_a) {
    var options = _a.options, packageVersion = _a.packageVersion;
    return Do_1.Do(E.either)
        .bind('imgixClient', imgix_core_js_wrapper_1.createImgixClient({
        domain: options.domain,
        secureURLToken: options.secureURLToken,
    }))
        .doL(function (_a) {
        var imgixClient = _a.imgixClient;
        imgixClient.includeLibraryParam = false;
        if (options.disableIxlibParam !== true) {
            imgixClient.settings.libraryParam = "gatsby-source-url-" + packageVersion;
        }
        return E.right(imgixClient);
    })
        .return(R.prop('imgixClient'));
};
var createSchemaCustomization = function (gatsbyContext, _options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, pipeable_1.pipe(Do_1.Do(E.either)
                .bind('options', decodeOptionsE(_options))
                .bind('packageVersion', getPackageVersionE())
                .bindL('imgixClient', function (_a) {
                var options = _a.options, packageVersion = _a.packageVersion;
                return setupImgixClientE({ options: options, packageVersion: packageVersion });
            })
                .let('imgixFixedType', graphqlTypes_1.createImgixFixedType({
                name: 'ImgixFixed',
                cache: gatsbyContext.cache,
            }))
                .let('imgixFluidType', graphqlTypes_1.createImgixFluidType({
                name: 'ImgixFluid',
                cache: gatsbyContext.cache,
            }))
                .letL('imgixImageType', function (_a) {
                var imgixFluidType = _a.imgixFluidType, imgixFixedType = _a.imgixFixedType, imgixClient = _a.imgixClient, defaultImgixParams = _a.options.defaultImgixParams;
                return new graphql_1.GraphQLObjectType({
                    name: 'ImgixImage',
                    fields: {
                        url: createImgixUrlFieldConfig_1.createImgixUrlFieldConfig({
                            resolveUrl: R.prop('rawURL'),
                            imgixClient: imgixClient,
                            defaultParams: defaultImgixParams,
                        }),
                        fluid: createImgixFluidFieldConfig_1.createImgixFluidFieldConfig({
                            type: imgixFluidType,
                            cache: gatsbyContext.cache,
                            imgixClient: imgixClient,
                            resolveUrl: R.prop('rawURL'),
                            defaultParams: defaultImgixParams,
                        }),
                        fixed: createImgixFixedFieldConfig_1.createImgixFixedFieldConfig({
                            type: imgixFixedType,
                            cache: gatsbyContext.cache,
                            imgixClient: imgixClient,
                            resolveUrl: R.prop('rawURL'),
                            defaultParams: defaultImgixParams,
                        }),
                    },
                });
            })
                .letL('fieldTypes', function (_a) {
                var imgixImageType = _a.imgixImageType, _b = _a.options, domain = _b.domain, _c = _b.fields, fields = _c === void 0 ? [] : _c;
                return fields.map(function (fieldOptions) {
                    var _a;
                    return gatsbyContext.schema.buildObjectType({
                        name: "" + fieldOptions.nodeType,
                        fields: (_a = {},
                            _a[fieldOptions.fieldName] = {
                                type: 'getURLs' in fieldOptions
                                    ? "[" + imgixImageType.name + "]"
                                    : imgixImageType.name,
                                resolve: function (node) {
                                    var rawURLE = getFieldValue({
                                        fieldOptions: fieldOptions,
                                        node: node,
                                    });
                                    return {
                                        rawURL: E.getOrElseW(function () {
                                            return gatsbyContext.reporter.panic("Error when resolving URL value for node type " + fieldOptions.nodeType);
                                        })(rawURLE),
                                    };
                                },
                            },
                            _a),
                    });
                });
            })
                .letL('rootType', function (_a) {
                var imgixImageType = _a.imgixImageType;
                return gatsbyContext.schema.buildObjectType({
                    name: 'Query',
                    fields: {
                        imgixImage: {
                            type: imgixImageType,
                            resolve: function (_, args) {
                                if ((args === null || args === void 0 ? void 0 : args.url) == null || typeof (args === null || args === void 0 ? void 0 : args.url) !== 'string') {
                                    return null;
                                }
                                return { rawURL: args === null || args === void 0 ? void 0 : args.url };
                            },
                            args: {
                                url: {
                                    type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                                    description: 'The path of the image to render. If using a Web Proxy Source, this must be a fully-qualified URL.',
                                },
                            },
                        },
                    },
                });
            })
                .doL(function (_a) {
                var imgixFixedType = _a.imgixFixedType, imgixFluidType = _a.imgixFluidType, imgixImageType = _a.imgixImageType, rootType = _a.rootType, fieldTypes = _a.fieldTypes, _b = _a.options;
                return E.tryCatch(function () {
                    var createTypes = gatsbyContext.actions.createTypes;
                    createTypes([imgixFixedType, imgixFluidType]);
                    createTypes(fieldTypes);
                    createTypes(imgixImageType);
                    createTypes(rootType);
                }, function (e) { return (e instanceof Error ? e : new Error('unknown error')); });
            })
                .return(function () { return undefined; }), E.getOrElseW(function (err) {
                gatsbyContext.reporter.panic("[@imgix/gatsby] Fatal error during setup: " + String(err));
                throw err;
            }))];
    });
}); };
exports.createSchemaCustomization = createSchemaCustomization;
//# sourceMappingURL=gatsby-node.js.map