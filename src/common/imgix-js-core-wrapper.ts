import ImgixClient from '@imgix/js-core';
import * as E from 'fp-ts/lib/Either';

export const createImgixClient = (
  options: ConstructorParameters<typeof ImgixClient>[0],
): E.Either<Error, ImgixClient> =>
  E.tryCatch(
    () => new ImgixClient(options),
    (e) => (e instanceof Error ? e : new Error('unknown error')),
  );

export type IBuildImgixUrl = ImgixClient['buildURL'];
export type IBuildImgixSrcSet = ImgixClient['buildSrcSet'];
