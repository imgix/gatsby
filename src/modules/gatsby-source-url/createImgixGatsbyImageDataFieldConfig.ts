import { stripIndent } from 'common-tags';
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
import {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLFloat,
  GraphQLInt,
  GraphQLObjectType,
} from 'gatsby/graphql';
import ImgixClient from 'imgix-core-js';
import R from 'ramda';
import { TaskOptionFromTE } from '../../common/fpTsUtils';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from '../../common/utils';
import { IImgixParams } from '../../publicTypes';
import { ImgixParamsInputType } from './graphqlTypes';
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
          // TODO: not a public API, need to replace with public API when implemented
          breakpoints:
            args.breakpoints ??
            (imgixClient as any)._generateTargetWidths(
              args.widthTolerance,
              args.srcSetMinWidth,
              args.srcSetMaxWidth,
            ),
          // breakpoints
          formats: ['auto'],
          generateImageSource: generateImageSource(imgixClient),
          options: args,
        }),
      ),
    TE.getOrElseW(() => T.of(undefined)),
  )();
};

export const createImgixGatsbyImageFieldConfig = <TSource, TContext = {}>({
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
}): GraphQLFieldConfig<TSource, TContext> => {
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
      imgixParams: {
        type: ImgixParamsInputType,
        description: stripIndent`This argument is used to set parameters to instruct imgix to transform the image. 
        
        All of imgix's parameters can be found here: https://docs.imgix.com/apis/rendering
        `,
      },
      widthTolerance: {
        type: GraphQLFloat,
        description: stripIndent`
          This argument affects the breakpoints used for the srcsets, dictates the maximum tolerated size difference between an image's downloaded size and its rendered size. For example: setting this value to 0.1 means that an image will not render more than 10% larger or smaller than its native size. In practice, the image URLs generated for a width-based srcset attribute will grow by twice this rate. A lower tolerance means images will render closer to their native size (thereby increasing perceived image quality), but a large srcset list will be generated and consequently users may experience lower rates of cache-hit for pre-rendered images on your site.

          By default this rate is set to 8 percent, which we consider to be the ideal rate for maximizing cache hits without sacrificing visual quality. Users can specify their own width tolerance by providing a positive scalar value as widthTolerance to the third options object:`,
        defaultValue: 0.08,
      },
      srcSetMinWidth: {
        type: GraphQLInt,
        description: stripIndent`
          This argument determines the minimum srcset width that is generated. The default is 100px.
        `,
        defaultValue: 100,
      },
      srcSetMaxWidth: {
        type: GraphQLInt,
        description: stripIndent`
          This argument determines the maximum srcset width that is generated, if the layout type is FULL_WIDTH. If the layout type is CONSTRAINED, the width argument will be used. Furthermore, in every case, the maximum srcset width is constrained by the width of the source image. The default is 8192px, which is the render limit of the imgix service.
        `,
        defaultValue: 8192,
      },
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
