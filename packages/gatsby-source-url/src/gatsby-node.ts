/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
// You can delete this file if you're not using it

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.org/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */

import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import fs from 'fs';
import { CreateResolversArgsPatched, GatsbyNode, PluginOptions } from 'gatsby';
import path from 'path';
import readPkgUp from 'read-pkg-up';
import { createLogger } from './common/log';
import { createRootImgixImageType } from './createRootImgixImageType';
import { createImgixClient } from './imgix-core-js-wrapper';
import { GatsbySourceUrlOptions, IGatsbySourceUrlOptions } from './publicTypes';

const log = createLogger('gatsby-node');

export const onPreInit: GatsbyNode['onPreInit'] = (_: unknown) => {
  log('Loaded @imgix/gatsby-source-url (onPreInit)');
};

export const createResolvers: GatsbyNode['createResolvers'] = async (
  { createResolvers: createResolversCb, cache }: CreateResolversArgsPatched,
  options: PluginOptions<IGatsbySourceUrlOptions>,
) =>
  pipe(
    options,
    GatsbySourceUrlOptions.decode,
    E.chainW(createImgixClient),
    E.chain((imgixClient) => {
      const version = readPkgUp.sync({ cwd: __dirname })?.packageJson.version;

      if (version == null || version.trim() === '') {
        log('Unable to read package version.');
        return E.left(new Error('Unable to read package version'));
      }

      imgixClient.includeLibraryParam = false;
      (imgixClient as any).settings.libraryParam = `gatsby-source-url-${version}`;
      return E.right(imgixClient);
    }),
    E.map((imgixClient) => ({
      Query: {
        imgixImage: createRootImgixImageType(imgixClient, cache),
      },
    })),
    E.map(createResolversCb),
  );

export const onPreExtractQueries: GatsbyNode['onPreExtractQueries'] = ({
  store,
}) => {
  const program = store.getState().program;

  // Let's add our fragments to .cache/fragments.
  fs.copyFileSync(
    path.resolve(__dirname, '../fragments.js'),
    `${program.directory}/.cache/fragments/imgix-source-url-fragments.js`,
  );
};
