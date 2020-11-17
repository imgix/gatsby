import { GatsbyCache } from 'gatsby';
import { GraphQLFieldConfig } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { IImgixParams, ImgixFixedArgs, ImgixFixedArgsResolved } from './publicTypes';
import { ImgixSourceDataResolver } from '../../common/utils';
export declare const DEFAULT_FIXED_WIDTH = 8192;
interface CreateImgixFixedFieldConfigArgs<TSource> {
    imgixClient: ImgixClient;
    resolveUrl: ImgixSourceDataResolver<TSource, string>;
    resolveWidth?: ImgixSourceDataResolver<TSource, number>;
    resolveHeight?: ImgixSourceDataResolver<TSource, number>;
    cache: GatsbyCache;
    defaultParams: Partial<IImgixParams>;
}
export declare const createImgixFixedFieldConfig: <TSource, TContext>({ imgixClient, resolveUrl, resolveWidth, resolveHeight, cache, defaultParams, }: CreateImgixFixedFieldConfigArgs<TSource>) => GraphQLFieldConfig<TSource, TContext, ImgixFixedArgsResolved>;
export declare const createImgixFixedSchemaFieldConfig: <TSource, TContext>(args: CreateImgixFixedFieldConfigArgs<TSource>) => ComposeFieldConfigAsObject<TSource, TContext, ImgixFixedArgs>;
export {};
//# sourceMappingURL=createImgixFixedFieldConfig.d.ts.map