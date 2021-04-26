import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import { withCache } from '../common/cache';
import { fetch } from '../common/utils';

export const buildBase64URL = (contentType: string, base64: string): string =>
  `data:${contentType};base64,${base64}`;

export const fetchImgixBase64Image = (cache: GatsbyCache) => (
  url: string,
): TE.TaskEither<Error, string> =>
  withCache(`imgix-gatsby-base64-url-${url}`, cache, () =>
    pipe(
      url,
      fetch,
      TE.chain((res) =>
        pipe(
          TE.rightTask<Error, Buffer>(() => res.buffer()),
          TE.chain((buffer) => TE.right(buffer.toString('base64'))),
          TE.chain((base64) =>
            TE.right(
              buildBase64URL(String(res.headers.get('content-type')), base64),
            ),
          ),
        ),
      ),
    ),
  );

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
        fetch,
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
