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
    ...(maxWidthAndHeightSet && {
      ar: `${aspectRatio}:1`,
    }),
  };

  // TODO
  // const base64 = buildImgixLqipUrl(
  //   url,
  //   secureUrlToken,
  // )({
  //   ...args.imgixParams,
  //   ...args.placeholderImgixParams,
  // });

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
    // base64,
    aspectRatio,
    src,
    srcWebp: srcWebp,
    srcSet: srcset,
    srcSetWebp: srcsetWebp,
    sizes: '(min-width: 8192px) 8192px, 100vw',
  };
};
