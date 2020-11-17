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

import { Do } from 'fp-ts-contrib/lib/Do';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import fs from 'fs';
import { CreateResolversArgsPatched, GatsbyNode, PluginOptions } from 'gatsby';
import path from 'path';
import readPkgUp from 'read-pkg-up';
import { createImgixClient } from '../../common/imgix-core-js-wrapper';
import { createLogger } from '../../common/log';
import { createRootImgixImageType } from './createRootImgixImageType';
import { GatsbySourceUrlOptions, IGatsbySourceUrlOptions } from './publicTypes';

const log = createLogger('gatsby-node');

export const onPreInit: GatsbyNode['onPreInit'] = (_: unknown) => {
  log('Loaded @imgix/gatsby-source-url (onPreInit)');
};

export const createResolvers: GatsbyNode['createResolvers'] = (
  { createResolvers: createResolversCb, cache }: CreateResolversArgsPatched,
  _options: PluginOptions<IGatsbySourceUrlOptions>,
): any =>
  pipe(
    Do(E.either)
      .bind(
        'options',
        pipe(
          GatsbySourceUrlOptions.decode(_options),
          E.mapLeft(
            () =>
              new Error(
                `[@imgix/gatsby] The plugin config is not in the correct format.`,
              ),
          ),
          E.chain((options) => {
            if (
              options.sourceType === 'webProxy' &&
              (options.secureURLToken == null ||
                options.secureURLToken.trim() === '')
            ) {
              return E.left(
                new Error(
                  `[@imgix/gatsby] the plugin option 'secureURLToken' is required when sourceType is 'webProxy'.`,
                ),
              );
            }
            return E.right(options);
          }),
        ),
      )
      .bindL('imgixClient', ({ options: { domain, secureURLToken } }) =>
        createImgixClient({ domain, secureURLToken }),
      )
      .bind(
        'packageVersion',
        pipe(
          readPkgUp.sync({ cwd: __dirname })?.packageJson.version,
          E.fromNullable(new Error('Could not read package version.')),
        ),
      )
      .doL(({ options, imgixClient, packageVersion }) => {
        imgixClient.includeLibraryParam = false;
        if (options.disableIxlibParam !== true) {
          (imgixClient as any).settings.libraryParam = `gatsby-source-url-${packageVersion}`;
        }
        return E.right(imgixClient);
      })
      .letL('rootQueryTypeMap', ({ imgixClient, options }) => ({
        Query: {
          imgixImage: createRootImgixImageType(
            imgixClient,
            cache,
            options.defaultImgixParams ?? {},
          ),
        },
      }))
      .doL(({ rootQueryTypeMap }) =>
        E.tryCatch(
          () => createResolversCb(rootQueryTypeMap),
          (e) => (e instanceof Error ? e : new Error('unknown error')),
        ),
      )
      .return(() => undefined),
    E.getOrElseW((err) => {
      throw err;
    }),
  );

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
