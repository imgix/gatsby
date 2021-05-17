import { IGatsbyImageHelperArgs } from 'gatsby-plugin-image';
import { ImgixUrlParams } from '../../publicTypes';

export type IImgixGatsbyImageDataArgsResolved = {
  layout?: IGatsbyImageHelperArgs['layout'];
  width?: IGatsbyImageHelperArgs['width'];
  height?: IGatsbyImageHelperArgs['height'];
  aspectRatio?: IGatsbyImageHelperArgs['aspectRatio'];
  // outputPixelDensities: IGatsbyImageHelperArgs['outputPixelDensities'];
  breakpoints?: IGatsbyImageHelperArgs['breakpoints'];
  sizes?: IGatsbyImageHelperArgs['sizes'];
  backgroundColor?: IGatsbyImageHelperArgs['backgroundColor'];
  imgixParams?: ImgixUrlParams;
  placeholderImgixParams?: ImgixUrlParams;
  placeholder?: 'dominantColor' | 'blurred' | 'none';
  widthTolerance?: number;
  srcSetMinWidth?: number;
  srcSetMaxWidth?: number;
};

/**
 * "Resolved" version of ImgixFluidArgs in publicTypes.ts. "Resolved" here means that the default parameters specified in the GraphQL type have been applied, so we can be certain that some arguments have a specific type.
 */
export interface ImgixFluidArgsResolved {
  maxWidth: number;
  maxHeight?: number;
  srcSetBreakpoints?: number[];
  imgixParams: ImgixUrlParams;
  placeholderImgixParams: ImgixUrlParams;
}

/**
 * "Resolved" version of ImgixFixedArgs in publicTypes.ts. "Resolved" here means that the default parameters specified in the GraphQL type have been applied, so we can be certain that some arguments have a specific type.
 */
export interface ImgixFixedArgsResolved {
  width: number;
  height?: number;
  quality?: number;
  imgixParams: ImgixUrlParams;
  placeholderImgixParams: ImgixUrlParams;
}
