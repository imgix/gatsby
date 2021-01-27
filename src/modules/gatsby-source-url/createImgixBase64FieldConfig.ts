import { pipe } from 'fp-ts/lib/pipeable';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from 'graphql';
import { fetchImgixBase64Image } from '../../api/fetchBase64Image';
import {
  ImgixSourceDataResolver,
  taskEitherFromSourceDataResolver,
} from '../../common/utils';

interface CreateImgixBase64UrlFieldConfigArgsWithResolver<TSource> {
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  cache: GatsbyCache;
}
interface CreateImgixBase64UrlFieldConfigArgs<TSource> {
  resolveUrl?: ImgixSourceDataResolver<TSource, string>;
  cache: GatsbyCache;
}
export function createImgixBase64FieldConfig<TSource, TContext = unknown>({
  resolveUrl,
  cache,
}: CreateImgixBase64UrlFieldConfigArgsWithResolver<TSource>): GraphQLFieldConfig<
  TSource,
  TContext
> {
  return {
    type: new GraphQLNonNull(GraphQLString),
    resolve: (obj: TSource): Promise<string> =>
      pipe(
        obj,
        taskEitherFromSourceDataResolver<TSource, string>(resolveUrl),
        TE.chain(fetchImgixBase64Image(cache)),
        TE.getOrElse(
          (e): T.Task<string> => {
            throw e;
          },
        ),
      )(),
  };
}
