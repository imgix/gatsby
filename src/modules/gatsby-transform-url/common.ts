import ImgixClient from '@imgix/js-core';
import { VERSION } from '../../common/constants';

export const createImgixClient = ({
  libraryParam,
  ...rest
}: ConstructorParameters<typeof ImgixClient>[0] & {
  libraryParam?: string;
}): ImgixClient => {
  const client = new ImgixClient({
    ...rest,
    includeLibraryParam: false, // force false so that @imgix/js-core doesn't include its own library param
  });

  // This is not a public API, so it is not included in the type definitions for ImgixClient
  if (libraryParam != null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).settings.libraryParam = `${libraryParam}-${VERSION}`;
  }

  return client;
};

export const MAX_DPR = 5;
export const MAX_WIDTH = 8192;
