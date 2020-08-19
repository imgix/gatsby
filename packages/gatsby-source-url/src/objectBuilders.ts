import { FluidObject } from 'gatsby-image';
import ImgixClient from 'imgix-core-js';
import { ImgixFluidArgsResolved } from './publicTypes';
export type BuildImgixFluidArgs = {
  client: ImgixClient;
  url: string;
  sourceWidth: number;
  sourceHeight: number;
  secureUrlToken?: string;
  args: ImgixFluidArgsResolved;
};

export const buildFluidObject = ({
  client,
  url,
  sourceWidth,
  sourceHeight,
  secureUrlToken,
  args,
}: BuildImgixFluidArgs): FluidObject => {
  const maxWidthAndHeightSet = args.maxHeight != null && args.maxWidth != null;
  const aspectRatio = (() => {
    if (args.maxHeight != null && args.maxWidth != null) {
      return args.maxWidth / args.maxHeight;
    }
    return sourceWidth / sourceHeight;
  })();
  const maxWidth = args.maxWidth;

  const imgixParams = {
    fit: 'crop',
    ...args.imgixParams,
    ...(maxWidthAndHeightSet && { ar: `${aspectRatio}:1` }),
  };

  // const base64 = buildImgixLqipUrl(
  //   url,
  //   secureUrlToken,
  // )({
  //   ...args.imgixParams,
  //   ...args.placeholderImgixParams,
  // });

  const src = client.buildURL(url, {
    ...imgixParams,
    w: maxWidth,
    h: args.maxHeight,
  });

  const srcset = client.buildSrcSet(url, imgixParams, {
    maxWidth,
  });

  /* TODO: handle these */
  //  ({
  //   aspectRatio,
  //   maxWidth: maxWidth,
  //   srcSetBreakpoints: args.srcSetBreakpoints,
  // });

  return {
    // base64,
    aspectRatio,
    src,
    srcWebp: src,
    srcSet: srcset,
    srcSetWebp: srcset,
    sizes: '(min-width: 8192px) 8192px, 100vw',
  };
};
