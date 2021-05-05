import { FixedObject, FluidObject } from 'gatsby-image';
import { generateImageData, IGatsbyImageData } from 'gatsby-plugin-image';
import { createImgixURLBuilder } from './common/imgix-js-core-wrapper';
import {
  buildGatsbyImageDataBaseArgs,
  IBuildGatsbyImageDataBaseArgs,
} from './modules/gatsby-source-url/createImgixGatsbyImageDataFieldConfig';
import * as internalObjectBuilders from './modules/gatsby-source-url/objectBuilders';
import { buildImgixGatsbyTypes } from './modules/gatsby-source-url/typeBuilder';

export const createImgixGatsbyTypes = ({
  imgixClientOptions,
  ...params
}: Omit<
  Parameters<typeof buildImgixGatsbyTypes>[0],
  'imgixClient' | 'resolveUrl' | 'resolveWidth' | 'resolveHeight'
> & {
  imgixClientOptions?: Parameters<typeof createImgixURLBuilder>[0];
  resolveUrl: (source: any) => string | null;
  resolveWidth?: (source: any) => number | undefined;
  resolveHeight?: (source: any) => number | undefined;
}) =>
  buildImgixGatsbyTypes({
    ...params,
    imgixClient: createImgixURLBuilder(imgixClientOptions),
  });

export const buildFluidObject = ({
  imgixClientOptions,
  ...args
}: Omit<internalObjectBuilders.BuildImgixFluidArgs, 'client'> & {
  imgixClientOptions?: Parameters<typeof createImgixURLBuilder>[0];
}): FluidObject => {
  return internalObjectBuilders.buildFluidObject({
    ...args,
    client: createImgixURLBuilder(imgixClientOptions),
  });
};

export const buildFixedObject = ({
  imgixClientOptions,
  ...args
}: Omit<internalObjectBuilders.BuildImgixFixedArgs, 'client'> & {
  imgixClientOptions?: Parameters<typeof createImgixURLBuilder>[0];
}): FixedObject => {
  return internalObjectBuilders.buildImgixFixed({
    ...args,
    client: createImgixURLBuilder(imgixClientOptions),
  });
};

export const buildGatsbyImageDataObject = ({
  imgixClientOptions,
  ...args
}: Omit<IBuildGatsbyImageDataBaseArgs, 'imgixClient'> & {
  imgixClientOptions?: Parameters<typeof createImgixURLBuilder>[0];
}): IGatsbyImageData => {
  const imgixClient = createImgixURLBuilder(imgixClientOptions);
  const generateImageDataArgs = buildGatsbyImageDataBaseArgs({
    ...args,
    imgixClient,
  });
  return generateImageData(generateImageDataArgs);
};
