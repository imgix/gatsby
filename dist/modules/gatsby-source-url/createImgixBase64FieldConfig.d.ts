import { GatsbyCache } from 'gatsby';
import { GraphQLFieldConfig } from 'graphql';
import { ImgixSourceDataResolver } from '../../common/utils';
interface CreateImgixBase64UrlFieldConfigArgsWithResolver<TSource> {
    resolveUrl: ImgixSourceDataResolver<TSource, string>;
    cache: GatsbyCache;
}
export declare function createImgixBase64FieldConfig<TSource, TContext = unknown>({ resolveUrl, cache, }: CreateImgixBase64UrlFieldConfigArgsWithResolver<TSource>): GraphQLFieldConfig<TSource, TContext>;
export {};
//# sourceMappingURL=createImgixBase64FieldConfig.d.ts.map