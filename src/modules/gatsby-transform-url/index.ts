import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import ImgixClient from 'imgix-core-js';
import { Errors } from 'io-ts';
import { parseStringARParam, StringAspectRatio } from '../../common/ar';
import { parseHost, parsePath } from '../../common/uri';
import {
  IGatsbyImageFixedData,
  IGatsbyImageFluidData,
  IImgixParams,
} from './types';

const VERSION = '1.0.0-rc.1';

function buildImageData(
  url: string,
  imgixParams: { w: number; h: number } & IImgixParams,
  options: { type: 'fixed' },
): IGatsbyImageFixedData;
function buildImageData(
  url: string,
  imgixParams: IImgixParams & { ar: number },
  options: { type: 'fluid' },
): IGatsbyImageFluidData;
function buildImageData(
  url: string,
  imgixParams: { w?: number; h?: number } & IImgixParams,
  options: {
    type: 'fluid' | 'fixed';
    includeLibraryParam?: boolean;
    sizes?: string;
  },
): IGatsbyImageFixedData | IGatsbyImageFluidData {
  const host = parseHost(url);
  const path = parsePath(url);
  const client = new ImgixClient({
    domain: host,
    includeLibraryParam: false, // force false so that imgix-core-js doesn't include its own library param
  });

  const includeLibraryParam = options.includeLibraryParam ?? true;
  // This is not a public API, so it is not included in the type definitions for ImgixClient
  if (includeLibraryParam) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).settings.libraryParam = `gatsby-transform-url-${VERSION}`;
  }

  const transformedImgixParams = {
    fit: 'crop', // needed for fluid (ar) and fixed (w&h) cropping, can be overridden
    ...imgixParams,
    ar: imgixParams.ar != null ? `${imgixParams.ar}:1` : undefined,
  };

  // We have to spread parameters because imgix-core-js builders mutate params. GH issue: https://github.com/imgix/imgix-core-js/issues/158
  const src = client.buildURL(path, {
    ...transformedImgixParams,
  });
  const srcset = client.buildSrcSet(path, {
    ...transformedImgixParams,
  });
  const srcWebp = client.buildURL(path, {
    ...transformedImgixParams,
    fm: 'webp',
  });
  const srcsetWebp = client.buildSrcSet(path, {
    ...transformedImgixParams,
    fm: 'webp',
  });

  if (options.type === 'fluid') {
    return {
      sizes: options.sizes ?? '100vw',
      src,
      srcSet: srcset,
      srcWebp,
      srcSetWebp: srcsetWebp,
      aspectRatio: imgixParams.ar,
    };
  } else if (options.type === 'fixed') {
    return {
      width: imgixParams.w as number,
      height: imgixParams.h as number,
      src,
      srcSet: srcset,
      srcWebp,
      srcSetWebp: srcsetWebp,
    };
  }
  const _neverReturn: never = options.type; // Fixes typescript error 'not all code paths return a value'
  return _neverReturn;
}

export function buildFixedImageData(
  /**
   * An imgix url to transform, e.g. https://yourdomain.imgix.net/your-image.jpg
   */
  url: string,
  /**
   * A set of imgix parameters to apply to the image.
   * Parameters ending in 64 will be base64 encoded.
   * A full list of imgix parameters can be found here: https://docs.imgix.com/apis/url
   * Width (w) and height (h) are required.
   */
  imgixParams: { w: number; h: number } & IImgixParams,
  /**
   * Options that are not imgix parameters.
   * Optional.
   */
  options: {
    /**
     * Disable the ixlib diagnostic param that is added to every url.
     */
    includeLibraryParam?: boolean;
  } = {},
): IGatsbyImageFixedData {
  return buildImageData(
    url,
    { fit: 'crop', ...imgixParams },
    { ...options, type: 'fixed' },
  );
}

export function buildFluidImageData(
  /**
   * An imgix url to transform, e.g. https://yourdomain.imgix.net/your-image.jpg
   */
  url: string,
  /**
   * A set of imgix parameters to apply to the image.
   * Parameters ending in 64 will be base64 encoded.
   * A full list of imgix parameters can be found here: https://docs.imgix.com/apis/url
   * The aspect ratio (ar) as a float is required.
   */
  imgixParams: {
    /**
     * The aspect ratio to set for the rendered image and the placeholder.
     * Format: float or string. For float, it can be calculated with ar = width/height. For a string, it should be in the format w:h.
     */
    ar: number | string;
  } & IImgixParams,
  /**
   * Options that are not imgix parameters.
   * Optional.
   */
  options: {
    /**
     * Disable the ixlib diagnostic param that is added to every url.
     */
    includeLibraryParam?: boolean;
    /**
     * The sizes attribute to set on the underlying image.
     */
    sizes?: string;
  } = {},
): IGatsbyImageFluidData {
  const aspectRatioFloat = (() => {
    const throwError = () => {
      throw new Error(
        'An invalid string ar parameter was provided. Either provide an aspect ratio as a number, or as a string in the format w:h, e.g. 1.61:1.',
      );
    };
    if (typeof imgixParams.ar === 'number' && isNaN(imgixParams.ar)) {
      throwError();
    }
    if (typeof imgixParams.ar === 'number') {
      return imgixParams.ar;
    }

    return pipe(
      StringAspectRatio.decode(imgixParams.ar),
      E.map(parseStringARParam),
      E.getOrElse<Errors, number>(throwError),
    );
  })();

  return buildImageData(
    url,
    { ...imgixParams, ar: aspectRatioFloat },
    { ...options, type: 'fluid' },
  );
}
