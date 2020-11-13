import * as E from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from '../../../types/node_modules/gatsby';
import ImgixClient from 'imgix-core-js';
import * as t from 'io-ts';
import { withCache } from '../modules/gatsby-source-url/cache';
import { createLogger, trace } from '../common/log';
import { fetchJSON } from '../modules/gatsby-source-url/utils';

const log = createLogger('fetchImgixMetadata');

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
      trace('imgix metadata url', log),
      fetchJSON,
      TE.map(trace('imgix metadata result', log)),
      TE.chain(
        flow(
          ImgixMetadata.decode,
          E.orElse(() =>
            E.left(new Error('Problem when decoding imgix metadata.')),
          ),
          TE.fromEither,
        ),
      ),
      TE.map(trace('decoded data', log)),
      TE.mapLeft(trace('imgix metadata error', log)),
    ),
  );
