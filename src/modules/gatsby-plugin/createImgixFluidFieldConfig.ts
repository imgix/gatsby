import { GatsbyCache } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import {
  ComposeInputTypeDefinition,
  ObjectTypeComposerFieldConfigAsObjectDefinition,
} from 'graphql-compose';
import { createExternalHelper } from '../../common/createExternalHelper';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { ImgixSourceDataResolver } from '../../common/utils';
import { IImgixParams } from '../../publicTypes';
import { unTransformParams } from './graphqlTypes';
import { buildFluidObject } from './objectBuilders';
import { ImgixFluidArgsResolved } from './privateTypes';
import { resolveDimensions } from './resolveDimensions';

const DEFAULT_FLUID_MAX_WIDTH = 8192;

interface CreateImgixFluidFieldConfigArgs<TSource> {
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
 * Create the GraphQL field config for the "fluid" field that will exist on the
 * imgixImage type
 * @param param0
 * @param param0.imgixClient The imgix client to use to build the URL
 * @param param0.resolveUrl The function to resolve the URL from the source data
 * @param param0.resolveWidth A function should should resolve the width from the source data. If not provided, the imgix api will be used to find the image width
 * @param param0.resolveHeight A function should should resolve the height from the source data. If not provided, the imgix api will be used to find the image height
 * @param param0.cache Gatsby cache
 * @param param0.defaultParams The default params to use when building the fixed image URL
 * @param param0.type The GraphQL type to use for the fluid field
 * @param param0.paramsInputType The GraphQL type to use for the params input
 * @returns A GraphQL field config for a "fluid" size image
 */
export const createImgixFluidFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  resolveWidth = () => undefined,
  resolveHeight = () => undefined,
  cache,
  defaultParams,
  type,
  paramsInputType,
}: CreateImgixFluidFieldConfigArgs<TSource>): ObjectTypeComposerFieldConfigAsObjectDefinition<
  TSource,
  TContext,
  ImgixFluidArgsResolved
> => ({
  type: type,
  description: `Should be used to generate fluid-width images (i.e. images that change when the size of the browser changes). Returns data compatible with gatsby-image. Instead of accessing this data directly, the GatsbySourceImgixFluid fragment should be used. See the project's README for more information.`,
  args: {
    imgixParams: {
      type: paramsInputType,
      description: `The imgix parameters (transformations) to apply to the image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url`,
      defaultValue: {},
    },
    maxWidth: {
      type: 'Int',
      description: `The maximum px width of the *image* to be *requested*. This does NOT affect the width of the image displayed. The width of the image displayed can be controlled by adding a sizes parameter to the GatsbyImage component. For more information, see this project's readme.`,
      defaultValue: DEFAULT_FLUID_MAX_WIDTH,
    },
    maxHeight: {
      description: `The maximum px height of the *image* to be *requested*. This does NOT affect the height of the image displayed.`,
      type: 'Int',
    },
    srcSetBreakpoints: {
      type: '[Int]',
      description: `A custom set of widths (in px) to use for the srcset widths. This feature is not recommended as the default widths are optimized for imgix's caching infrastructure.`,
    },
    placeholderImgixParams: {
      type: paramsInputType,
      description: `Any imgix parameters to use only for the blur-up/placeholder image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url`,
      defaultValue: {},
    },
  },
  resolve: async (
    rootValue: TSource,
    args: ImgixFluidArgsResolved,
  ): Promise<FluidObject | undefined> => {
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

    return buildFluidObject({
      client: imgixClient,
      args: modifiedArgs,
      sourceHeight: height,
      sourceWidth: width,
      url,
      defaultParams,
      defaultPlaceholderParams: {}, // TODO: implement
    });
  },
});

export const createImgixFluidSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixFluidFieldConfig>[0],
  typeof createImgixFluidFieldConfig
>(createImgixFluidFieldConfig);
