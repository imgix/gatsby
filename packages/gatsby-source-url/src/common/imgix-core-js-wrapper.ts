import * as E from 'fp-ts/lib/Either';
import ImgixClient from 'imgix-core-js';

export const createImgixClient = (
  options: ConstructorParameters<typeof ImgixClient>[0],
): E.Either<Error, ImgixClient> =>
  E.tryCatch(
    () => new ImgixClient(options),
    (e) => (e instanceof Error ? e : new Error('unknown error')),
  );

export type IBuildImgixUrl = ImgixClient['buildURL'];
export type IBuildImgixSrcSet = ImgixClient['buildSrcSet'];
