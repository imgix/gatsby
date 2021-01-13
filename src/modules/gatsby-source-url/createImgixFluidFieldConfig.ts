import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import { GraphQLFieldConfig, GraphQLInt, GraphQLList } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { TaskOptionFromTE } from '../../common/fpTsUtils';
import {
  createImgixFluidType,
  ImgixUrlParamsInputType,
} from './graphqlTypes';
import { buildFluidObject } from './objectBuilders';
import {
  IImgixParams,
  ImgixFluidArgs,
  ImgixFluidArgsResolved,
} from '../../publicTypes';
import { resolveDimensions } from './resolveDimensions';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from '../../common/utils';

const DEFAULT_FLUID_MAX_WIDTH = 8192;

interface CreateImgixFluidFieldConfigArgs<TSource> {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
}

export const createImgixFluidFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  resolveWidth = () => undefined,
  resolveHeight = () => undefined,
  cache,
  defaultParams,
}: CreateImgixFluidFieldConfigArgs<TSource>): GraphQLFieldConfig<
  TSource,
  TContext,
  ImgixFluidArgsResolved
> => ({
  type: createImgixFluidType(cache),
  description: `Should be used to generate fluid-width images (i.e. images that change when the size of the browser changes). Returns data compatible with gatsby-image. Instead of accessing this data directly, the GatsbySourceImgixFluid fragment should be used. See the project's README for more information.`,
  args: {
    imgixParams: {
      type: ImgixUrlParamsInputType,
      description: `The imgix parameters (transformations) to apply to the image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url`,
      defaultValue: {},
    },
    maxWidth: {
      type: GraphQLInt,
      description: `The maximum px width of the *image* to be *requested*. This does NOT affect the width of the image displayed.`, // TODO: add info about how to constrain width
      defaultValue: DEFAULT_FLUID_MAX_WIDTH,
    },
    maxHeight: {
      description: `The maximum px height of the *image* to be *requested*. This does NOT affect the height of the image displayed.`,
      type: GraphQLInt,
    },
    srcSetBreakpoints: {
      type: new GraphQLList(GraphQLInt),
      description: `A custom set of widths (in px) to use for the srcset widths. This feature is not recommended as the default widths are optimized for imgix's caching infrastructure.`,
    },
    placeholderImgixParams: {
      type: ImgixUrlParamsInputType,
      description: `Any imgix parameters to use only for the blur-up/placeholder image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url`,
      defaultValue: {},
    },
  },
  resolve: (
    rootValue: TSource,
    args: ImgixFluidArgsResolved,
  ): Promise<FluidObject | undefined> =>
    pipe(
      Do(TE.taskEither)
        .let('rootValue', rootValue)
        .sequenceSL(({ rootValue }) => ({
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
          buildFluidObject({
            client: imgixClient,
            args,
            sourceHeight: height,
            sourceWidth: width,
            url,
            defaultParams,
            defaultPlaceholderParams: {}, // TODO: implement
          }),
        ),

      TE.getOrElseW(() => T.of(undefined)),
    )(),
});

export const createImgixFluidSchemaFieldConfig = <TSource, TContext>(
  args: CreateImgixFluidFieldConfigArgs<TSource>,
): ComposeFieldConfigAsObject<TSource, TContext, ImgixFluidArgs> =>
  createImgixFluidFieldConfig(args) as ComposeFieldConfigAsObject<
    TSource,
    TContext,
    ImgixFluidArgs
  >;
