import ImgixClient from '@imgix/js-core';
import { Do } from 'fp-ts-contrib/lib/Do';
import { sequenceS } from 'fp-ts/lib/Apply';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { parseHostE, parsePathE } from './uri';

/**
 * An FP wrapper around new ImgixClient()
 * @param param0 any options that can be passed to new ImgixClient(), and also allows overriding ixlib.
 */
export const createImgixClient = ({
  ixlib,
  ...options
}: ConstructorParameters<typeof ImgixClient>[0] & { ixlib?: string }): E.Either<
  Error,
  ImgixClient
> =>
  E.tryCatch(
    () => {
      const client = new ImgixClient(options);
      client.includeLibraryParam = false;
      if (ixlib) {
        (client as any).settings.libraryParam = ixlib;
      }
      return client;
    },
    (e) => (e instanceof Error ? e : new Error('unknown error')),
  );

/**
 * Used by createImgixURLBuilder, common code extracted here to avoid code duplication.
 */
export const createURLBuilderFn = <T extends 'buildURL' | 'buildSrcSet'>(
  fn: T,
) => (options?: Parameters<typeof createImgixClient>[0]) => (
  ...args: Parameters<InstanceType<typeof ImgixClient>[T]>
): string =>
  pipe(
    Do(E.either)
      .bindL('urlParts', () => {
        if (options?.domain) {
          return E.right({
            domain: options?.domain,
            path: args[0],
          });
        }
        return sequenceS(E.either)({
          domain: parseHostE(args[0]),
          path: parsePathE(args[0]),
        });
      })
      .bindL('client', ({ urlParts: { domain } }) =>
        createImgixClient({
          ixlib: 'gatsbyFP',
          ...options,
          domain,
        }),
      )
      .return(({ client, urlParts: { path } }) =>
        client[fn](path, ...args.slice(1)),
      ),
    E.getOrElse<Error, string>((err) => {
      throw err;
    }),
  );

/**
 * Build a functional ImgixClient. Allows this application to use ImgixClient in a functional manner rather than a instance/class-based manner.
 * @param options options to pass to new ImgixClient, with extra options accepted by createImgixClient
 */
export const createImgixURLBuilder = (
  options?: Parameters<typeof createImgixClient>[0],
): IImgixURLBuilder => ({
  buildURL: createURLBuilderFn('buildURL')(options),
  buildSrcSet: createURLBuilderFn('buildSrcSet')(options),
});

export type IBuildImgixUrl = ImgixClient['buildURL'];
export type IBuildImgixSrcSet = ImgixClient['buildSrcSet'];
/**
 * This interface represents the minimal subset of functions/methods that this plugin uses of the entire ImgixClient. This allows the interface to be reimplemented in a functional manner, rather than in a class/instance manner.
 * See createImgixURLBuilder for an implementation of this interface.
 */
export type IImgixURLBuilder = {
  // TODO: maybe use Either instead?
  buildURL: IBuildImgixUrl;
  buildSrcSet: IBuildImgixSrcSet;
};
