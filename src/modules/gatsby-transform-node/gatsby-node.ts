import { ICreateSchemaCustomizationHook, IOnCreateNodeHook } from 'gatsby';
import ImgixClient from 'imgix-core-js';
import { IImgixGatsbyOptions, ImgixSourceType } from '../..';
import { invariant, transformUrlForWebProxy } from '../../common/utils';
import { createImgixFixedSchemaFieldConfig } from '../gatsby-source-url/createImgixFixedFieldConfig';
import { createImgixFluidSchemaFieldConfig } from '../gatsby-source-url/createImgixFluidFieldConfig';
import { createImgixUrlSchemaFieldConfig } from '../gatsby-source-url/createImgixUrlFieldConfig';
import { createImgixFixedType } from '../gatsby-source-url/graphqlTypes';

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
    let fieldValue = undefined as string | string[] | undefined;

    if ('getURL' in field) {
      fieldValue = field.getURL(node);
      invariant(
        fieldValue === undefined ||
          fieldValue === null ||
          typeof fieldValue === 'string',
        'getUrl must return a URL string',
        reporter,
      );
    } else if ('getURLs' in field) {
      fieldValue = field.getURLs(node);
      invariant(
        Array.isArray(fieldValue),
        'getUrls must return an array of URLs',
        reporter,
      );
    }

    if (!fieldValue) continue;

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

      if (Array.isArray(fieldValue))
        fieldValue = fieldValue.map((url) =>
          transformUrlForWebProxy(url, domain),
        );
      else {
        fieldValue = transformUrlForWebProxy(fieldValue, domain);
      }
    }

    createNodeField({ node, name: field.fieldName, value: fieldValue });
  }
};

export const createSchemaCustomization: ICreateSchemaCustomizationHook<IImgixGatsbyOptions> = async (
  gatsbyContext,
  pluginOptions,
): Promise<any> => {
  const { actions, cache, schema, reporter } = gatsbyContext;
  const { createTypes } = actions;

  const {
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

  const imgixClient: ImgixClient = null as any;

  const ImgixFixedType = createImgixFixedType(
    // name: ns(namespace, 'ImgixFixed'),
    cache,
  );

  const ImgixFluidType = createImgixFixedType(
    // name: ns(namespace, 'ImgixFluid'),
    cache,
  );

  const ImgixImageType = schema.buildObjectType({
    // name: ns(namespace, 'ImgixImage'),
    name: 'ImgixImage',
    fields: {
      url: createImgixUrlSchemaFieldConfig({
        resolveUrl: (url: string) => url,
        imgixClient,
        defaultParams: defaultImgixParams,
      }),
      fixed: createImgixFixedSchemaFieldConfig({
        // type: ImgixFixedType,
        resolveUrl: (url: string) => url,
        imgixClient,
        defaultParams: defaultImgixParams,
        // defaultPlaceholderImgixParams,
        cache,
      }),
      fluid: createImgixFluidSchemaFieldConfig({
        // type: ImgixFluidType,
        resolveUrl: (url: string) => url,
        imgixClient,
        defaultParams: defaultImgixParams,
        // defaultPlaceholderImgixParams,
        cache,
      }),
    },
  });

  const fieldTypes = fields.map((fieldOptions) =>
    schema.buildObjectType({
      name: `${fieldOptions.nodeType}Fields`,
      fields: {
        [fieldOptions.fieldName]: {
          type:
            'getUrls' in fieldOptions
              ? `[${ImgixImageType.config.name}]`
              : ImgixImageType.config.name,
        },
      },
    }),
  );

  // createTypes([ImgixFixedType, ImgixFluidType]);
  // createTypes(ImgixImageType);
  createTypes(fieldTypes);
};
