import { GatsbyCache } from 'gatsby';
import fetch from 'node-fetch';
import { withCache } from '../common/cache';

export const buildBase64URL = (contentType: string, base64: string): string =>
  `data:${contentType};base64,${base64}`;

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
export const fetchImgixBase64Image = (cache: GatsbyCache) => (
  url: string,
): Promise<string> => {
  return withCache(`imgix-gatsby-base64-url-${url}`, cache, () =>
    fetchBase64ImageAPI(url),
  );
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

export const fetchImgixDominantColor = (cache: GatsbyCache) => (
  buildURL: (params: Record<string, unknown>) => string,
): Promise<HexString> => {
  const url = buildURL({ palette: 'json' });
  return withCache(`imgix-gatsby-dominant-color-${url}`, cache, () =>
    fetchImgixDominantColorAPI(url),
  );
};
