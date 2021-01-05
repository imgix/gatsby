/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

import { GatsbyNode } from 'gatsby';
import { createLogger } from './common/log';

const log = createLogger('gatsby-node');

export const onPreInit: GatsbyNode['onPreInit'] = ({ reporter }) => {
  reporter.info('[@imgix/gatsby] Loaded plugin.');
  log('Loaded @imgix/gatsby (onPreInit)');
};

// export const createResolvers = () => {};
export {
  createResolvers,
  onPreExtractQueries,
} from './modules/gatsby-source-url/gatsby-node';
/* export {
  createSchemaCustomization,
  onCreateNode,
} from './modules/gatsby-transform-node/gatsby-node';
 */
