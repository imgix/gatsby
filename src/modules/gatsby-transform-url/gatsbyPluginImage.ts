import {
  getImageData,
  IGetImageDataArgs,
  IUrlBuilderArgs,
} from 'gatsby-plugin-image';
import ImgixClient from 'imgix-core-js';
import { parseHost, parsePath } from '../../common/uri';
import { ImgixUrlParams } from '../../publicTypes';
import { createImgixClient } from './common';

type IUrlBuilderParameters = IUrlBuilderArgs<{ imgixParams?: ImgixUrlParams }>;

const urlBuilder = (client: ImgixClient) => ({
  baseUrl,
  width,
  height,
  format,
  options = {},
}: IUrlBuilderParameters): string => {
  // TODO: handle default params
  return client.buildURL(baseUrl, {
    ...options.imgixParams,
    w: width,
    h: height,
  });
};

// TODO: can we pass ar here?
type IGetGatsbyImageDataOpts = {
  /**
   * The fully qualified image URL to be transformed. Must be an imgix URL and must start with "http" or "https"
   */
  url: string;
  imgixParams: ImgixUrlParams;
  /**
   * For constrained and fixed images, the width/max-width of the image element
   */
  width?: number;
  /**
   * For constrained and fixed images, the height/max-height of the image element
   */
  height?: number;
  /**
   * If the source width is known. Used to constrain srcsets
   */
  sourceWidth?: number;
  /**
   * If the source height is known. Used to constrain srcsets
   */
  sourceHeight?: number;
  /**
   * Useful not only for controlling the aspect ratio of the requested image, but also for ensuring that a correctly sized placeholder is rendered.
   */
  aspectRatio?: IGetImageDataArgs['aspectRatio'];
  layout: IGetImageDataArgs['layout'];
  breakpoints: IGetImageDataArgs['breakpoints'];
};
export function getGatsbyImageData({
  url,
  sourceWidth,
  sourceHeight,
  ...props
}: IGetGatsbyImageDataOpts) {
  const client = createImgixClient({
    domain: parseHost(url),
    libraryParam: 'gatsby-plugin-image-hook',
  });

  // TODO: use @imgix/js-core breakpoints

  return getImageData({
    baseUrl: parsePath(url),
    // sourceWidth,
    // sourceHeight,
    urlBuilder: urlBuilder(client),
    pluginName: '@imgix/gatsby',
    formats: ['auto'],
    ...props,
  });
}
