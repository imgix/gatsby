import { sequenceS } from 'fp-ts/lib/Apply';
import { flow } from 'fp-ts/lib/function';
import { none, Option, some } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { taskEither } from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import { GraphQLFieldConfig, GraphQLInt, GraphQLList } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { trace } from './common/log';
import {
  createGatsbySourceImgixFluidFieldType,
  ImgixUrlParamsInputType,
} from './graphqlTypes';
import { buildFluidObject } from './objectBuilders';
import { ImgixFluidArgsResolved, ImgixUrlArgs } from './publicTypes';
import { resolveDimensions } from './resolveDimensions';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from './utils';

const sequenceSTE = sequenceS(taskEither);
const sequenceST = sequenceS(T.task);

const DEFAULT_FLUID_MAX_WIDTH = 8192;

interface CreateImgixFluidFieldConfigArgs<TSource> {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number>;
  cache: GatsbyCache;
}

export const createImgixFluidFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  resolveWidth = () => undefined,
  resolveHeight = () => undefined,
  cache,
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
    // TODO: handle
    placeholderImgixParams: {
      type: ImgixUrlParamsInputType,
      defaultValue: {},
    },
  },
  resolve: (
    rootValue: TSource,
    args: ImgixFluidArgsResolved,
  ): Promise<FluidObject | undefined> => {
    const urlTE = resolveUrlFromSourceData(resolveUrl)(rootValue);

    const TaskOptionFromTE = <T>(
      taskEither: TE.TaskEither<any, T>,
    ): T.Task<Option<T>> =>
      TE.fold<any, T, Option<T>>(
        () => T.of(none),
        flow(some, T.of),
      )(taskEither);

    const manualImageDimensionsTaskOption = pipe(
      sequenceST({
        manualWidth: pipe(
          taskEitherFromSourceDataResolver(resolveWidth)(rootValue),
          TaskOptionFromTE,
        ),
        manualHeight: pipe(
          taskEitherFromSourceDataResolver(resolveHeight)(rootValue),
          TaskOptionFromTE,
        ),
      }),
    );

    // Find image dimensions
    const imageDimensionsTE = pipe(
      sequenceSTE({
        manualImageDimensions: TE.fromTask(manualImageDimensionsTaskOption),
        url: urlTE,
      }),
      TE.chain(
        /* <
      Error,
      string,
      IResolveDimensionsRight
    > */ ({
          url,
          manualImageDimensions: { manualWidth, manualHeight },
        }) =>
          resolveDimensions({
            url,
            manualHeight,
            manualWidth,
            cache,
            client: imgixClient,
          }),
      ),
      TE.map(trace('resolveDimensions result')),
    );

    // Build fluid object
    const promiseFactory = pipe(
      sequenceSTE({ imageDimensions: imageDimensionsTE, url: urlTE }),
      TE.map(({ imageDimensions: { width, height }, url }) =>
        buildFluidObject({
          client: imgixClient,
          args,
          sourceHeight: height,
          sourceWidth: width,
          url,
        }),
      ),
      TE.getOrElseW(() => T.of(undefined)),
    );

    return promiseFactory();
  },
});

export const createImgixFluidSchemaFieldConfig = <TSource, TContext>(
  args: CreateImgixFluidFieldConfigArgs<TSource>,
): ComposeFieldConfigAsObject<TSource, TContext, ImgixUrlArgs> =>
  createImgixFluidFieldConfig(args) as ComposeFieldConfigAsObject<
    TSource,
    TContext,
    ImgixUrlArgs
  >;
