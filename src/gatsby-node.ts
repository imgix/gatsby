/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

import fs from 'fs';
import { GatsbyNode } from 'gatsby';
import path from 'path';
import { createLogger } from './common/log';

const log = createLogger('gatsby-node');

export const onPreInit: GatsbyNode['onPreInit'] = ({ reporter }) => {
  reporter.info('[@imgix/gatsby] Loaded plugin.');
  log('Loaded @imgix/gatsby (onPreInit)');
};

// export const createResolvers = () => {};
export {
  createSchemaCustomization,
  onCreateNode,
} from './modules/gatsby-transform-node/gatsby-node';

export const onPreExtractQueries: GatsbyNode['onPreExtractQueries'] = ({
  store,
}) => {
  const program = store.getState().program;

  // Let's add our fragments to .cache/fragments.
  fs.copyFileSync(
    path.resolve(__dirname, '../../../fragments.js'),
    `${program.directory}/.cache/fragments/imgix-fragments.js`,
  );
};
