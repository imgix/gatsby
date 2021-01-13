import { GatsbyCache } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import { GraphQLFieldConfig, GraphQLObjectType } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { ImgixSourceDataResolver } from '../../common/utils';
import { IImgixParams, ImgixFluidArgs, ImgixFluidArgsResolved } from '../../publicTypes';
interface CreateImgixFluidFieldConfigArgs<TSource> {
    imgixClient: ImgixClient;
    resolveUrl: ImgixSourceDataResolver<TSource, string>;
    resolveWidth?: ImgixSourceDataResolver<TSource, number>;
    resolveHeight?: ImgixSourceDataResolver<TSource, number>;
    cache: GatsbyCache;
    defaultParams?: Partial<IImgixParams>;
    type?: GraphQLObjectType<FluidObject>;
}
export declare const createImgixFluidFieldConfig: <TSource, TContext>({ imgixClient, resolveUrl, resolveWidth, resolveHeight, cache, defaultParams, type, }: CreateImgixFluidFieldConfigArgs<TSource>) => GraphQLFieldConfig<TSource, TContext, ImgixFluidArgsResolved>;
export declare const createImgixFluidSchemaFieldConfig: <TSource, TContext>(args: CreateImgixFluidFieldConfigArgs<TSource>) => ComposeFieldConfigAsObject<TSource, TContext, ImgixFluidArgs>;
export {};
//# sourceMappingURL=createImgixFluidFieldConfig.d.ts.map