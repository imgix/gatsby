import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import fetch from 'node-fetch';
import { withCache } from '../common/cache';
import { fetch as fetchFPTS } from '../common/utils';

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

export const fetchImgixDominantColor = (cache: GatsbyCache) => (
  buildURL: (params: Record<string, unknown>) => string,
): TE.TaskEither<Error, HexString> =>
  pipe(buildURL({ palette: 'json' }), (url) =>
    withCache(`imgix-gatsby-dominant-color-${url}`, cache, () =>
      pipe(
        url,
        fetchFPTS,
        TE.chain((res) =>
          TE.tryCatch<Error, ImgixPaletteResponse>(
            () => res.json(),
            (err) =>
              new Error(
                'Something went wrong while decoding the dominant color for the placeholder image: ' +
                  String(err),
              ),
          ),
        ),
        TE.map((data) => data.dominant_colors.vibrant.hex),
      ),
    ),
  );
