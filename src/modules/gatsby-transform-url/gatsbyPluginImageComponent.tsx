import { GatsbyImage, GatsbyImageProps } from 'gatsby-plugin-image';
import * as R from 'ramda';
import React from 'react';
import {
  GATSBY_IMAGE_HOOK_OPTS_KEYS,
  getGatsbyImageData,
} from './gatsbyPluginImage';

export const ImgixGatsbyImage = (props: IImgixGatsbyImageProps) => {
  // split into two groups of props, one for hook and one for comp.
  const hookProps = R.pick(GATSBY_IMAGE_HOOK_OPTS_KEYS, props);
  const imageProps = R.omit(GATSBY_IMAGE_HOOK_OPTS_KEYS, props);

  const data = getGatsbyImageData(hookProps);

  return <GatsbyImage image={data} {...imageProps} />;
};

export type IImgixGatsbyImageProps = Parameters<typeof getGatsbyImageData>[0] &
  Omit<GatsbyImageProps, 'image'>;
