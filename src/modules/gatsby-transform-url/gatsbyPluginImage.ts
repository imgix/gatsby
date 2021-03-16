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
    fit: 'min',
    ...options.imgixParams,
    w: width,
    h: height,
  });
};

// TODO: can we pass ar here?
export type IGetGatsbyImageDataOpts = {
  /**
   * The fully qualified image URL to be transformed. Must be an imgix URL and must start with "http" or "https"
   */
  url: string;
  imgixParams?: ImgixUrlParams;
  /**
   * For constrained and fixed images, the width/max-width of the image element
   */
  width?: number;
  /**
   * For constrained and fixed images, the height/max-height of the image element
   */
  height?: number;

  layout?: IGetImageDataArgs['layout'];
  breakpoints?: IGetImageDataArgs['breakpoints'];

  /**
   * This argument affects the breakpoints used for the srcsets, dictates the maximum tolerated size difference between an image's downloaded size and its rendered size. For example: setting this value to 0.1 means that an image will not render more than 10% larger or smaller than its native size. In practice, the image URLs generated for a width-based srcset attribute will grow by twice this rate. A lower tolerance means images will render closer to their native size (thereby increasing perceived image quality), but a large srcset list will be generated and consequently users may experience lower rates of cache-hit for pre-rendered images on your site.
   * By default this rate is set to 8 percent, which we consider to be the ideal rate for maximizing cache hits without sacrificing visual quality. Users can specify their own width tolerance by providing a positive scalar value as widthTolerance to the third options object.
   * Determines how much bigger each srcset is than the last, i.e. nextSrcset = prevSrcset * widthTolerance.
   * Must be greater than 0
   */
  widthTolerance?: number;
  /**
   * Prevents any srcsets being generated smaller than this width.
   */
  srcsetMinWidth?: number;
  /**
   * Prevents any srcsets being generated larger than this width.
   */
  srcsetMaxWidth?: number;

  /**
   * Useful not only for controlling the aspect ratio of the requested image, but also for ensuring that a correctly sized placeholder is rendered.
   */
  aspectRatio?: number;
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
