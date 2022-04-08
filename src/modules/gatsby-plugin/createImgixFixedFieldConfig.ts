import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import { FixedObject } from 'gatsby-image';
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
import { IImgixParams } from '../../publicTypes';
import { unTransformParams } from './graphqlTypes';
import { buildImgixFixed } from './objectBuilders';
import { ImgixFixedArgsResolved } from './privateTypes';
import { resolveDimensions } from './resolveDimensions';

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
          TE.tryCatch(
            () =>
              resolveDimensions({
                url,
                manualWidth: O.isSome(manualWidth)
                  ? manualWidth.value
                  : undefined,
                manualHeight: O.isSome(manualHeight)
                  ? manualHeight.value
                  : undefined,
                cache,
                client: imgixClient,
              }),
            String,
          ),
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

export const createImgixFixedSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixFixedFieldConfig>[0],
  typeof createImgixFixedFieldConfig
>(createImgixFixedFieldConfig);
