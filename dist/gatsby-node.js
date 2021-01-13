"use strict";
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPreInit = void 0;
var log_1 = require("./common/log");
var log = log_1.createLogger('gatsby-node');
exports.onPreInit = function (_a) {
    var reporter = _a.reporter;
    reporter.info('[@imgix/gatsby] Loaded plugin.');
    log('Loaded @imgix/gatsby (onPreInit)');
};
// export const createResolvers = () => {};
var gatsby_node_1 = require("./modules/gatsby-source-url/gatsby-node");
Object.defineProperty(exports, "createResolvers", { enumerable: true, get: function () { return gatsby_node_1.createResolvers; } });
Object.defineProperty(exports, "onPreExtractQueries", { enumerable: true, get: function () { return gatsby_node_1.onPreExtractQueries; } });
var gatsby_node_2 = require("./modules/gatsby-transform-node/gatsby-node");
Object.defineProperty(exports, "createSchemaCustomization", { enumerable: true, get: function () { return gatsby_node_2.createSchemaCustomization; } });
Object.defineProperty(exports, "onCreateNode", { enumerable: true, get: function () { return gatsby_node_2.onCreateNode; } });
//# sourceMappingURL=gatsby-node.js.map