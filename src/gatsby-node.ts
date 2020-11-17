/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

import { GatsbyNode } from 'gatsby';
import { createLogger } from './common/log';

const log = createLogger('gatsby-node');

export const onPreInit: GatsbyNode['onPreInit'] = (_: unknown) => {
  log('Loaded @imgix/gatsby (onPreInit)');
};

// export const createResolvers = () => {};
export * from './modules/gatsby-source-url/gatsby-node';
