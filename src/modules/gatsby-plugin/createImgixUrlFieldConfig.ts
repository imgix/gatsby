import { pipe } from 'fp-ts/pipeable';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import {
  ComposeInputTypeDefinition,
  ObjectTypeComposerFieldConfigAsObjectDefinition,
} from 'graphql-compose';
import * as R from 'ramda';
import { createExternalHelper } from '../../common/createExternalHelper';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
} from '../../common/utils';
import { IImgixParams, ImgixUrlArgs } from '../../publicTypes';
import {
  gatsbySourceImgixUrlFieldType,
  unTransformParams,
} from './graphqlTypes';

interface CreateImgixUrlFieldConfigArgs<TSource> {
  imgixClient: IImgixURLBuilder;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  defaultParams?: IImgixParams;
  paramsInputType: ComposeInputTypeDefinition;
}

export const createImgixUrlFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  defaultParams,
  paramsInputType,
}: CreateImgixUrlFieldConfigArgs<TSource>): ObjectTypeComposerFieldConfigAsObjectDefinition<
  TSource,
  TContext,
  ImgixUrlArgs
> => ({
  type: gatsbySourceImgixUrlFieldType,
  description: 'A plain imgix URL with the URL and params applied.',
  args: {
    imgixParams: {
      type: paramsInputType,
      defaultValue: {},
    },
  },
  resolve: (
    rootValue: TSource,
    args: ImgixUrlArgs,
  ): Promise<string | undefined> =>
    pipe(
      rootValue,
      resolveUrlFromSourceData(resolveUrl),
      TE.map((url) =>
        imgixClient.buildURL(
          url,
          R.mergeRight(
            defaultParams ?? {},
            unTransformParams(args.imgixParams ?? {}),
          ),
        ),
      ),
      TE.getOrElse<Error, string | undefined>(() => T.of(undefined)),
    )(),
});

export const createImgixUrlSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixUrlFieldConfig>[0],
  typeof createImgixUrlFieldConfig
>(createImgixUrlFieldConfig);
