import { GatsbyCache } from 'gatsby';
import { fetchImgixMetadata } from '../../api/fetchImgixMetadata';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { createLogger, traceJSON } from '../../common/log';

const log = createLogger('resolveDimensions');

export type IResolvedDimensions = { width: number; height: number };

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
export const resolveDimensions = async ({
  url,
  manualHeight,
  manualWidth,
  cache,
  client,
}: {
  manualHeight?: number | null;
  manualWidth?: number | null;
  cache: GatsbyCache;
  url: string;
  client: IImgixURLBuilder;
}): Promise<IResolvedDimensions> => {
  if (manualWidth != null && manualHeight != null) {
    traceJSON(
      { manualWidth: manualWidth, manualHeight: manualHeight },
      'manual dimensions used',
      log,
    );
    return {
      width: manualWidth,
      height: manualHeight,
    };
  }
  try {
    log('no manual dimensions found, fetching image dimensions from imgix API');

    const { PixelWidth, PixelHeight } = await fetchImgixMetadata(
      cache,
      client,
    )(url);

    traceJSON({ PixelWidth, PixelHeight }, 'metadata result', log);

    return {
      width: PixelWidth,
      height: PixelHeight,
    };
  } catch (error) {
    throw new Error('Something went wrong fetching the image metadata');
  }
};
