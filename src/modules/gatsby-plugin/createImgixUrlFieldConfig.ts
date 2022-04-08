import {
  ComposeInputTypeDefinition,
  ObjectTypeComposerFieldConfigAsObjectDefinition,
} from 'graphql-compose';
import { mergeRight } from 'ramda';
import { createExternalHelper } from '../../common/createExternalHelper';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { ImgixSourceDataResolver } from '../../common/utils';
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

/**
 * Create the GraphQL field config for the "url" field that will exist on the
 * imgixImage type
 * @param param0
 * @param param0.imgixClient The imgix client to use to build the URL
 * @param param0.resolveUrl The function to resolve the URL from the source data
 * @param param0.defaultParams The default params to use when building the fixed image URL
 * @param param0.paramsInputType The GraphQL type to use for the params input
 * @returns A GraphQL field config for a "url" size image
 */
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
  resolve: async (
    rootValue: TSource,
    args: ImgixUrlArgs,
  ): Promise<string | undefined> => {
    const url = await resolveUrl(rootValue);
    if (!url) {
      return undefined;
    }

    return imgixClient.buildURL(
      url,
      mergeRight(
        defaultParams ?? {},
        unTransformParams(args.imgixParams ?? {}),
      ),
    );
  },
});

export const createImgixUrlSchemaFieldConfig = createExternalHelper<
  Parameters<typeof createImgixUrlFieldConfig>[0],
  typeof createImgixUrlFieldConfig
>(createImgixUrlFieldConfig);
