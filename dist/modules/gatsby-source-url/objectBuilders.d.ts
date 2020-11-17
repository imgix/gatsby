import { FixedObject, FluidObject } from 'gatsby-image';
import ImgixClient from 'imgix-core-js';
import { IImgixParams, ImgixFixedArgsResolved, ImgixFluidArgsResolved } from './publicTypes';
export declare type BuildImgixFluidArgs = {
    client: ImgixClient;
    url: string;
    sourceWidth: number;
    sourceHeight: number;
    args: ImgixFluidArgsResolved;
    defaultParams: Partial<IImgixParams>;
    defaultPlaceholderParams: Partial<IImgixParams>;
};
export declare const buildFluidObject: ({ client, url, sourceWidth, sourceHeight, args, defaultParams, defaultPlaceholderParams, }: BuildImgixFluidArgs) => FluidObject;
export declare type BuildImgixFixedArgs = {
    client: ImgixClient;
    url: string;
    sourceWidth: number;
    sourceHeight: number;
    args: ImgixFixedArgsResolved;
    defaultParams: Partial<IImgixParams>;
    defaultPlaceholderParams: Partial<IImgixParams>;
};
export declare function buildImgixFixed({ client, url, sourceWidth, sourceHeight, args, defaultParams, defaultPlaceholderParams, }: BuildImgixFixedArgs): FixedObject;
//# sourceMappingURL=objectBuilders.d.ts.map