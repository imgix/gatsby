import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import fetch from 'node-fetch';
import { withCache } from '../common/cache';

export const buildBase64URL = (contentType: string, base64: string): string =>
  `data:${contentType};base64,${base64}`;

/**
 * Given an imgix url, return the base64 image data for the image
 */
const fetchBase64ImageAPI = async (url: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      'Something went wrong while fetching the base64 placeholder image',
    );
  }
  try {
    const buffer = await res.buffer();
    const bufferBase64 = buffer.toString('base64');
    return buildBase64URL(
      String(res.headers.get('content-type')),
      bufferBase64,
    );
  } catch (error) {
    throw new Error(
      'Something went wrong while building the base64 placeholder image: ' +
        String(error),
    );
  }
};

/**
 * Fetch the base64 image for an imgix url, and cache the request in the Gatsby
 * cache
 */
export const fetchImgixBase64Image = (cache: GatsbyCache) => (
  url: string,
): Promise<string> => {
  const withCacheTE = withCache(`imgix-gatsby-base64-url-${url}`, cache, () =>
    TE.tryCatch(
      () => fetchBase64ImageAPI(url),
      (error) => new Error(),
    ),
  );

  return TE.getOrElse<Error, string>(() => {
    throw new Error('Something went wrong while fetching the base64 image');
  })(withCacheTE)();
};

export type HexString = string;
type ImgixPaletteResponse = {
  dominant_colors: {
    vibrant: {
      /**
       * In format '#xxxxxx'
       */
      hex: string;
    };
  };
};

/**
 * Given an imgix url, fetch the dominant color
 */
const fetchImgixDominantColorAPI = async (url: string): Promise<HexString> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      'Something went wrong while fetching the dominant color for the placeholder image',
    );
  }
  try {
    const data = (await res.json()) as ImgixPaletteResponse;
    return data.dominant_colors.vibrant.hex;
  } catch (error) {
    throw new Error(
      'Something went wrong while decoding the dominant color for the placeholder image: ' +
        String(error),
    );
  }
};

/**
 * Fetch the dominant color for a given imgix url, and cache the request in the
 * Gatsby cache
 */
export const fetchImgixDominantColor = (cache: GatsbyCache) => (
  buildURL: (params: Record<string, unknown>) => string,
): Promise<HexString> => {
  const url = buildURL({ palette: 'json' });
  const withCacheTE = withCache(
    `imgix-gatsby-dominant-color-${url}`,
    cache,
    () =>
      TE.tryCatch(
        () => fetchImgixDominantColorAPI(url),
        (error) => new Error(),
      ),
  );

  return TE.getOrElse<Error, string>(() => {
    throw new Error('Something went wrong while fetching the dominant color');
  })(withCacheTE)();
};
