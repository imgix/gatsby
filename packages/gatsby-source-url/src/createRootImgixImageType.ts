import { GatsbyCache } from 'gatsby';
import { GraphQLFieldConfig, GraphQLObjectType, GraphQLString } from 'graphql';
import type ImgixClient from 'imgix-core-js';
import * as R from 'ramda';
import { createImgixFluidFieldConfig } from './createImgixFluidFieldConfig';
import { createImgixUrlFieldConfig } from './createImgixUrlFieldConfig';
import { IGatsbySourceUrlRootArgs } from './publicTypes';

type IRootSource = {
  rawUrl: string;
};
export const createRootImgixImageType = (
  imgixClient: ImgixClient,
  cache: GatsbyCache,
  // fix any
): GraphQLFieldConfig<any, any, IGatsbySourceUrlRootArgs> => ({
  args: {
    url: {
      type: GraphQLString,
    },
  },
  type: new GraphQLObjectType<any, any, any>({
    name: 'ImgixSourceImage',
    fields: {
      url: createImgixUrlFieldConfig<IRootSource, unknown>({
        imgixClient,
        resolveUrl: R.prop('rawUrl'),
      }),
      fluid: createImgixFluidFieldConfig<IRootSource, unknown>({
        imgixClient,
        resolveUrl: R.prop('rawUrl'),
        cache: cache,
      }),
    },
  }),
  resolve(_: any, args: IGatsbySourceUrlRootArgs): IRootSource {
    return { rawUrl: args.url };
  },
});
