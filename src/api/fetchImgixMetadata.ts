import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import fetch from 'node-fetch';
import { withCache } from '../common/cache';
import { IImgixURLBuilder } from '../common/imgix-js-core-wrapper';
import { createLogger, trace } from '../common/log';

const log = createLogger('fetchImgixMetadata');

export type IImgixMetadata = {
  'Content-Type': string;
  PixelWidth: number;
  PixelHeight: number;
};

/**
 * Fetch the metadata for a given image from the imgix API
 */
const fetchImgixMetadataAPI = async (
  rawURL: string,
  client: IImgixURLBuilder,
): Promise<IImgixMetadata> => {
  const url = client.buildURL(rawURL, { fm: 'json' });
  trace('imgix metadata url', log)(url);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Something went wrong while fetching the imgix metadata');
  }

  let json;
  try {
    json = (await res.json()) as IImgixMetadata;
  } catch (error) {
    throw new Error(
      'Something went wrong while decoding the imgix metadata: ' +
        String(error),
    );
  }
  trace('imgix metadata result', log)(json);

  return json;
};

/**
 * Fetch the metadata for a given image from the imgix API, and cache the result
 * @param cache Gatsby cache
 * @param client Instance of the imgix client
 * @returns The metadata, or an error
 */
export const fetchImgixMetadata = (
  cache: GatsbyCache,
  client: IImgixURLBuilder,
) => (url: string): TE.TaskEither<Error, IImgixMetadata> => {
  return TE.tryCatch(
    () =>
      withCache(`gatsby-plugin-imgix-metadata-${url}`, cache, () =>
        fetchImgixMetadataAPI(url, client),
      ),
    () => new Error(`Couldn't fetch imgix metadata for ${url}`),
  );
};
