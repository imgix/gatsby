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
