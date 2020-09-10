import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import { GraphQLFieldConfig, GraphQLInt, GraphQLList } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { TaskOptionFromTE } from './common/fpTsUtils';
import {
  createGatsbySourceImgixFluidFieldType,
  ImgixUrlParamsInputType,
} from './graphqlTypes';
import { buildFluidObject } from './objectBuilders';
import {
  IImgixParams,
  ImgixFluidArgs,
  ImgixFluidArgsResolved,
} from './publicTypes';
import { resolveDimensions } from './resolveDimensions';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from './utils';

const DEFAULT_FLUID_MAX_WIDTH = 8192;

interface CreateImgixFluidFieldConfigArgs<TSource> {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number>;
  cache: GatsbyCache;
  defaultParams: Partial<IImgixParams>;
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
  type: createGatsbySourceImgixFluidFieldType(cache),
  args: {
    imgixParams: {
      type: ImgixUrlParamsInputType,
      defaultValue: {},
    },
    maxWidth: {
      type: GraphQLInt,
      defaultValue: DEFAULT_FLUID_MAX_WIDTH,
    },
    maxHeight: {
      type: GraphQLInt,
    },
    srcSetBreakpoints: {
      type: new GraphQLList(GraphQLInt),
    },
    placeholderImgixParams: {
      type: ImgixUrlParamsInputType,
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
