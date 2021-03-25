import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { Errors } from 'io-ts';
import { parseStringARParam, StringAspectRatio } from '../../common/ar';
import { parseHost, parsePath } from '../../common/uri';
import { createImgixClient } from './common';
import {
  IGatsbyImageFixedData,
  IGatsbyImageFluidData,
  IImgixParams,
} from './types';

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
  const client = createImgixClient({
    domain: host,
    libraryParam:
      options.includeLibraryParam === false ? undefined : 'gatsbyTransformUrl',
  });

  const transformedImgixParams = {
    fit: 'crop', // needed for fluid (ar) and fixed (w&h) cropping, can be overridden
    ...imgixParams,
    ar: imgixParams.ar != null ? `${imgixParams.ar}:1` : undefined,
  };

  const src = client.buildURL(path, transformedImgixParams);
  const srcset = client.buildSrcSet(path, transformedImgixParams);
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
export { getGatsbyImageData } from './gatsbyPluginImage';
export { ImgixGatsbyImage } from './gatsbyPluginImageComponent';
