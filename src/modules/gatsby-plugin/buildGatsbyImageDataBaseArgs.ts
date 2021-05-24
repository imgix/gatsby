import ImgixClient from '@imgix/js-core';
import { IGatsbyImageHelperArgs, ImageFormat } from 'gatsby-plugin-image';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { IImgixParams } from '../../publicTypes';
import { IImgixGatsbyImageDataArgsResolved } from './privateTypes';

const generateImageSource = (
  client: IImgixURLBuilder,
): IGatsbyImageHelperArgs['generateImageSource'] => (
  imageName,
  width,
  height,
  format,
  fit,
  opts = {},
) => {
  const src = client.buildURL(imageName, {
    ...(typeof opts.imgixParams === 'object' && opts.imgixParams),
    w: width,
    h: height,
  });
  return { width, height, format: 'auto', src };
};

export type IBuildGatsbyImageDataBaseArgs = {
  resolverArgs: IImgixGatsbyImageDataArgsResolved;
  url: string;
  dimensions: {
    width: number;
    height: number;
  };
  defaultParams?: Partial<IImgixParams>;
  imgixClient: IImgixURLBuilder;
};
export const buildGatsbyImageDataBaseArgs = ({
  resolverArgs,
  url,
  dimensions: { width, height },
  defaultParams,
  imgixClient,
}: IBuildGatsbyImageDataBaseArgs) =>
  ({
    ...resolverArgs,
    pluginName: `@imgix/gatsby`,
    filename: url,
    sourceMetadata: { width, height, format: 'auto' as ImageFormat },
    // TODO: use breakpoints helper from gatsby-plugin-image hook
    breakpoints:
      resolverArgs.breakpoints ??
      ImgixClient.targetWidths(
        resolverArgs.srcSetMinWidth,
        resolverArgs.srcSetMaxWidth,
        resolverArgs.widthTolerance,
      ),
    formats: ['auto'] as ImageFormat[],
    generateImageSource: generateImageSource(imgixClient),
    options: {
      imgixParams: {
        ...defaultParams,
        ...resolverArgs.imgixParams,
      },
    },
  } as const);
