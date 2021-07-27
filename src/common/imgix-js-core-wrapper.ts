import ImgixClient from '@imgix/js-core';
import * as E from 'fp-ts/Either';
import { VERSION } from './constants';

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
export const createURLBuilderFn = <T extends '_buildURL' | '_buildSrcSet'>(
  fn: T,
) => (options?: Parameters<typeof createImgixClient>[0]) => (
  ...args: Parameters<typeof ImgixClient[T]>
): string => {
  const imgixParams = args[1];
  const clientOptions = fn === '_buildURL' ? args[2] : (args as any)[3];
  const url: string = (() => {
    if (options?.domain) {
      // Prepend host to URL string to support Web Proxy Sources
      // When a Web Proxy Source is used, the args[0] will be a full URL,
      // for other sources it will simply be a path
      return `${options?.domain}/${args[0]}`;
    }
    return args[0];
  })();

  const mergedOptions: Parameters<typeof ImgixClient['_buildURL']>[2] = {
    includeLibraryParam: false,
    ...options,
    ...clientOptions,
    libraryParam:
      options?.ixlib ?? clientOptions?.ixlib ?? `gatsbyFP-${VERSION}`,
  };
  try {
    if (fn === '_buildURL') {
      return ImgixClient._buildURL(url, imgixParams, mergedOptions);
    } else {
      const srcSetOptions = args[2];
      return ImgixClient._buildSrcSet(
        url,
        imgixParams,
        srcSetOptions,
        mergedOptions,
      );
    }
  } catch (error) {
    throw new Error(
      'URL construction failed. Make sure either domain is set in gatsby-config.js, or the image path has a domain included.',
    );
  }
};

/**
 * Build a functional ImgixClient. Allows this application to use ImgixClient in a functional manner rather than a instance/class-based manner.
 * @param options options to pass to new ImgixClient, with extra options accepted by createImgixClient
 */
export const createImgixURLBuilder = (
  options?: Parameters<typeof createImgixClient>[0],
): IImgixURLBuilder => ({
  buildURL: createURLBuilderFn('_buildURL')(options),
  buildSrcSet: createURLBuilderFn('_buildSrcSet')(options),
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
