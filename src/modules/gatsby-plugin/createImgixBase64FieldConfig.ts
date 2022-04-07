import { GatsbyCache } from 'gatsby';
import { ObjectTypeComposerFieldConfigAsObjectDefinition } from 'graphql-compose';
import { fetchImgixBase64Image } from '../../api/fetchBase64Image';
import { ImgixSourceDataResolver } from '../../common/utils';

interface CreateImgixBase64UrlFieldConfigArgsWithResolver<TSource> {
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  cache: GatsbyCache;
}
interface CreateImgixBase64UrlFieldConfigArgs<TSource> {
  resolveUrl?: ImgixSourceDataResolver<TSource, string>;
  cache: GatsbyCache;
}

/**
 * Create the GraphQL field config for the base64 field that will exist inside
 * the imgixImage field. If this field is resolved, it will return a base64
 * placeholder image for the requested image.
 * @param param0
 * @param param0.resolveUrl Function that returns the url or a Promise containing the url for the given node
 * @param param0.cache The Gatsby cache helper
 * @returns GraphQL config object
 */
export function createImgixBase64FieldConfig<TSource, TContext = unknown>({
  resolveUrl,
  cache,
}: CreateImgixBase64UrlFieldConfigArgsWithResolver<TSource>): ObjectTypeComposerFieldConfigAsObjectDefinition<
  TSource,
  TContext
> {
  return {
    type: 'String!',
    resolve: async (obj: TSource): Promise<string> => {
      const data = await resolveUrl(obj);
      if (!data) {
        throw new Error('No data found for the image');
      }
      return await fetchImgixBase64Image(cache)(data);
    },
  };
}
