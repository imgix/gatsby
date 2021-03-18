import React from 'react';
import { GatsbyImage, GatsbyImageProps } from 'gatsby-plugin-image';
import { getGatsbyImageData } from './gatsbyPluginImage';

export const ImgixGatsbyImage = (props: IImgixGatsbyImageProps) => {
  // split into two groups of props, one for hook and one for comp.
  const {
    url,
    imgixParams,
    width,
    height,
    layout,
    breakpoints,
    widthTolerance,
    srcsetMinWidth,
    srcsetMaxWidth,
    aspectRatio,
    sourceWidth,
    sourceHeight,
    ...gatsbyImageProps
  } = props;
  const data = getGatsbyImageData({
    url,
    imgixParams,
    width,
    height,
    layout,
    breakpoints,
    widthTolerance,
    srcsetMinWidth,
    srcsetMaxWidth,
    aspectRatio,
    sourceWidth,
    sourceHeight,
  });

  return <GatsbyImage image={data} {...gatsbyImageProps}/>
}


export type IImgixGatsbyImageProps = Parameters<typeof getGatsbyImageData>[0] &
  Omit<GatsbyImageProps, 'image'>;
