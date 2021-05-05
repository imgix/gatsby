import ImgixClient from '@imgix/js-core';
import {
  getImageData,
  IGatsbyImageData,
  IGetImageDataArgs,
  IUrlBuilderArgs,
} from 'gatsby-plugin-image';
import { parseHost, parsePath } from '../../common/uri';
import { ImgixUrlParams } from '../../publicTypes';
import { BreakpointsWithData, generateBreakpoints } from './breakpoints';
import { createImgixClient, MAX_WIDTH } from './common';

type IUrlBuilderParameters = IUrlBuilderArgs<{
  imgixParams?: ImgixUrlParams;
  breakpointsWithData?: BreakpointsWithData;
}>;

const urlBuilder = (client: ImgixClient) => ({
  baseUrl,
  width,
  height,
  options = {},
}: IUrlBuilderParameters): string => {
  const manualQuality = options.breakpointsWithData
    ? options.breakpointsWithData.find(
        (breakpoint) => breakpoint.width === width,
      )?.quality
    : undefined;

  return client.buildURL(baseUrl, {
    fit: 'min',
    ...(manualQuality && { q: manualQuality }),
    ...options.imgixParams,
    w: width,
    h: height,
  });
};

export type IGetGatsbyImageDataOpts = {
  /**
   * The fully qualified image URL to be transformed. Must be an imgix URL and must start with "http" or "https"
   */
  src: string;
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

  backgroundColor?: string;

  /**
   * This disables the "variable quality" feature that decreases the quality of the requested image as the dpr increases for layout: 'fixed'
   */
  disableVariableQuality?: boolean;
};

// This is a workaround to ensure that the props that are extracted in the component are always in sync with this hook's options
export const GATSBY_IMAGE_HOOK_OPTS_KEYS = [
  'src',
  'imgixParams',
  'width',
  'height',
  'layout',
  'breakpoints',
  'widthTolerance',
  'srcsetMinWidth',
  'srcsetMaxWidth',
  'aspectRatio',
  'sourceWidth',
  'sourceHeight',
  'backgroundColor',
  'disableVariableQuality',
] as const;
// This is the actual type check. It ensures that a key of the object type can be "assigned" to a key of the list above. Therefore if a new key is added to the opts type, this will throw a type error
const __KEY_CHECK: typeof GATSBY_IMAGE_HOOK_OPTS_KEYS[number] = '' as keyof IGetGatsbyImageDataOpts;

export function getGatsbyImageData({
  src,
  sourceWidth,
  sourceHeight,
  aspectRatio,
  widthTolerance,
  srcsetMinWidth,
  srcsetMaxWidth,
  breakpoints: breakpointsOverride,
  disableVariableQuality,
  ...props
}: IGetGatsbyImageDataOpts): IGatsbyImageData {
  const layout = props.layout;
  if (layout == null) {
    throw new Error(
      `[@imgix/gatsby] A valid 'layout' is required. Valid image layouts are 'fixed', 'fullWidth', and 'constrained'. Found ${layout}`,
    );
  }
  const width = props.width;

  if (layout === 'fixed' && width == null) {
    throw new Error(
      `[@imgix/gatsby] a 'width' is required when layout is 'fixed'. Found ${width}`,
    );
  }

  const bothWidthAndHeightSet = props.width != null && props.height != null;
  const bothSourcesOrAspectRatioSet =
    (sourceWidth != null && sourceHeight != null) || aspectRatio != null;
  if (!bothWidthAndHeightSet && !bothSourcesOrAspectRatioSet) {
    throw new Error(
      `[@imgix/gatsby] 'aspectRatio' or 'sourceWidth' and 'sourceHeight' needed when one of width/height are not passed.`,
    );
  }

  const client = createImgixClient({
    domain: parseHost(src),
    libraryParam: 'gatsbyHook',
  });

  const breakpointsData = generateBreakpoints({
    ...(layout === 'fullWidth'
      ? { layout: 'fullWidth' }
      : { layout, width: width as number }),
    srcsetMinWidth,
    srcsetMaxWidth,
    widthTolerance,
    sourceWidth,
    disableVariableQuality,
  });

  const {
    sourceWidth: sourceWidthOverride,
    sourceHeight: sourceHeightOverride,
  } = calculateSourceWidthAndHeight({
    sourceWidth,
    sourceHeight,
  });

  return getImageData({
    baseUrl: parsePath(src),
    sourceWidth: sourceWidthOverride,
    sourceHeight: sourceHeightOverride,
    aspectRatio,
    urlBuilder: urlBuilder(client),
    pluginName: '@imgix/gatsby',
    formats: ['auto'],
    breakpoints: breakpointsOverride ?? breakpointsData.breakpoints,
    ...props,
    ...{ outputPixelDensities: breakpointsData.outputPixelDensities },
    layout,
    options: {
      imgixParams: props.imgixParams,
      breakpointsWithData: breakpointsData.breakpointsWithData,
    },
  });
}

/**
 * This function is designed to help override Gatsby's fixed layout logic.
 * Gatsby will not generate breakpoints above the sourceWidth for fixed images, but we need to force this, since we don't know the source width and we can use fit=min to ensure images are not scaled up.
 * The result is meant to be passed to `getImageData`
 */
const calculateSourceWidthAndHeight = ({
  sourceWidth,
  sourceHeight,
}: {
  sourceWidth?: number;
  sourceHeight?: number;
}): { sourceHeight?: number; sourceWidth?: number } => {
  if (sourceWidth != null) {
    // If sourceWidth is already defined, just return as is, with sourceHeight (if set)
    return { sourceWidth, sourceHeight };
  }
  // Now we should "fake" the sourceWidth to the max imgix render size (8192px).
  // We explicitly *don't* pass sourceHeight since that could cause a weird
  // aspect ratio to be set.
  return { sourceWidth: MAX_WIDTH };
};
