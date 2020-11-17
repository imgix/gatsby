import { IGatsbyImageFixedData, IGatsbyImageFluidData, IImgixParams } from './types';
export declare function buildFixedImageData(
/**
 * An imgix url to transform, e.g. https://yourdomain.imgix.net/your-image.jpg
 */
url: string, 
/**
 * A set of imgix parameters to apply to the image.
 * Parameters ending in 64 will be base64 encoded.
 * A full list of imgix parameters can be found here: https://docs.imgix.com/apis/url
 * Width (w) and height (h) are required.
 */
imgixParams: {
    w: number;
    h: number;
} & IImgixParams, 
/**
 * Options that are not imgix parameters.
 * Optional.
 */
options?: {
    /**
     * Disable the ixlib diagnostic param that is added to every url.
     */
    includeLibraryParam?: boolean;
}): IGatsbyImageFixedData;
export declare function buildFluidImageData(
/**
 * An imgix url to transform, e.g. https://yourdomain.imgix.net/your-image.jpg
 */
url: string, 
/**
 * A set of imgix parameters to apply to the image.
 * Parameters ending in 64 will be base64 encoded.
 * A full list of imgix parameters can be found here: https://docs.imgix.com/apis/url
 * The aspect ratio (ar) as a float is required.
 */
imgixParams: {
    /**
     * The aspect ratio to set for the rendered image and the placeholder.
     * Format: float or string. For float, it can be calculated with ar = width/height. For a string, it should be in the format w:h.
     */
    ar: number | string;
} & IImgixParams, 
/**
 * Options that are not imgix parameters.
 * Optional.
 */
options?: {
    /**
     * Disable the ixlib diagnostic param that is added to every url.
     */
    includeLibraryParam?: boolean;
    /**
     * The sizes attribute to set on the underlying image.
     */
    sizes?: string;
}): IGatsbyImageFluidData;
//# sourceMappingURL=index.d.ts.map