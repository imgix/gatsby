import { ObjectTypeComposerFieldConfigAsObjectDefinition } from 'graphql-compose';
import { createImgixURLBuilder } from './imgix-js-core-wrapper';

export const createExternalHelper = <
  TArgs,
  TFn extends Function
>(
  fieldConfigFactory: TFn,
): (<TSource, TContext>(
  params: Omit<TArgs, 'imgixClient' | 'resolveUrl'> & {
    imgixClientOptions?: Parameters<typeof createImgixURLBuilder>[0];
    resolveUrl?: (source: TSource) => string | null | undefined;
  },
) => ObjectTypeComposerFieldConfigAsObjectDefinition<TSource, TContext>) => {
  return ({ imgixClientOptions, ...args }) => ({
    ...fieldConfigFactory({
      ...args,
      imgixClient: createImgixURLBuilder(imgixClientOptions),
    }),
  });
};
