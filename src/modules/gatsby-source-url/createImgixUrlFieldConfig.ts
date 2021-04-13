import { pipe } from 'fp-ts/lib/pipeable';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { ObjectTypeComposerFieldConfigAsObjectDefinition } from 'graphql-compose';
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
  ImgixParamsInputType,
  unTransformParams,
} from './graphqlTypes';

interface CreateImgixUrlFieldConfigArgs<TSource> {
  imgixClient: IImgixURLBuilder;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  defaultParams?: IImgixParams;
}

export const createImgixUrlFieldConfig = <TSource, TContext>({
  imgixClient,
  resolveUrl,
  defaultParams,
}: CreateImgixUrlFieldConfigArgs<TSource>): ObjectTypeComposerFieldConfigAsObjectDefinition<
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

// TODO: remove
// export const createImgixUrlSchemaFieldConfig = <TSource, TContext>({
//   imgixClientOptions,
//   ...args
// }: Omit<CreateImgixUrlFieldConfigArgs<TSource>, 'imgixClient'> & {
//   imgixClientOptions?: Parameters<typeof createImgixURLBuilder>[0];
// }): ObjectTypeComposerFieldConfigAsObjectDefinition<
//   TSource,
//   TContext,
//   ImgixUrlArgs
// > => {
//   return {
//     ...createImgixUrlFieldConfig({
//       ...args,
//       imgixClient: createImgixURLBuilder(imgixClientOptions),
//     }),
//   };
// };

export const createImgixUrlSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixUrlFieldConfig>[0],
  typeof createImgixUrlFieldConfig
>(createImgixUrlFieldConfig);
