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
  url: string,
  imgixParams: { w: number; h: number } & IImgixParams,
  options: { includeLibraryParam?: boolean; sizes?: string } = {},
): IGatsbyImageFixedData {
  return buildImageData(
    url,
    { fit: 'crop', ...imgixParams },
    { ...options, type: 'fixed' },
  );
}

export function buildFluidImageData(
  url: string,
  imgixParams: { ar: number } & IImgixParams,
  options: { includeLibraryParam?: boolean; sizes?: string } = {},
) {
  return buildImageData(url, imgixParams, { ...options, type: 'fluid' });
}
