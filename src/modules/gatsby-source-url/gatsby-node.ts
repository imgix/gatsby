/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
// You can delete this file if you're not using it

import { Do } from 'fp-ts-contrib/lib/Do';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import fs from 'fs';
import { GatsbyNode, ICreateResolversHook } from 'gatsby';
import { PathReporter } from 'io-ts/PathReporter';
import path from 'path';
import readPkgUp from 'read-pkg-up';
import { createImgixClient } from '../../common/imgix-core-js-wrapper';
import { IImgixGatsbyOptions, ImgixGatsbyOptionsIOTS } from '../../publicTypes';
import { createRootImgixImageType } from './createRootImgixImageType';

export const createResolvers: ICreateResolversHook<IImgixGatsbyOptions> = (
  { createResolvers: createResolversCb, cache, reporter },
  _options,
): any =>
  pipe(
    Do(E.either)
      .bind(
        'options',
        pipe(
          ImgixGatsbyOptionsIOTS.decode(_options),
          E.mapLeft(
            (errs) =>
              new Error(
                `[@imgix/gatsby] The plugin config is not in the correct format. Errors: ${PathReporter.report(
                  E.left(errs),
                )}`,
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
                  `[@imgix/gatsby/source-url] the plugin option 'secureURLToken' is required when sourceType is 'webProxy'.`,
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
          readPkgUp.sync({ cwd: __dirname })?.packageJson?.version,
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
      reporter.panic(
        `[@imgix/gatsby/source-url] Fatal error in createResolvers: ${String(
          err,
        )}`,
      );
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
