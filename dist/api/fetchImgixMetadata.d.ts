import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import ImgixClient from 'imgix-core-js';
import * as t from 'io-ts';
export declare const ImgixMetadata: t.TypeC<{
    'Content-Type': t.StringC;
    PixelWidth: t.NumberC;
    PixelHeight: t.NumberC;
}>;
export declare type IImgixMetadata = t.TypeOf<typeof ImgixMetadata>;
export declare const fetchImgixMetadata: (cache: GatsbyCache, client: ImgixClient) => (url: string) => TE.TaskEither<Error, IImgixMetadata>;
//# sourceMappingURL=fetchImgixMetadata.d.ts.map