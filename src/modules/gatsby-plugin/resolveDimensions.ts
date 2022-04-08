import { sequenceS, sequenceT } from 'fp-ts/Apply';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import { fetchImgixMetadata } from '../../api/fetchImgixMetadata';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { createLogger, traceJSON } from '../../common/log';

const sequenceTTE = sequenceT(TE.taskEither);
const sequenceSO = sequenceS(O.option);

const log = createLogger('resolveDimensions');
// TODO: maybe use io-ts PositiveNumber
export type IResolveDimensionsRight = { width: number; height: number };

/**
 * Calculate the dimensions of an image, using manual dimensions, if provided,
 * or otherwise by using the imgix API
 * @param param0
 * @param param0.url The URL of the image
 * @param param0.manualWidth The width of the image, if known
 * @param param0.manualHeight The height of the image, if known
 * @param param0.cache Gatsby cache
 * @param param0.client Instance of the imgix client
 * @returns The width and height of the image, or an error
 */
export const resolveDimensions = <TSource>({
  url,
  manualHeight,
  manualWidth,
  cache,
  client,
}: {
  manualHeight?: number;
  manualWidth?: number;
  cache: GatsbyCache;
  url: string;
  client: IImgixURLBuilder;
}): TE.TaskEither<Error, IResolveDimensionsRight> => {
  if (manualWidth != null && manualHeight != null) {
    traceJSON(
      { manualWidth: manualWidth, manualHeight: manualHeight },
      'manual dimensions used',
      log,
    );
    return TE.right({
      width: manualWidth,
      height: manualHeight,
    });
  }

  return TE.tryCatch(
    async () => {
      log(
        'no manual dimensions found, fetching image dimensions from imgix API',
      );

      const { PixelWidth, PixelHeight } = await fetchImgixMetadata(
        cache,
        client,
      )(url);

      traceJSON({ PixelWidth, PixelHeight }, 'metadata result', log);

      return {
        width: PixelWidth,
        height: PixelHeight,
      };
    },
    () => new Error('Something went wrong fetching the image metadata'),
  );
};
