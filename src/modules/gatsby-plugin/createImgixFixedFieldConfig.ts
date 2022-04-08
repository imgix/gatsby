import { GatsbyCache } from 'gatsby';
import { FixedObject } from 'gatsby-image';
import {
  ComposeInputTypeDefinition,
  ObjectTypeComposerFieldConfigAsObjectDefinition,
} from 'graphql-compose';
import { createExternalHelper } from '../../common/createExternalHelper';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { ImgixSourceDataResolver } from '../../common/utils';
import { IImgixParams } from '../../publicTypes';
import { unTransformParams } from './graphqlTypes';
import { buildImgixFixed } from './objectBuilders';
import { ImgixFixedArgsResolved } from './privateTypes';
import { resolveDimensions } from './resolveDimensions';

// This is the max size that imgix can render
export const DEFAULT_FIXED_WIDTH = 8192;

interface CreateImgixFixedFieldConfigArgs<TSource> {
  imgixClient: IImgixURLBuilder;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number | undefined>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number | undefined>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
  type: string;
  paramsInputType: ComposeInputTypeDefinition;
}

/**
 * Create the GraphQL field config for the "fixed" field that will exist on the
 * imgixImage type
 * @param param0
 * @param param0.imgixClient The imgix client to use to build the URL
 * @param param0.resolveUrl The function to resolve the URL from the source data
 * @param param0.resolveWidth A function should should resolve the width from the source data. If not provided, the imgix api will be used to find the image width
 * @param param0.resolveHeight A function should should resolve the height from the source data. If not provided, the imgix api will be used to find the image height
 * @param param0.cache Gatsby cache
 * @param param0.defaultParams The default params to use when building the fixed image URL
 * @param param0.type The GraphQL type to use for the fixed field
 * @param param0.paramsInputType The GraphQL type to use for the params input
 * @returns A GraphQL field config for a "fixed" size image
 */
export const createImgixFixedFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  resolveWidth = () => undefined,
  resolveHeight = () => undefined,
  cache,
  defaultParams,
  type,
  paramsInputType,
}: CreateImgixFixedFieldConfigArgs<TSource>): ObjectTypeComposerFieldConfigAsObjectDefinition<
  TSource,
  TContext,
  ImgixFixedArgsResolved
> => ({
  type,
  description: `Should be used to generate fixed-width images (i.e. the size of the image doesn't change when the size of the browser changes, and are "fixed"). Returns data compatible with gatsby-image. Instead of accessing this data directly, the GatsbySourceImgixFixed fragment should be used. See the project's README for more information.`,
  args: {
    width: {
      type: 'Int',
      description: `The fixed image width to render, in px.`,
      defaultValue: DEFAULT_FIXED_WIDTH,
    },
    height: {
      type: 'Int',
      description: `The fixed image height to render, in px.`,
    },
    quality: {
      type: 'Int',
      description: `The image quality to use for compression. Range: 0-100, with 100 being highest quality. This setting is not recommended as the quality is already optimized by decreasing quality as the dpr increases to reduce image size while retaining visual quality.`,
    },
    imgixParams: {
      type: paramsInputType,
      description: `The imgix parameters (transformations) to apply to the image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url`,
      defaultValue: {},
    },
    placeholderImgixParams: {
      type: paramsInputType,
      description: `Any imgix parameters to use only for the blur-up/placeholder image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url`,
      defaultValue: {},
    },
  },
  resolve: async (
    rootValue: TSource,
    args: ImgixFixedArgsResolved,
  ): Promise<FixedObject | undefined> => {
    const modifiedArgs = {
      ...args,
      imgixParams: unTransformParams(args.imgixParams),
    };
    const url = await resolveUrl(rootValue);
    if (!url) {
      return undefined;
    }
    const manualWidth = await resolveWidth(rootValue);
    const manualHeight = await resolveHeight(rootValue);

    const { width, height } = await resolveDimensions({
      url,
      manualWidth: manualWidth,
      manualHeight: manualHeight,
      cache,
      client: imgixClient,
    });

    return buildImgixFixed({
      client: imgixClient,
      url,
      sourceWidth: width,
      sourceHeight: height,
      args: modifiedArgs,
      defaultParams,
      defaultPlaceholderParams: {}, // TODO: implement
    });
  },
});

export const createImgixFixedSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixFixedFieldConfig>[0],
  typeof createImgixFixedFieldConfig
>(createImgixFixedFieldConfig);
