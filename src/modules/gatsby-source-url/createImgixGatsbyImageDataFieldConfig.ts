import ImgixClient from '@imgix/js-core';
import { stripIndent } from 'common-tags';
import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import {
  generateImageData,
  getLowResolutionImageURL,
  IGatsbyImageData,
  IGatsbyImageHelperArgs,
  ImageFormat,
} from 'gatsby-plugin-image';
import { getGatsbyImageFieldConfig } from 'gatsby-plugin-image/graphql-utils';
import { GraphQLFieldResolver } from 'gatsby/graphql';
import {
  ComposeInputTypeDefinition,
  ObjectTypeComposerArgumentConfigMapDefinition,
  ObjectTypeComposerFieldConfigAsObjectDefinition,
} from 'graphql-compose';
import { TypeAsString } from 'graphql-compose/lib/TypeMapper';
import R from 'ramda';
import {
  fetchImgixBase64Image,
  fetchImgixDominantColor,
} from '../../api/fetchBase64Image';
import { createExternalHelper } from '../../common/createExternalHelper';
import { TaskOptionFromTE } from '../../common/fpTsUtils';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from '../../common/utils';
import { IImgixParams, ImgixUrlParams } from '../../publicTypes';
import { resolveDimensions } from './resolveDimensions';

const generateImageSource = (
  client: IImgixURLBuilder,
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
  defaultParams,
}: {
  imgixClient: IImgixURLBuilder;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number | undefined>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number | undefined>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
}): GraphQLFieldResolver<
  TSource,
  unknown,
  IImgixGatsbyImageDataArgsResolved
> => async (rootValue, args): Promise<IGatsbyImageData | undefined> => {
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
      .letL(
        'baseImageDataArgs',
        ({ url, dimensions: { width, height } }) =>
          ({
            ...args,
            pluginName: `@imgix/gatsby`,
            filename: url,
            sourceMetadata: { width, height, format: 'auto' as ImageFormat },
            // TODO: use breakpoints helper from gatsby-plugin-image hook
            breakpoints:
              args.breakpoints ??
              ImgixClient.targetWidths(
                args.srcSetMinWidth,
                args.srcSetMaxWidth,
                args.widthTolerance,
              ),
            formats: ['auto'] as ImageFormat[],
            generateImageSource: generateImageSource(imgixClient),
            options: {
              imgixParams: {
                ...defaultParams,
                ...args.imgixParams,
              },
            },
          } as const),
      )
      .bindL('placeholderData', ({ url, baseImageDataArgs }) => {
        if (args.placeholder === 'blurred') {
          return pipe(
            getLowResolutionImageURL({
              ...baseImageDataArgs,
              options: {
                ...baseImageDataArgs,
                imgixParams: {
                  ...defaultParams,
                  ...args.imgixParams,
                  ...args.placeholderImgixParams,
                },
              },
            }),
            fetchImgixBase64Image(cache),
            TE.map((base64Data) => ({
              placeholder: { fallback: base64Data },
            })),
          );
        }
        if (args.placeholder === 'dominantColor') {
          return pipe(
            fetchImgixDominantColor(cache)((params) =>
              imgixClient.buildURL(url, {
                ...defaultParams,
                ...args.imgixParams,
                ...args.placeholderImgixParams,
                ...params,
              }),
            ),
            TE.map((dominantColor) => ({
              backgroundColor: dominantColor,
            })),
          );
        }
        return TE.right({});
      })
      .return(({ baseImageDataArgs, placeholderData }) => ({
        ...generateImageData({
          ...baseImageDataArgs,
        }),
        ...placeholderData,
      })),
    TE.getOrElseW(() => T.of(undefined)),
  )();
};

export const createImgixGatsbyImageFieldConfig = <TSource, TContext = {}>({
  cache,
  imgixClient,
  resolveUrl,
  defaultParams,
  paramsInputType,
  placeholderEnumType,
  resolveWidth,
  resolveHeight,
}: {
  imgixClient: IImgixURLBuilder;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number | undefined>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number | undefined>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
  paramsInputType: ComposeInputTypeDefinition;
  placeholderEnumType: TypeAsString;
}): ObjectTypeComposerFieldConfigAsObjectDefinition<
  TSource,
  TContext,
  IImgixGatsbyImageDataArgsResolved
> => {
  const defaultConfig = getGatsbyImageFieldConfig(
    resolveGatsbyImageData({
      cache,
      imgixClient,
      resolveUrl,
      defaultParams,
      resolveWidth,
      resolveHeight,
    }) as GraphQLFieldResolver<TSource, TContext>, // TODO: remove cast when PR to Gatsby has been merged
    {},
  ) as ObjectTypeComposerFieldConfigAsObjectDefinition<
    TSource,
    TContext,
    IBuiltinGatsbyImageDataArgs
  >;

  const defaultArgs = defaultConfig.args as ObjectTypeComposerArgumentConfigMapDefinition<IBuiltinGatsbyImageDataArgs>;

  // ⚠️ KEEP THESE IN SYNC WITH IImgixGatsbyImageDataArgs!! ⚠️
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
        defaultArgs,
      ),
      imgixParams: {
        type: paramsInputType,
        description: stripIndent`This argument is used to set parameters to instruct imgix to transform the image. 
        
        All of imgix's parameters can be found here: https://docs.imgix.com/apis/rendering
        `,
      },
      placeholderImgixParams: {
        type: paramsInputType,
        description: stripIndent`This argument is used to set parameters to instruct imgix to transform the placeholder image. By default all parameters passed to 'imgixParams' are already set here, but this can be used to override or set extra parameters. 
        
        All of imgix's parameters can be found here: https://docs.imgix.com/apis/rendering
        `,
      },
      placeholder: {
        type: placeholderEnumType,
        description: stripIndent`
          Format of generated placeholder image, displayed while the main image loads.
          BLURRED: a blurred, low resolution image, encoded as a base64 data URI (default)
          DOMINANT_COLOR: a solid color, calculated from the dominant color of the image.
          NONE: no placeholder. Set "backgroundColor" to use a fixed background color.`,
      },
      widthTolerance: {
        type: 'Float',
        description: stripIndent`
          This argument affects the breakpoints used for the srcsets, dictates the maximum tolerated size difference between an image's downloaded size and its rendered size. For example: setting this value to 0.1 means that an image will not render more than 10% larger or smaller than its native size. In practice, the image URLs generated for a width-based srcset attribute will grow by twice this rate. A lower tolerance means images will render closer to their native size (thereby increasing perceived image quality), but a large srcset list will be generated and consequently users may experience lower rates of cache-hit for pre-rendered images on your site.

          By default this rate is set to 8 percent, which we consider to be the ideal rate for maximizing cache hits without sacrificing visual quality. Users can specify their own width tolerance by providing a positive scalar value as widthTolerance to the third options object:`,
        defaultValue: 0.08,
      },
      srcSetMinWidth: {
        type: 'Int',
        description: stripIndent`
          This argument determines the minimum srcset width that is generated. The default is 100px.
        `,
        defaultValue: 100,
      },
      srcSetMaxWidth: {
        type: 'Int',
        description: stripIndent`
          This argument determines the maximum srcset width that is generated, if the layout type is FULL_WIDTH. If the layout type is CONSTRAINED, the width argument will be used. Furthermore, in every case, the maximum srcset width is constrained by the width of the source image. The default is 8192px, which is the render limit of the imgix service.
        `,
        defaultValue: 8192,
      },
    },
  };

  return modifiedConfig;
};

type IBuiltinGatsbyImageDataArgs = {
  layout: IGatsbyImageHelperArgs['layout'];
  width: IGatsbyImageHelperArgs['width'];
  height: IGatsbyImageHelperArgs['height'];
  aspectRatio: IGatsbyImageHelperArgs['aspectRatio'];
  // outputPixelDensities: IGatsbyImageHelperArgs['outputPixelDensities'];
  breakpoints: IGatsbyImageHelperArgs['breakpoints'];
  sizes: IGatsbyImageHelperArgs['sizes'];
  backgroundColor: IGatsbyImageHelperArgs['backgroundColor'];
};

type IImgixGatsbyImageDataArgsResolved = {
  layout: IGatsbyImageHelperArgs['layout'];
  width: IGatsbyImageHelperArgs['width'];
  height: IGatsbyImageHelperArgs['height'];
  aspectRatio: IGatsbyImageHelperArgs['aspectRatio'];
  // outputPixelDensities: IGatsbyImageHelperArgs['outputPixelDensities'];
  breakpoints: IGatsbyImageHelperArgs['breakpoints'];
  sizes: IGatsbyImageHelperArgs['sizes'];
  backgroundColor: IGatsbyImageHelperArgs['backgroundColor'];
  imgixParams?: ImgixUrlParams;
  placeholderImgixParams?: ImgixUrlParams;
  placeholder?: 'dominantColor' | 'blurred' | 'none';
  widthTolerance?: number;
  srcSetMinWidth?: number;
  srcSetMaxWidth?: number;
};

export const createImgixGatsbyImageSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixGatsbyImageFieldConfig>[0],
  typeof createImgixGatsbyImageFieldConfig
>(createImgixGatsbyImageFieldConfig);
