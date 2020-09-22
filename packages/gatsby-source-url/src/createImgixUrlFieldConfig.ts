import { pipe } from 'fp-ts/lib/pipeable';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GraphQLFieldConfig } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import R from 'ramda';
import {
  gatsbySourceImgixUrlFieldType,
  ImgixUrlParamsInputType,
} from './graphqlTypes';
import { IImgixParams, ImgixUrlArgs } from './publicTypes';
import { ImgixSourceDataResolver, resolveUrlFromSourceData } from './utils';

interface CreateImgixUrlFieldConfigArgs<TSource> {
  imgixClient: ImgixClient;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  defaultParams: IImgixParams;
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
  description: 'A plain imgix url with the url and params applied.',
  args: {
    imgixParams: {
      type: ImgixUrlParamsInputType,
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
          R.mergeRight(defaultParams, args.imgixParams ?? {}),
        ),
      ),
      TE.getOrElse<Error, string | undefined>(() => T.of(undefined)),
    )(),
});

export const createImgixUrlSchemaFieldConfig = <TSource, TContext>(
  args: CreateImgixUrlFieldConfigArgs<TSource>,
): ComposeFieldConfigAsObject<TSource, TContext, ImgixUrlArgs> =>
  createImgixUrlFieldConfig(args) as ComposeFieldConfigAsObject<
    TSource,
    TContext,
    ImgixUrlArgs
  >;
