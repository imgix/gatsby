import ImgixClient from 'imgix-core-js';
import { parseHost, parsePath } from './common/uri';
import {
  IGatsbyImageFixedData,
  IGatsbyImageFluidData,
  IImgixParams,
} from './types';

const VERSION = '0.0.2';

function buildImageData(
  url: string,
  imgixParams: { w: number; h: number } & IImgixParams,
  options: { type: 'fixed' },
): IGatsbyImageFixedData;
function buildImageData(
  url: string,
  imgixParams: IImgixParams,
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
    fit: 'crop', // needed for fluid (ar) and fixed (w&h) cropping, can be overriden
    ...imgixParams,
    ar: imgixParams.ar != null ? `${imgixParams.ar}:1` : undefined,
  };

  const src = client.buildURL(path, transformedImgixParams);
  const srcset = client.buildSrcSet(path, transformedImgixParams);

  if (options.type === 'fluid') {
    return {
      sizes: options.sizes ?? '100vw',
      src,
      srcSet: srcset,
      aspectRatio: imgixParams.ar,
    };
  } else if (options.type === 'fixed') {
    return {
      width: imgixParams.w as number,
      height: imgixParams.h as number,
      src,
      srcSet: srcset,
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
   * The aspect ratio (ar) as a float is required.
   */
  imgixParams: {
    /**
     * The aspect ratio to set for the rendered image and the placeholder.
     * Format: float. Can be calculated with ar = width/height.
     */
    ar: number;
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
  return buildImageData(url, imgixParams, { ...options, type: 'fluid' });
}
