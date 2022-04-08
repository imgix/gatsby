import { stripIndent } from 'common-tags';
import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import {
  generateImageData,
  getLowResolutionImageURL,
  IGatsbyImageData,
  IGatsbyImageHelperArgs,
} from 'gatsby-plugin-image';
import { getGatsbyImageFieldConfig } from 'gatsby-plugin-image/graphql-utils';
import { GraphQLFieldResolver } from 'gatsby/graphql';
import {
  ComposeInputTypeDefinition,
  ObjectTypeComposerArgumentConfigMapDefinition,
  ObjectTypeComposerFieldConfigAsObjectDefinition,
} from 'graphql-compose';
import { TypeAsString } from 'graphql-compose/lib/TypeMapper';
import { pick } from 'ramda';
import {
  fetchImgixBase64Image,
  fetchImgixDominantColor,
} from '../../api/fetchBase64Image';
import { createExternalHelper } from '../../common/createExternalHelper';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { ImgixSourceDataResolver } from '../../common/utils';
import { IImgixParams } from '../../publicTypes';
import { buildGatsbyImageDataBaseArgs } from './buildGatsbyImageDataBaseArgs';
import { unTransformParams } from './graphqlTypes';
import { IImgixGatsbyImageDataArgsResolved } from './privateTypes';
import {
  IResolveDimensionsRight,
  resolveDimensions,
} from './resolveDimensions';

/**
 * Resolve gatsby image data for a given node
 * @param param0
 * @param param0.resolveUrl Function that returns the url or a Promise containing the url for the given node
 * @param param0.imgixClient An instance of an imgix client
 * @param param0.resolveHeight Function that returns the height of the image, if given in the source data, to prevent unnecessary data fetching
 * @param param0.resolveWidth Function that returns the width of the image, if given in the source data, to prevent unnecessary data fetching
 * @param param0.cache The Gatsby cache helper
 * @param param0.defaultParams The default imgix params to set on the image requested
 * @returns A GraphQL resolver (a function that accepts the node value and args, and returns gatsby image data in a Promise)
 */
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
> => async (
  rootValue,
  unsafeResolverArgs,
): Promise<IGatsbyImageData | undefined> => {
  try {
    const url = await resolveUrl(rootValue);
    if (!url) {
      return undefined;
    }
    const manualWidth = await resolveWidth(rootValue);
    const manualHeight = await resolveHeight(rootValue);

    const safeResolverArgs = {
      ...unsafeResolverArgs,
      imgixParams: unTransformParams(unsafeResolverArgs.imgixParams ?? {}),
      placeholderImgixParams: unTransformParams(
        unsafeResolverArgs.placeholderImgixParams ?? {},
      ),
    };

    const dimensions = await TE.getOrElseW<Error, IResolveDimensionsRight>(
      () => {
        throw new Error('Something went wrong while resolving dimensions');
      },
    )(
      resolveDimensions({
        url,
        manualHeight: O.fromNullable(manualHeight),
        manualWidth: O.fromNullable(manualWidth),
        cache,
        client: imgixClient,
      }),
    )();

    const baseImageDataArgs = buildGatsbyImageDataBaseArgs({
      url,
      dimensions,
      resolverArgs: safeResolverArgs,
      defaultParams,
      imgixClient,
    });

    // Here we create our own placeholder data since
    // buildGatsbyImageDataBaseArgs won't create placeholder information for us
    const placeholderData = await generatePlaceHolderData({
      safeResolverArgs,
      baseImageDataArgs,
      cache,
      defaultParams,
      imgixClient,
      url,
    });

    return {
      ...generateImageData({
        ...baseImageDataArgs,
      }),
      ...placeholderData,
    };
  } catch (error) {
    return undefined;
  }
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
      ...pick(
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
  layout?: IGatsbyImageHelperArgs['layout'];
  width?: IGatsbyImageHelperArgs['width'];
  height?: IGatsbyImageHelperArgs['height'];
  aspectRatio?: IGatsbyImageHelperArgs['aspectRatio'];
  // outputPixelDensities: IGatsbyImageHelperArgs['outputPixelDensities'];
  breakpoints?: IGatsbyImageHelperArgs['breakpoints'];
  sizes?: IGatsbyImageHelperArgs['sizes'];
  backgroundColor?: IGatsbyImageHelperArgs['backgroundColor'];
};

export const createImgixGatsbyImageSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixGatsbyImageFieldConfig>[0],
  typeof createImgixGatsbyImageFieldConfig
>(createImgixGatsbyImageFieldConfig);

/**
 * Create placeholder data which is compatible with the gatsby image data
 * placeholder format.
 */
async function generatePlaceHolderData({
  safeResolverArgs,
  baseImageDataArgs,
  cache,
  defaultParams,
  imgixClient,
  url,
}: {
  safeResolverArgs: IImgixGatsbyImageDataArgsResolved;
  baseImageDataArgs: ReturnType<typeof buildGatsbyImageDataBaseArgs>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
  imgixClient: IImgixURLBuilder;
  url: string;
}): Promise<
  { placeholder: { fallback: string } } | { backgroundColor: string } | {}
> {
  if (safeResolverArgs.placeholder === 'blurred') {
    const lowResImageUrl = getLowResolutionImageURL({
      ...baseImageDataArgs,
      options: {
        ...baseImageDataArgs,
        imgixParams: {
          ...defaultParams,
          ...safeResolverArgs.imgixParams,
          ...safeResolverArgs.placeholderImgixParams,
        },
      },
    });

    const base64Data = await TE.getOrElse<Error, string>(() => {
      throw new Error();
    })(fetchImgixBase64Image(cache)(lowResImageUrl))();

    return {
      placeholder: { fallback: base64Data },
    };
  } else if (safeResolverArgs.placeholder === 'dominantColor') {
    const dominantColor = await TE.getOrElse<Error, string>(() => {
      throw '';
    })(
      fetchImgixDominantColor(cache)((params) =>
        imgixClient.buildURL(url, {
          ...defaultParams,
          ...safeResolverArgs.imgixParams,
          ...safeResolverArgs.placeholderImgixParams,
          ...params,
        }),
      ),
    )();
    return {
      backgroundColor: dominantColor,
    };
  }
  return {};
}
