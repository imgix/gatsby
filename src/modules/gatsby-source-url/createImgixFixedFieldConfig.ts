import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FixedObject } from 'gatsby-image';
import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLObjectType,
} from 'gatsby/graphql';
import { ObjectTypeComposerAsObjectDefinition } from 'graphql-compose';
import { TaskOptionFromTE } from '../../common/fpTsUtils';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from '../../common/utils';
import { IImgixParams, ImgixFixedArgsResolved } from '../../publicTypes';
import {
  createImgixFixedType,
  ImgixParamsInputType,
  unTransformParams,
} from './graphqlTypes';
import { buildImgixFixed } from './objectBuilders';
import { resolveDimensions } from './resolveDimensions';

export const DEFAULT_FIXED_WIDTH = 8192;

interface CreateImgixFixedFieldConfigArgs<TSource> {
  imgixClient: IImgixURLBuilder;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number>;
  cache: GatsbyCache;
  defaultParams?: Partial<IImgixParams>;
  type?: GraphQLObjectType<FixedObject>;
}

export const createImgixFixedFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  resolveWidth = () => undefined,
  resolveHeight = () => undefined,
  cache,
  defaultParams,
  type,
}: CreateImgixFixedFieldConfigArgs<TSource>): GraphQLFieldConfig<
  TSource,
  TContext,
  ImgixFixedArgsResolved
> => ({
  type: type ?? createImgixFixedType({ cache }),
  description: `Should be used to generate fixed-width images (i.e. the size of the image doesn't change when the size of the browser changes, and are "fixed"). Returns data compatible with gatsby-image. Instead of accessing this data directly, the GatsbySourceImgixFixed fragment should be used. See the project's README for more information.`,
  args: {
    width: {
      type: GraphQLInt,
      // TODO: refactor to TS default args for type safety and functionality ()
      description: `The fixed image width to render, in px.`,
      defaultValue: DEFAULT_FIXED_WIDTH, // TODO: use image source width?
    },
    height: {
      type: GraphQLInt,
      description: `The fixed image height to render, in px.`,
    },
    quality: {
      type: GraphQLInt,
      description: `The image quality to use for compression. Range: 0-100, with 100 being highest quality. This setting is not recommended as the quality is already optimized by decreasing quality as the dpr increases to reduce image size while retaining visual quality.`,
    },
    imgixParams: {
      type: ImgixParamsInputType,
      description: `The imgix parameters (transformations) to apply to the image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url`,
      defaultValue: {},
    },
    placeholderImgixParams: {
      type: ImgixParamsInputType,
      description: `Any imgix parameters to use only for the blur-up/placeholder image. The full set of imgix params can be explored here: https://docs.imgix.com/apis/url`,
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
        .let('modifiedArgs', {
          ...args,
          imgixParams: unTransformParams(args.imgixParams),
        })
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
        .return(({ url, modifiedArgs, dimensions: { width, height } }) =>
          buildImgixFixed({
            client: imgixClient,
            url,
            sourceWidth: width,
            sourceHeight: height,
            args: modifiedArgs,
            defaultParams,
            defaultPlaceholderParams: {}, // TODO: implement
          }),
        ),
      TE.getOrElseW(() => T.of(undefined)),
    )(),
});

export const createImgixFixedSchemaFieldConfig = <TSource, TContext>(
  args: CreateImgixFixedFieldConfigArgs<TSource>,
): ObjectTypeComposerAsObjectDefinition<TSource, TContext> =>
  ({
    ...createImgixFixedFieldConfig(args),
    name: 'ImgixGatsbyFixed',
  } as ObjectTypeComposerAsObjectDefinition<TSource, TContext>);
