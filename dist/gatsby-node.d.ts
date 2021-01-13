/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
import { GatsbyNode } from 'gatsby';
export declare const onPreInit: GatsbyNode['onPreInit'];
export { createResolvers, onPreExtractQueries, } from './modules/gatsby-source-url/gatsby-node';
export { createSchemaCustomization, onCreateNode, } from './modules/gatsby-transform-node/gatsby-node';
//# sourceMappingURL=gatsby-node.d.ts.map