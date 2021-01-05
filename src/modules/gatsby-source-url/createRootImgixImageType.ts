import { GatsbyCache } from 'gatsby';
import {
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import type ImgixClient from 'imgix-core-js';
import * as R from 'ramda';
import { createImgixFixedFieldConfig } from './createImgixFixedFieldConfig';
import { createImgixFluidFieldConfig } from './createImgixFluidFieldConfig';
import { createImgixUrlFieldConfig } from './createImgixUrlFieldConfig';
import { IImgixGatsbyRootArgs, IImgixParams } from '../../publicTypes';

type IRootSource = {
  rawUrl: string;
};
export const createRootImgixImageType = (
  imgixClient: ImgixClient,
  cache: GatsbyCache,
  defaultParams: Partial<IImgixParams>,
  // TODO: fix any
): GraphQLFieldConfig<any, any, IImgixGatsbyRootArgs> => ({
  args: {
    url: {
      type: GraphQLNonNull(GraphQLString),
      description:
        'The path of the image to render. If using a Web Proxy Source, this must be a fully-qualified URL.',
    },
  },
  type: new GraphQLObjectType<any, any, any>({
    name: 'ImgixSourceImage',
    fields: {
      url: createImgixUrlFieldConfig<IRootSource, unknown>({
        imgixClient,
        resolveUrl: R.prop('rawUrl'),
        defaultParams,
      }),
      fluid: createImgixFluidFieldConfig<IRootSource, unknown>({
        imgixClient,
        resolveUrl: R.prop('rawUrl'),
        cache,
        defaultParams,
      }),
      fixed: createImgixFixedFieldConfig<IRootSource, unknown>({
        imgixClient,
        resolveUrl: R.prop('rawUrl'),
        cache,
        defaultParams,
      }),
    },
  }),
  resolve(_: any, args: IImgixGatsbyRootArgs): IRootSource {
    return { rawUrl: args.url };
  },
});
