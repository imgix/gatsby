import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import {
  generateImageData,
  IGatsbyImageData,
  IGatsbyImageHelperArgs,
} from 'gatsby-plugin-image';
import { getGatsbyImageFieldConfig } from 'gatsby-plugin-image/graphql-utils';
import { GraphQLFieldResolver, GraphQLObjectType } from 'gatsby/graphql';
import ImgixClient from 'imgix-core-js';
import R from 'ramda';
import { TaskOptionFromTE } from '../../common/fpTsUtils';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from '../../common/utils';
import { IImgixParams } from '../../publicTypes';
import { resolveDimensions } from './resolveDimensions';

/* const fitMap = {
  cover: ,
  contain: ,
  fill: ,
  inside: ,
  outside: ,

} */

const generateImageSource = (
  client: ImgixClient,
): IGatsbyImageHelperArgs['generateImageSource'] => (
  imageName,
  width,
  height,
  format,
  fit,
  opts = {},
) => {
  const src = client.buildURL(imageName, {
    w: width,
    h: height,
    ...(typeof opts.imgixParams === 'object' && opts.imgixParams),
  });
  return { width, height, format: 'auto', src };
};

const resolveGatsbyImageData = <TSource>({
  resolveUrl,
  imgixClient,
  resolveWidth = () => undefined,
  resolveHeight = () => undefined,
  cache,
}: {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
  type?: GraphQLObjectType<FluidObject>;
}): GraphQLFieldResolver<TSource, unknown, Record<string, unknown>> => async (
  rootValue,
  args,
): Promise<IGatsbyImageData | undefined> => {
  console.log('args', args);
  return pipe(
    Do(TE.taskEither)
      .sequenceSL(() => ({
        url: resolveUrlFromSourceData(resolveUrl)(rootValue),
        manualWidth: pipe(
          taskEitherFromSourceDataResolver(resolveWidth)(rootValue),
          TaskOptionFromTE,
          TE.fromTask,
        ),
        manualHeight: pipe(
          taskEitherFromSourceDataResolver(resolveHeight)(rootValue),
          TaskOptionFromTE,
          TE.fromTask,
        ),
      }))
      .bindL('dimensions', ({ url, manualWidth, manualHeight }) =>
        resolveDimensions({
          url,
          manualHeight,
          manualWidth,
          cache,
          client: imgixClient,
        }),
      )
      .return(({ url, dimensions: { width, height } }) =>
        generateImageData({
          ...args,
          pluginName: `@imgix/gatsby`,
          filename: url,
          sourceMetadata: { width, height, format: 'auto' },
          // placeholderURL: await getBase64Image({ baseUrl }),
          // TODO: implement breakpoints
          // breakpoints
          formats: ['auto'],
          generateImageSource: generateImageSource(imgixClient),
          options: args,
        }),
      ),
    TE.getOrElseW(() => T.of(undefined)),
  )();
};

export const createImgixGatsbyImageFieldConfig = <TSource>({
  cache,
  imgixClient,
  resolveUrl,
  defaultParams,
}: {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
  type?: GraphQLObjectType<FluidObject>;
}) => {
  const defaultConfig = getGatsbyImageFieldConfig(
    resolveGatsbyImageData({ cache, imgixClient, resolveUrl, defaultParams }),
    {},
  );

  // TODO: add section to README about deleted args
  const modifiedConfig = {
    ...defaultConfig,
    args: {
      ...R.pick(
        [
          'layout',
          'width',
          'height',
          'aspectRatio',
          'outputPixelDensities',
          'breakpoints',
          'sizes',
          'backgroundColor',
        ],
        defaultConfig.args,
      ),
      // TODO: add placeholder
    },
  };

  return modifiedConfig;
};

type IImgixGatsbyImageDataArgs = {
  layout: IGatsbyImageHelperArgs['layout'];
  width: IGatsbyImageHelperArgs['width'];
  height: IGatsbyImageHelperArgs['height'];
  aspectRatio: IGatsbyImageHelperArgs['aspectRatio'];
  // outputPixelDensities: IGatsbyImageHelperArgs['outputPixelDensities'];
  breakpoints: IGatsbyImageHelperArgs['breakpoints'];
  sizes: IGatsbyImageHelperArgs['sizes'];
  backgroundColor: IGatsbyImageHelperArgs['backgroundColor'];
};

/**
 * - Set formats to ['auto']
 */
