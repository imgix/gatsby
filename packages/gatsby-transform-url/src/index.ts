import ImgixClient from 'imgix-core-js';
import { parseHost, parsePath } from './common/uri';
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
  imgixParams: IImgixParams,
  options: { type: 'fluid' },
): IGatsbyImageFluidData;
function buildImageData(
  url: string,
  imgixParams: { w?: number; h?: number } & IImgixParams,
  options: { type: 'fluid' | 'fixed' },
): IGatsbyImageFixedData | IGatsbyImageFluidData {
  const host = parseHost(url);
  const path = parsePath(url);
  const client = new ImgixClient({
    domain: host,
  });

  const src = client.buildURL(path, imgixParams);
  const srcset = client.buildSrcSet(path, imgixParams);

  if (options.type === 'fluid') {
    return {
      sizes: '100vw',
      src,
      srcSet: srcset,
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
  options: {} = {},
): IGatsbyImageFixedData {
  return buildImageData(
    url,
    { fit: 'crop', ...imgixParams },
    { ...options, type: 'fixed' },
  );
}

export function buildFluidImageData(
  url: string,
  imgixParams: IImgixParams = {},
  options: {} = {},
) {
  return buildImageData(url, imgixParams, { ...options, type: 'fluid' });
}
