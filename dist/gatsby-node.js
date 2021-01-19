"use strict";
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPreExtractQueries = exports.createSchemaCustomization = exports.onPreInit = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var log_1 = require("./common/log");
var log = log_1.createLogger('gatsby-node');
var onPreInit = function (_a) {
    var reporter = _a.reporter;
    reporter.info('[@imgix/gatsby] Loaded plugin.');
    log('Loaded @imgix/gatsby (onPreInit)');
};
exports.onPreInit = onPreInit;
var gatsby_node_1 = require("./modules/gatsby-transform-node/gatsby-node");
Object.defineProperty(exports, "createSchemaCustomization", { enumerable: true, get: function () { return gatsby_node_1.createSchemaCustomization; } });
var onPreExtractQueries = function (_a) {
    var store = _a.store;
    var program = store.getState().program;
    // Let's add our fragments to .cache/fragments.
    fs_1.default.copyFileSync(path_1.default.resolve(__dirname, '../fragments.js'), program.directory + "/.cache/fragments/imgix-fragments.js");
};
exports.onPreExtractQueries = onPreExtractQueries;
//# sourceMappingURL=gatsby-node.js.map