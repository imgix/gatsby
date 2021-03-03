import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
} from 'gatsby/graphql';
import { ObjectTypeComposerAsObjectDefinition } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { TaskOptionFromTE } from '../../common/fpTsUtils';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from '../../common/utils';
import { IImgixParams, ImgixFluidArgsResolved } from '../../publicTypes';
import {
  createImgixFluidType,
  ImgixParamsInputType,
  unTransformParams,
} from './graphqlTypes';
import { buildFluidObject } from './objectBuilders';
import { resolveDimensions } from './resolveDimensions';

const DEFAULT_FLUID_MAX_WIDTH = 8192;

interface CreateImgixFluidFieldConfigArgs<TSource> {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
  type?: GraphQLObjectType<FluidObject>;
}

export const createImgixFluidFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  resolveWidth = () => undefined,
  resolveHeight = () => undefined,
  cache,
  defaultParams,
  type,
}: CreateImgixFluidFieldConfigArgs<TSource>): GraphQLFieldConfig<
  TSource,
  TContext,
  ImgixFluidArgsResolved
> => ({
  type:
    type ??
    createImgixFluidType({
      cache,
    }),
  description: `Should be used to generate fluid-width images (i.e. images that change when the size of the browser changes). Returns data compatible with gatsby-image. Instead of accessing this data directly, the GatsbySourceImgixFluid fragment should be used. See the project's README for more information.`,
  args: {
    imgixParams: {
      type: ImgixParamsInputType,
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
      type: ImgixParamsInputType,
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
        .let('modifiedArgs', {
          ...args,
          imgixParams: unTransformParams(args.imgixParams),
        })
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
        .return(({ url, modifiedArgs, dimensions: { width, height } }) =>
          buildFluidObject({
            client: imgixClient,
            args: modifiedArgs,
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
): ObjectTypeComposerAsObjectDefinition<TSource, TContext> =>
  ({
    ...createImgixFluidFieldConfig(args),
    name: 'ImgixGatsbyFluid',
  } as ObjectTypeComposerAsObjectDefinition<TSource, TContext>);
