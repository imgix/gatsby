import { FixedObject, FluidObject } from 'gatsby-image';
import { generateImageData, IGatsbyImageData } from 'gatsby-plugin-image';
import { createImgixURLBuilder } from './common/imgix-js-core-wrapper';
import {
  buildGatsbyImageDataBaseArgs,
  IBuildGatsbyImageDataBaseArgs,
} from './modules/gatsby-plugin/buildGatsbyImageDataBaseArgs';
import * as internalObjectBuilders from './modules/gatsby-plugin/objectBuilders';

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
