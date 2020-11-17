import * as E from 'fp-ts/lib/Either';
import ImgixClient from 'imgix-core-js';
export declare const createImgixClient: (options: ConstructorParameters<typeof ImgixClient>[0]) => E.Either<Error, ImgixClient>;
export declare type IBuildImgixUrl = ImgixClient['buildURL'];
export declare type IBuildImgixSrcSet = ImgixClient['buildSrcSet'];
//# sourceMappingURL=imgix-core-js-wrapper.d.ts.map