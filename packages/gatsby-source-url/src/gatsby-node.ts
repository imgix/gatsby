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
import { CreateResolversArgsPatched, GatsbyNode, PluginOptions } from 'gatsby';
import { createRootImgixImageType } from './createRootImgixImageType';
import { createImgixClient } from './imgix-core-js-wrapper';
import { GatsbySourceUrlOptions, IGatsbySourceUrlOptions } from './publicTypes';

export const onPreInit: GatsbyNode['onPreInit'] = (_: unknown) => {
  console.log('Loaded @imgix/gatsby-source-url');
};

export const createResolvers: GatsbyNode['createResolvers'] = async (
  { createResolvers: createResolversCb }: CreateResolversArgsPatched,
  options: PluginOptions<IGatsbySourceUrlOptions>,
) =>
  pipe(
    options,
    GatsbySourceUrlOptions.decode,
    E.chainW(createImgixClient),
    E.map((imgixClient) => ({
      Query: {
        imgixImage: createRootImgixImageType(imgixClient),
      },
    })),
    E.map(createResolversCb),
  );
