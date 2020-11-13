import { FixedObject, FluidObject } from 'gatsby-image';
import ImgixClient from 'imgix-core-js';
import * as R from 'ramda';
import { log, trace } from '../../common/log';
import { DEFAULT_FIXED_WIDTH } from './createImgixFixedFieldConfig';
import {
  IImgixParams,
  ImgixFixedArgsResolved,
  ImgixFluidArgsResolved,
  ImgixUrlParams,
} from './publicTypes';
export type BuildImgixFluidArgs = {
  client: ImgixClient;
  url: string;
  sourceWidth: number;
  sourceHeight: number;
  args: ImgixFluidArgsResolved;
  defaultParams: Partial<IImgixParams>;
  defaultPlaceholderParams: Partial<IImgixParams>;
};

const parseAspectRatioFloatFromString = R.pipe<
  string,
  string[],
  string,
  number
>(R.split(':'), R.head, (v) => parseInt(v));

const DEFAULT_LQIP_PARAMS: ImgixUrlParams = { w: 20, blur: 15, q: 20 };

export const buildFluidObject = ({
  client,
  url,
  sourceWidth,
  sourceHeight,
  args,
  defaultParams,
  defaultPlaceholderParams,
}: BuildImgixFluidArgs): FluidObject => {
  const maxWidthAndHeightSet = args.maxHeight != null && args.maxWidth != null;
  const aspectRatio = (() => {
    if (args.imgixParams.ar != null) {
      return parseAspectRatioFloatFromString(args.imgixParams.ar);
    }
    if (args.maxHeight != null && args.maxWidth != null) {
      return args.maxWidth / args.maxHeight;
    }
    return sourceWidth / sourceHeight;
  })();
  const maxWidth = args.maxWidth;

  const imgixParams = {
    fit: 'crop',
    ...defaultParams,
    ...args.imgixParams,
    ...(maxWidthAndHeightSet && {
      ar: `${aspectRatio}:1`,
    }),
  };

  // This base64 URL will be resolved by this resolver, and then be resolved again by the base64 resolver which is set on the field. See createImgixBase64FieldConfig
  const base64 = client.buildURL(url, {
    ...DEFAULT_LQIP_PARAMS,
    ...defaultPlaceholderParams,
    ...args.imgixParams,
    ...args.placeholderImgixParams,
  });

  const srcImgixParams = {
    ...imgixParams,
    w: maxWidth,
    h: args.maxHeight,
  };
  const src = client.buildURL(url, srcImgixParams);
  const srcWebp = client.buildURL(url, {
    ...srcImgixParams,
    fm: 'webp',
  });

  const srcsetOptions = {
    maxWidth,
    widths: args.srcSetBreakpoints,
  };
  const srcsetImgixParams = imgixParams;

  // We have to spread parameters because .buildSrcSet mutates params. GH issue: https://github.com/imgix/imgix-core-js/issues/158
  const srcset = client.buildSrcSet(
    url,
    { ...srcsetImgixParams },
    srcsetOptions,
  );
  const srcsetWebp = client.buildSrcSet(
    url,
    {
      ...srcsetImgixParams,
      fm: 'webp',
    },
    srcsetOptions,
  );

  return {
    base64,
    aspectRatio,
    src,
    srcWebp: srcWebp,
    srcSet: srcset,
    srcSetWebp: srcsetWebp,
    // TODO: use max-width here
    sizes: '(min-width: 8192px) 8192px, 100vw',
  };
};

export type BuildImgixFixedArgs = {
  client: ImgixClient;
  url: string;
  sourceWidth: number;
  sourceHeight: number;
  args: ImgixFixedArgsResolved;
  defaultParams: Partial<IImgixParams>;
  defaultPlaceholderParams: Partial<IImgixParams>;
};
export function buildImgixFixed({
  client,
  url,
  sourceWidth,
  sourceHeight,
  args,
  defaultParams,
  defaultPlaceholderParams,
}: BuildImgixFixedArgs): FixedObject {
  const aspectRatio = (() => {
    if (args.imgixParams.ar != null) {
      return parseAspectRatioFloatFromString(args.imgixParams.ar);
    }
    if (args.height != null && args.width != null) {
      return args.width / args.height;
    }
    return sourceWidth / sourceHeight;
  })();
  log(
    args.width,
    args.height,
    aspectRatio,
    Math.round(args.width / aspectRatio),
  );

  const { width, height } = ((): { width: number; height: number } => {
    if (args.width != null && args.height != null) {
      return { width: args.width, height: args.height };
    } else if (args.width != null) {
      return {
        width: args.width,
        height: Math.round(args.width / aspectRatio),
      };
    } else if (args.height != null) {
      return {
        width: Math.round(args.height * aspectRatio),
        height: args.height,
      };
    } else {
      return {
        width: DEFAULT_FIXED_WIDTH,
        height: Math.round(DEFAULT_FIXED_WIDTH / aspectRatio),
      };
    }
  })();

  const imgixParams = {
    fit: 'crop',
    ...defaultParams,
    ...args.imgixParams,
    w: width,
    h: height,
  };

  const base64 = client.buildURL(url, {
    ...DEFAULT_LQIP_PARAMS,
    ...defaultPlaceholderParams,
    ...args.imgixParams,
    ...args.placeholderImgixParams,
  });

  // We have to spread parameters because .buildURL and .buildSrcSet mutates params. GH issue: https://github.com/imgix/imgix-core-js/issues/158
  const src = client.buildURL(url, { ...imgixParams });
  const srcWebp = client.buildURL(url, {
    ...imgixParams,
    fm: 'webp',
  });

  const srcsetOptions = {
    // maxWidth,
    // widths: args.srcSetBreakpoints,
  };
  const srcsetImgixParams = imgixParams;
  const srcset = client.buildSrcSet(
    url,
    { ...srcsetImgixParams },
    srcsetOptions,
  );
  const srcsetWebp = client.buildSrcSet(
    url,
    {
      ...srcsetImgixParams,
      fm: 'webp',
    },
    srcsetOptions,
  );

  trace('buildFixedImage output')({
    base64,
    width,
    height,
    src,
    srcWebp,
    srcSet: srcset,
    srcSetWebp: srcsetWebp,
  });
  return {
    base64,
    width,
    height,
    src,
    srcWebp,
    srcSet: srcset,
    srcSetWebp: srcsetWebp,
  };
}
