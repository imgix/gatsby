import { GatsbyCache } from 'gatsby';
import { GraphQLFieldConfig } from 'graphql';
import type ImgixClient from 'imgix-core-js';
import { IGatsbySourceUrlRootArgs, IImgixParams } from './publicTypes';
export declare const createRootImgixImageType: (imgixClient: ImgixClient, cache: GatsbyCache, defaultParams: Partial<IImgixParams>) => GraphQLFieldConfig<any, any, IGatsbySourceUrlRootArgs>;
//# sourceMappingURL=createRootImgixImageType.d.ts.map