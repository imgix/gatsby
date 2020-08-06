import { GraphQLFieldConfig, GraphQLObjectType, GraphQLString } from 'graphql';
import type ImgixClient from 'imgix-core-js';
import * as R from 'ramda';
import { createImgixUrlFieldConfig } from './createImgixUrlFieldConfig';
import { IGatsbySourceUrlRootArgs } from './publicTypes';

type IRootSource = {
  rawUrl: string;
};
export const createRootImgixImageType = (
  imgixClient: ImgixClient,
  // fix any
): GraphQLFieldConfig<any, any, IGatsbySourceUrlRootArgs> => ({
  args: {
    url: {
      type: GraphQLString,
    },
  },
  type: new GraphQLObjectType({
    name: 'ImgixSourceImage',
    fields: {
      url: createImgixUrlFieldConfig<IRootSource, unknown>({
        imgixClient,
        resolveUrl: R.prop('rawUrl'),
      }),
    },
  }),
  resolve(_: any, args: IGatsbySourceUrlRootArgs): IRootSource {
    return { rawUrl: args.url };
  },
});
