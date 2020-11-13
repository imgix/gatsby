import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from '../../../types/node_modules/gatsby';
import { withCache } from '../modules/gatsby-source-url/cache';
import { fetch } from '../modules/gatsby-source-url/utils';

export const buildBase64URL = (contentType: string, base64: string): string =>
  `data:${contentType};base64,${base64}`;

export const fetchImgixBase64Image = (cache: GatsbyCache) => (
  url: string,
): TE.TaskEither<Error, string> =>
  withCache(`gatsby-plugin-imgix-base64-url-${url}`, cache, () =>
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
