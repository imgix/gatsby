import { ICreateSchemaCustomizationHook, IOnCreateNodeHook } from 'gatsby';
import ImgixClient from 'imgix-core-js';
import { IImgixGatsbyOptions, ImgixSourceType } from '../..';
import { invariant } from '../../common/utils';
import { createImgixFixedSchemaFieldConfig } from '../gatsby-source-url/createImgixFixedFieldConfig';
import { createImgixFluidSchemaFieldConfig } from '../gatsby-source-url/createImgixFluidFieldConfig';
import { createImgixUrlSchemaFieldConfig } from '../gatsby-source-url/createImgixUrlFieldConfig';
import {
  createImgixFixedType,
  createImgixFluidType,
} from '../gatsby-source-url/graphqlTypes';

export const onCreateNode: IOnCreateNodeHook<IImgixGatsbyOptions> = async (
  gatsbyContext,
  pluginOptions,
) => {
  const { node, actions, reporter } = gatsbyContext;
  const { createNodeField } = actions;

  const { domain, secureURLToken, sourceType, fields = [] } = pluginOptions;
  invariant(
    Array.isArray(fields),
    'fields must be an array of field options',
    reporter,
  );

  const fieldOptions = fields.filter(
    (fieldOptions) => fieldOptions.nodeType === node.internal.type,
  );
  if (fieldOptions.length < 1) return;

  for (const field of fieldOptions) {
    if (sourceType === ImgixSourceType.WebProxy) {
      invariant(
        domain !== undefined,
        'an Imgix domain must be provided if sourceType is webProxy',
        reporter,
      );
      invariant(
        secureURLToken !== undefined,
        'a secure URL token must be provided if sourceType is webProxy',
        reporter,
      );

      // TODO: remove
      createNodeField({ node, name: field.fieldName, value: 'test' });
    }
  }
};

const getFieldValue = ({
  fieldOptions,
  node,
  domain,
  reporter,
}: any): string | string[] => {
  let fieldValue = undefined as string | string[] | undefined;

  if (fieldOptions.hasOwnProperty('getURL')) {
    fieldValue = fieldOptions.getURL(node);
    invariant(
      fieldValue == null || typeof fieldValue === 'string',
      'getURL must return a URL string',
      reporter,
    );
  } else if (fieldOptions.hasOwnProperty('getURLs')) {
    fieldValue = fieldOptions.getURLs(node);
    invariant(
      Array.isArray(fieldValue),
      'getURLs must return an array of URLs',
      reporter,
    );
  }
  if (!fieldValue) throw new Error('No field value');
  return fieldValue;
  // if (Array.isArray(fieldValue))
  //   return fieldValue.map((url) => transformUrlForWebProxy(url, domain));
  // else {
  //   return transformUrlForWebProxy(fieldValue, domain);
  // }
};

export const createSchemaCustomization: ICreateSchemaCustomizationHook<IImgixGatsbyOptions> = async (
  gatsbyContext,
  pluginOptions,
): Promise<any> => {
  const { actions, cache, schema, reporter } = gatsbyContext;
  const { createTypes } = actions;

  const {
    domain,
    secureURLToken,
    sourceType,
    // namespace,
    defaultImgixParams,
    // defaultPlaceholderImgixParams,
    fields = [],
  } = pluginOptions;
  invariant(
    Array.isArray(fields),
    'fields must be an array of field options',
    reporter,
  );
  invariant(
    sourceType !== ImgixSourceType.WebProxy || Boolean(secureURLToken),
    'a secure URL token must be provided if sourceType is webProxy',
    reporter,
  );

  // TODO: change to real client creation
  const imgixClient: ImgixClient = new ImgixClient({
    domain: domain,
    secureURLToken,
  });

  const ImgixFixedType = createImgixFixedType({
    name: 'ImgixNodeFixed',
    cache,
  });

  const ImgixFluidType = createImgixFluidType({
    name: 'ImgixNodeFluid',
    cache,
  });

  const ImgixImageCustomType = schema.buildObjectType({
    name: 'ImgixNodeRoot',
    fields: {
      url: createImgixUrlSchemaFieldConfig({
        resolveUrl: (url: string) => url,
        imgixClient,
        defaultParams: defaultImgixParams,
      }),
      fluid: createImgixFluidSchemaFieldConfig({
        type: ImgixFluidType,
        cache,
        imgixClient,
        resolveUrl: (url: string) => url,
      }),
      fixed: createImgixFixedSchemaFieldConfig({
        type: ImgixFixedType,
        cache,
        imgixClient,
        resolveUrl: (url: string) => url,
      }),
    },
  });

  const fieldTypes = fields.map((fieldOptions) =>
    schema.buildObjectType({
      name: `${fieldOptions.nodeType}`,
      fields: {
        [fieldOptions.fieldName]: {
          type:
            'getURLs' in fieldOptions
              ? `[${ImgixImageCustomType.config.name}]`
              : ImgixImageCustomType.config.name,
          resolve: (node: any) =>
            getFieldValue({
              fieldOptions,
              node,
              domain,
              reporter,
            }),
        },
      },
    }),
  );

  createTypes([ImgixFixedType, ImgixFluidType]);
  createTypes([ImgixImageCustomType, ...fieldTypes]);
  // createTypes(fieldTypes);
};
