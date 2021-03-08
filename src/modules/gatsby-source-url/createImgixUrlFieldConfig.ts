import ImgixClient from '@imgix/js-core';
import { pipe } from 'fp-ts/lib/pipeable';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GraphQLFieldConfig } from 'gatsby/graphql';
import { ObjectTypeComposerAsObjectDefinition } from 'graphql-compose';
import * as R from 'ramda';
import {
  ImgixSourceDataResolver,
  resolveUrlFromSourceData,
} from '../../common/utils';
import { IImgixParams, ImgixUrlArgs } from '../../publicTypes';
import {
  gatsbySourceImgixUrlFieldType,
  ImgixParamsInputType,
  unTransformParams,
} from './graphqlTypes';

interface CreateImgixUrlFieldConfigArgs<TSource> {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  defaultParams?: IImgixParams;
}

export const createImgixUrlFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  defaultParams,
}: CreateImgixUrlFieldConfigArgs<TSource>): GraphQLFieldConfig<
  TSource,
  TContext,
  ImgixUrlArgs
> => ({
  type: gatsbySourceImgixUrlFieldType,
  description: 'A plain imgix URL with the URL and params applied.',
  args: {
    imgixParams: {
      type: ImgixParamsInputType,
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

export const createImgixUrlSchemaFieldConfig = <TSource, TContext>(
  args: CreateImgixUrlFieldConfigArgs<TSource>,
): ObjectTypeComposerAsObjectDefinition<TSource, TContext> =>
  ({
    ...createImgixUrlFieldConfig(args),
    name: 'ImgixGatsbyUrl',
  } as ObjectTypeComposerAsObjectDefinition<TSource, TContext>);
