import ImgixClient from '@imgix/js-core';
import { parseHost, parsePath } from './uri';

/**
 * An FP wrapper around new ImgixClient()
 * @param param0 any options that can be passed to new ImgixClient(), and also allows overriding ixlib.
 */
export const createImgixClient = ({
  ixlib,
  ...options
}: ConstructorParameters<typeof ImgixClient>[0] & {
  ixlib?: string;
}): ImgixClient => {
  const client = new ImgixClient(options);
  client.includeLibraryParam = false;
  if (ixlib) {
    (client as any).settings.libraryParam = ixlib;
  }
  return client;
};

/**
 * Used by createImgixURLBuilder, common code extracted here to avoid code duplication.
 */
export const createURLBuilderFn = <T extends 'buildURL' | 'buildSrcSet'>(
  fn: T,
) => (options?: Parameters<typeof createImgixClient>[0]) => (
  ...args: Parameters<InstanceType<typeof ImgixClient>[T]>
): string => {
  const urlParts = (() => {
    if (options?.domain) {
      return {
        domain: options?.domain,
        path: args[0],
      };
    }
    return {
      domain: parseHost(args[0]),
      path: parsePath(args[0]),
    };
  })();

  const client = createImgixClient({
    ixlib: 'gatsbyFP',
    ...options,
    domain: urlParts.domain,
  });

  return client[fn](urlParts.path, ...args.slice(1));
};

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
