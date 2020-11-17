import { GraphQLFieldConfig } from 'graphql';
import { ComposeFieldConfigAsObject } from 'graphql-compose';
import ImgixClient from 'imgix-core-js';
import { IImgixParams, ImgixUrlArgs } from './publicTypes';
import { ImgixSourceDataResolver } from '../../common/utils';
interface CreateImgixUrlFieldConfigArgs<TSource> {
    imgixClient: ImgixClient;
    resolveUrl: ImgixSourceDataResolver<TSource, string>;
    defaultParams: IImgixParams;
}
export declare const createImgixUrlFieldConfig: <TSource, TContext>({ imgixClient, resolveUrl, defaultParams, }: CreateImgixUrlFieldConfigArgs<TSource>) => GraphQLFieldConfig<TSource, TContext, ImgixUrlArgs>;
export declare const createImgixUrlSchemaFieldConfig: <TSource, TContext>(args: CreateImgixUrlFieldConfigArgs<TSource>) => ComposeFieldConfigAsObject<TSource, TContext, ImgixUrlArgs>;
export {};
//# sourceMappingURL=createImgixUrlFieldConfig.d.ts.map