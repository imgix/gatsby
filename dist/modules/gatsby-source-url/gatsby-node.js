"use strict";
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
// You can delete this file if you're not using it
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPreExtractQueries = exports.createResolvers = void 0;
var Do_1 = require("fp-ts-contrib/lib/Do");
var E = __importStar(require("fp-ts/lib/Either"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var fs_1 = __importDefault(require("fs"));
var PathReporter_1 = require("io-ts/PathReporter");
var path_1 = __importDefault(require("path"));
var read_pkg_up_1 = __importDefault(require("read-pkg-up"));
var imgix_core_js_wrapper_1 = require("../../common/imgix-core-js-wrapper");
var publicTypes_1 = require("../../publicTypes");
var createRootImgixImageType_1 = require("./createRootImgixImageType");
exports.createResolvers = function (_a, _options) {
    var _b, _c;
    var createResolversCb = _a.createResolvers, cache = _a.cache, reporter = _a.reporter;
    return pipeable_1.pipe(Do_1.Do(E.either)
        .bind('options', pipeable_1.pipe(publicTypes_1.ImgixGatsbyOptionsIOTS.decode(_options), E.mapLeft(function (errs) {
        return new Error("[@imgix/gatsby] The plugin config is not in the correct format. Errors: " + PathReporter_1.PathReporter.report(E.left(errs)));
    }), E.chain(function (options) {
        if (options.sourceType === 'webProxy' &&
            (options.secureURLToken == null ||
                options.secureURLToken.trim() === '')) {
            return E.left(new Error("[@imgix/gatsby/source-url] the plugin option 'secureURLToken' is required when sourceType is 'webProxy'."));
        }
        return E.right(options);
    })))
        .bindL('imgixClient', function (_a) {
        var _b = _a.options, domain = _b.domain, secureURLToken = _b.secureURLToken;
        return imgix_core_js_wrapper_1.createImgixClient({ domain: domain, secureURLToken: secureURLToken });
    })
        .bind('packageVersion', pipeable_1.pipe((_c = (_b = read_pkg_up_1.default.sync({ cwd: __dirname })) === null || _b === void 0 ? void 0 : _b.packageJson) === null || _c === void 0 ? void 0 : _c.version, E.fromNullable(new Error('Could not read package version.'))))
        .doL(function (_a) {
        var options = _a.options, imgixClient = _a.imgixClient, packageVersion = _a.packageVersion;
        imgixClient.includeLibraryParam = false;
        if (options.disableIxlibParam !== true) {
            imgixClient.settings.libraryParam = "gatsby-source-url-" + packageVersion;
        }
        return E.right(imgixClient);
    })
        .letL('rootQueryTypeMap', function (_a) {
        var _b;
        var imgixClient = _a.imgixClient, options = _a.options;
        return ({
            Query: {
                imgixImage: createRootImgixImageType_1.createRootImgixImageType(imgixClient, cache, (_b = options.defaultImgixParams) !== null && _b !== void 0 ? _b : {}),
            },
        });
    })
        .doL(function (_a) {
        var rootQueryTypeMap = _a.rootQueryTypeMap;
        return E.tryCatch(function () { return createResolversCb(rootQueryTypeMap); }, function (e) { return (e instanceof Error ? e : new Error('unknown error')); });
    })
        .return(function () { return undefined; }), E.getOrElseW(function (err) {
        reporter.panic("[@imgix/gatsby/source-url] Fatal error in createResolvers: " + String(err));
        throw err;
    }));
};
exports.onPreExtractQueries = function (_a) {
    var store = _a.store;
    var program = store.getState().program;
    // Let's add our fragments to .cache/fragments.
    fs_1.default.copyFileSync(path_1.default.resolve(__dirname, '../../../fragments.js'), program.directory + "/.cache/fragments/imgix-fragments.js");
};
//# sourceMappingURL=gatsby-node.js.map