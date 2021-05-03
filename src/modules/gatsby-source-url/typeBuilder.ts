import { GatsbyCache } from 'gatsby';
import {
  EnumTypeComposerAsObjectDefinition,
  InputTypeComposerAsObjectDefinition,
  ObjectTypeComposerAsObjectDefinition,
  ObjectTypeComposerFieldConfigAsObjectDefinition,
} from 'graphql-compose';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { ArrayElement } from '../../common/tsUtils';
import { ImgixSourceDataResolver } from '../../common/utils';
import { IImgixParams } from '../../publicTypes';
import { createImgixFixedFieldConfig } from './createImgixFixedFieldConfig';
import { createImgixFluidFieldConfig } from './createImgixFluidFieldConfig';
import { createImgixGatsbyImageFieldConfig } from './createImgixGatsbyImageDataFieldConfig';
import { createImgixUrlFieldConfig } from './createImgixUrlFieldConfig';
import { getTypeName } from './fieldNames';
import {
  createImgixFixedType,
  createImgixFluidType,
  ImgixParamsInputType,
  ImgixPlaceholderType,
} from './graphqlTypes';

/**
 * This function can be used to return a set of graphql-compose types that should be passed to schema.createObjectType
 */
export const buildImgixGatsbyTypes = <TSource>({
  allowlistFields = ['url', 'fixed', 'fluid', 'gatsbyImageData'],
  imgixClient,
  resolveUrl,
  resolveWidth,
  resolveHeight,
  defaultParams,
  cache,
  namespace,
}: {
  allowlistFields?: ('url' | 'fixed' | 'fluid' | 'gatsbyImageData')[];
  namespace?: string;
  imgixClient: IImgixURLBuilder;
  resolveUrl: ImgixSourceDataResolver<TSource, string>;
  resolveHeight?: ImgixSourceDataResolver<TSource, number | undefined>;
  resolveWidth?: ImgixSourceDataResolver<TSource, number | undefined>;
  defaultParams?: IImgixParams;
  cache: GatsbyCache;
}) => {
  const types: ObjectTypeComposerAsObjectDefinition<any, unknown>[] = [];
  const inputTypes: InputTypeComposerAsObjectDefinition[] = [];
  const enumTypes: EnumTypeComposerAsObjectDefinition[] = [];

  const fields: Record<
    string,
    ObjectTypeComposerFieldConfigAsObjectDefinition<any, any>
  > = {};

  const paramsInputType = ImgixParamsInputType({
    name: getTypeName({ typeName: 'ParamsInput' }),
  });
  inputTypes.push(paramsInputType);

  if (allowlistFields.includes('url')) {
    fields.url = createImgixUrlFieldConfig({
      imgixClient,
      resolveUrl,
      defaultParams,
      paramsInputType: paramsInputType.name,
    });
  }

  if (allowlistFields.includes('fixed')) {
    const fixedType = createImgixFixedType({
      cache,
      name: getTypeName({ typeName: 'Fixed', namespace }),
    });
    types.push(fixedType);
    fields.fixed = createImgixFixedFieldConfig({
      type: fixedType.name,
      imgixClient,
      cache,
      resolveUrl,
      resolveWidth,
      resolveHeight,
      defaultParams,
      paramsInputType: paramsInputType.name,
    });
  }

  if (allowlistFields.includes('fluid')) {
    const fluidType = createImgixFluidType({
      cache,
      name: getTypeName({ typeName: 'Fluid', namespace }),
    });
    types.push(fluidType);
    fields.fluid = createImgixFluidFieldConfig({
      type: fluidType.name,
      imgixClient,
      cache,
      resolveUrl,
      resolveWidth,
      resolveHeight,
      defaultParams,
      paramsInputType: paramsInputType.name,
    });
  }

  if (allowlistFields.includes('gatsbyImageData')) {
    const placeholderType = ImgixPlaceholderType(
      getTypeName({ typeName: 'Placeholder', namespace }),
    );
    enumTypes.push(placeholderType);
    fields.gatsbyImageData = createImgixGatsbyImageFieldConfig({
      imgixClient,
      cache,
      resolveUrl,
      resolveWidth,
      resolveHeight,
      defaultParams,
      paramsInputType: paramsInputType.name,
      placeholderEnumType: placeholderType.name,
    });
  }

  return {
    types,
    fields: fields as Record<
      ArrayElement<typeof allowlistFields>,
      ObjectTypeComposerFieldConfigAsObjectDefinition<any, any>
    >,
    inputTypes,
    enumTypes,
  };
};
