import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FixedObject } from 'gatsby-image';
import { GraphQLFieldConfig, GraphQLInt } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { TaskOptionFromTE } from './common/fpTsUtils';
import {
  createGatsbySourceImgixFixedFieldType,
  ImgixUrlParamsInputType,
} from './graphqlTypes';
import { buildImgixFixed } from './objectBuilders';
import { ImgixFixedArgs, ImgixFixedArgsResolved } from './publicTypes';
import { resolveDimensions } from './resolveDimensions';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from './utils';

export const DEFAULT_FIXED_WIDTH = 8192;

interface CreateImgixFixedFieldConfigArgs<TSource> {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number>;
  cache: GatsbyCache;
}

export const createImgixFixedFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  resolveWidth = () => undefined,
  resolveHeight = () => undefined,
  cache,
}: CreateImgixFixedFieldConfigArgs<TSource>): GraphQLFieldConfig<
  TSource,
  TContext,
  ImgixFixedArgsResolved
> => ({
  type: createGatsbySourceImgixFixedFieldType(cache),
  args: {
    width: {
      type: GraphQLInt,
      // TODO: refactor to TS default args for type safety and functionality ()
      defaultValue: DEFAULT_FIXED_WIDTH,
    },
    height: {
      type: GraphQLInt,
    },
    quality: {
      type: GraphQLInt,
    },
    imgixParams: {
      type: ImgixUrlParamsInputType,
      defaultValue: {},
    },
    placeholderImgixParams: {
      type: ImgixUrlParamsInputType,
      defaultValue: {},
    },
  },
  resolve: (
    rootValue: TSource,
    args: ImgixFixedArgsResolved,
  ): Promise<FixedObject | undefined> =>
    pipe(
      Do(TE.taskEither)
        .let('rootValue', rootValue)
        .sequenceSL(({ rootValue }) => ({
          url: resolveUrlFromSourceData(resolveUrl)(rootValue),
          manualWidth: pipe(
            rootValue,
            taskEitherFromSourceDataResolver(resolveWidth),
            TaskOptionFromTE,
            TE.fromTask,
          ),
          manualHeight: pipe(
            rootValue,
            taskEitherFromSourceDataResolver(resolveHeight),
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
          buildImgixFixed({
            client: imgixClient,
            url,
            sourceWidth: width,
            sourceHeight: height,
            args,
          }),
        ),
      TE.getOrElseW(() => T.of(undefined)),
    )(),
});

export const createImgixFixedSchemaFieldConfig = <TSource, TContext>(
  args: CreateImgixFixedFieldConfigArgs<TSource>,
): ComposeFieldConfigAsObject<TSource, TContext, ImgixFixedArgs> =>
  createImgixFixedFieldConfig(args) as ComposeFieldConfigAsObject<
    TSource,
    TContext,
    ImgixFixedArgs
  >;
