import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import {
  ComposeInputTypeDefinition,
  ObjectTypeComposerFieldConfigAsObjectDefinition,
} from 'graphql-compose';
import { createExternalHelper } from '../../common/createExternalHelper';
import { TaskOptionFromTE } from '../../common/fpTsUtils';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
  taskEitherFromSourceDataResolver,
} from '../../common/utils';
import { IImgixParams, ImgixFluidArgsResolved } from '../../publicTypes';
import { unTransformParams } from './graphqlTypes';
import { buildFluidObject } from './objectBuilders';
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

export const createImgixFluidSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixFluidFieldConfig>[0],
  typeof createImgixFluidFieldConfig
>(createImgixFluidFieldConfig);
