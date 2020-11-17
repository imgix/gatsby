import { GatsbyCache } from 'gatsby';
import { GraphQLFieldConfig } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { IImgixParams, ImgixFluidArgs, ImgixFluidArgsResolved } from './publicTypes';
import { ImgixSourceDataResolver } from '../../common/utils';
interface CreateImgixFluidFieldConfigArgs<TSource> {
    imgixClient: ImgixClient;
    resolveUrl: ImgixSourceDataResolver<TSource, string>;
    resolveWidth?: ImgixSourceDataResolver<TSource, number>;
    resolveHeight?: ImgixSourceDataResolver<TSource, number>;
    cache: GatsbyCache;
    defaultParams: Partial<IImgixParams>;
}
export declare const createImgixFluidFieldConfig: <TSource, TContext>({ imgixClient, resolveUrl, resolveWidth, resolveHeight, cache, defaultParams, }: CreateImgixFluidFieldConfigArgs<TSource>) => GraphQLFieldConfig<TSource, TContext, ImgixFluidArgsResolved>;
export declare const createImgixFluidSchemaFieldConfig: <TSource, TContext>(args: CreateImgixFluidFieldConfigArgs<TSource>) => ComposeFieldConfigAsObject<TSource, TContext, ImgixFluidArgs>;
export {};
//# sourceMappingURL=createImgixFluidFieldConfig.d.ts.map