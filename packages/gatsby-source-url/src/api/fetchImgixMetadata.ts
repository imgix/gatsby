import * as E from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import ImgixClient from 'imgix-core-js';
import * as t from 'io-ts';
import { withCache } from '../cache';
import { fetchJSON } from '../utils';

export const ImgixMetadata = t.type({
  'Content-Type': t.string,
  PixelWidth: t.number,
  PixelHeight: t.number,
});
export type IImgixMetadata = t.TypeOf<typeof ImgixMetadata>;

export const fetchImgixMetadata = (cache: GatsbyCache, client: ImgixClient) => (
  url: string,
): TE.TaskEither<Error, IImgixMetadata> =>
  withCache(`gatsby-plugin-imgix-metadata-${url}`, cache, () =>
    pipe(
      client.buildURL(url, { fm: 'json' }),
      (v) => {
        console.log(v);
        return v;
      },
      fetchJSON,
      TE.map((v) => {
        console.log(v);
        return v;
      }),
      TE.chain(
        flow(
          ImgixMetadata.decode,
          E.orElse(() =>
            E.left(new Error('Problem when decoding imgix metadata.')),
          ),
          TE.fromEither,
        ),
      ),
    ),
  );
