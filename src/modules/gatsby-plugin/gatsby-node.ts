import {
  CreateSchemaCustomizationArgs,
  GatsbyGraphQLObjectType,
  ICreateSchemaCustomizationHook,
  PatchedPluginOptions,
} from 'gatsby';
import { GraphQLNonNull, GraphQLString } from 'gatsby/graphql';
import get from 'lodash.get';
import { prop } from 'ramda';
import { IImgixGatsbyOptions, ImgixSourceType } from '../..';
import { VERSION } from '../../common/constants';
import {
  createImgixURLBuilder,
  IImgixURLBuilder,
} from '../../common/imgix-js-core-wrapper';
import { findPossibleURLsInNode } from '../../common/utils';
import { buildImgixGatsbyTypes } from './typeBuilder';

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((element) => typeof element === 'string')
  );
}

type URL = string;
/**
 * Given a GraphQL node (instance of a type), and the plugin options, fetch the
 * image url to proxy through imgix.
 * @param fieldOptions The options object from gatsby-config.js
 * @param node The GraphQL node to search for the image URL in
 * @returns The image URL(s) if found, or throws an error
 */
const getFieldValue = ({
  fieldOptions,
  node,
}: {
  fieldOptions: Exclude<IImgixGatsbyOptions['fields'], undefined>[0];
  node: any;
}): URL | URL[] => {
  const prefixWithURLPrefix = (url: string): string =>
    (fieldOptions.URLPrefix || '') + url;

  if ('rawURLKey' in fieldOptions) {
    // Here we should be only fetching one url from the node
    const url = get(node, fieldOptions.rawURLKey);

    if (url == null || typeof url !== 'string') {
      throw new Error('rawURLKey must reference a URL string');
    }

    return prefixWithURLPrefix(url);
  } else if ('rawURLKeys' in fieldOptions) {
    // Here we are looking to fetch multiple urls
    const urls = fieldOptions.rawURLKeys.map((rawURLKey) =>
      get(node, rawURLKey),
    );

    if (!isStringArray(urls)) {
      throw new Error('rawURLKeys must reference a list of URL strings');
    }
    return urls.map(prefixWithURLPrefix);
  }
  const _neverReturn: never = fieldOptions; // Fixes typescript error 'not all code paths return a value'
  return _neverReturn;
};

/**
 * "Decode" the options that the user set in gatsby-config.js, to verify that
 * they match our expected options schema. If they don't, an error will be
 * thrown.
 * @param options The options object from gatsby-config.js
 * @returns The options object if it is valid, or throws an error
 */
const decodeOptions = (options: PatchedPluginOptions<IImgixGatsbyOptions>) => {
  if (
    options.sourceType === 'webProxy' &&
    (options.secureURLToken == null || options.secureURLToken.trim() === '')
  ) {
    throw new Error(
      `The plugin option 'secureURLToken' is required when sourceType is 'webProxy'.`,
    );
  }
  if (options.fields != null && !Array.isArray(options.fields)) {
    throw new Error('Fields must be an array of field options');
  }
  if (
    options.sourceType === ImgixSourceType.WebProxy &&
    (options.secureURLToken == null || options.secureURLToken.trim() === '')
  ) {
    throw new Error(
      'A secure URL token must be provided if sourceType is webProxy',
    );
  }

  return options;
};

const setupImgixClient = ({
  options,
  packageVersion,
}: {
  options: IImgixGatsbyOptions;
  packageVersion: string;
}): IImgixURLBuilder =>
  createImgixURLBuilder({
    domain: options.domain,
    secureURLToken: options.secureURLToken,
    ixlib:
      options.disableIxlibParam !== true
        ? `gatsbySourceUrl-${packageVersion}`
        : undefined,
  });

/**
 * createSchemaCustomization is a Gatsby core API hook which can be used to
 * update the GraphQL schema.
 * Here, we use it to add our imgix GraphQL types, as well as add fields to the
 * corresponding types, which are the types that the user has specified to
 * transform, as well as the the root Query type (this adds the imgixImage type
 * to the root query)
 */
export const createSchemaCustomization: ICreateSchemaCustomizationHook<IImgixGatsbyOptions> = async (
  gatsbyContext,
  _options,
): Promise<void> => {
  let validatedOptions;
  try {
    validatedOptions = decodeOptions(_options);
  } catch (error) {
    const errorString = `[@imgix/gatsby] Fatal error during setup, plugin options are not valid: ${String(
      error,
    )}`;
    gatsbyContext.reporter.panic(errorString);
    throw new Error(errorString);
  }

  // This creates the "imgix client" (it is actually a modified version of the
  // core imgix client), which will be passed around to be used in the
  // application
  const imgixClient = setupImgixClient({
    options: validatedOptions,
    packageVersion: VERSION,
  });

  // Create the imgix GraphQL types, which will be added to the schema later
  const typesAndFields = buildImgixGatsbyTypes<{ rawURL: string }>({
    cache: gatsbyContext.cache,
    imgixClient,
    resolveUrl: prop('rawURL'),
    defaultParams: validatedOptions.defaultImgixParams,
  });

  // Create the root "imgixImage" type which will exist at the root of the
  // GraphQL Query type, and also on every type that the user has specified to
  // modify
  const imgixImageType = gatsbyContext.schema.buildObjectType({
    name: 'ImgixImage',
    fields: {
      url: typesAndFields.fields.url,
      fluid: typesAndFields.fields.fluid,
      fixed: typesAndFields.fields.fixed,
      gatsbyImageData: typesAndFields.fields.gatsbyImageData,
    },
  });

  const optionsFields = validatedOptions.fields ?? [];

  const fieldTypes = createFieldTypes(
    optionsFields,
    gatsbyContext,
    imgixImageType,
  );
  const rootType = createRootObjectType(gatsbyContext, imgixImageType);

  // Now, we actually add the types and fields to the schema
  // For more information refer to the docs at
  // https://www.gatsbyjs.com/docs/reference/config-files/actions/#createTypes
  // and
  // https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/
  try {
    const { createTypes } = gatsbyContext.actions;
    createTypes(typesAndFields.types.map(gatsbyContext.schema.buildObjectType));
    createTypes(
      typesAndFields.enumTypes.map(gatsbyContext.schema.buildEnumType),
    );
    createTypes(
      typesAndFields.inputTypes.map(gatsbyContext.schema.buildInputObjectType),
    );
    createTypes(fieldTypes);
    createTypes(imgixImageType);
    createTypes(rootType);
  } catch (error) {
    const errorString =
      '[@imgix/gatsby] Error during setup when creating GraphQL types: ' +
      String(error);
    gatsbyContext.reporter.panic(errorString);
    throw new Error(errorString);
  }
};

type IRootSource = {
  rawURL: string;
};

/**
 * This "creates" a 'Query' type, with our imgixImage type as a field. Gatsby
 * will then later merge this with its own Query type, effectively adding our
 * imgixImage field to the root of the GraphQL schema.
 * @param gatsbyContext Gatsby context object passed into Gatsby hooks
 * @param imgixImageType The imgix image GraphQL type
 * @returns A GraphQL object type representing the GraphQL Query type.
 */
function createRootObjectType(
  gatsbyContext: CreateSchemaCustomizationArgs,
  imgixImageType: GatsbyGraphQLObjectType,
) {
  return gatsbyContext.schema.buildObjectType({
    // 'Query' here refers to the root GraphQL Query type
    name: 'Query',
    fields: {
      imgixImage: {
        type: imgixImageType.config.name,
        resolve(_: any, args: Record<string, unknown>): IRootSource | null {
          // If url is not defined, return null. In reality this shouldn't
          // happen due to the GraphQL type definition (below) ensuring that
          // this is not null.
          if (args?.url == null || typeof args?.url !== 'string') {
            return null;
          }

          // This "raw url" is transformed later in the resolvers for the fields
          // that are children of this type
          return { rawURL: args?.url };
        },
        args: {
          url: {
            type: new GraphQLNonNull(GraphQLString),
            description:
              'The path of the image to render. If using a Web Proxy Source, this must be a fully-qualified URL.',
          },
        },
      },
    },
  });
}

/**
 * This function "creates" types for the types that the user has specified that
 * we should modify. Gatsby will later merge these with the existing types,
 * adding our imgixImage field to the types that the user has specified.
 * @param optionsFields The fields that the user has specified to modify
 * @param gatsbyContext Gatsby context object passed into Gatsby hooks
 * @param imgixImageType The imgix image GraphQL type
 * @returns An array of GraphQL types, corresponding to the types that the user has specified to modify
 */
function createFieldTypes(
  optionsFields: Exclude<IImgixGatsbyOptions['fields'], undefined>,
  gatsbyContext: CreateSchemaCustomizationArgs,
  imgixImageType: GatsbyGraphQLObjectType,
) {
  return optionsFields.map((fieldOptions) =>
    gatsbyContext.schema.buildObjectType({
      name: `${fieldOptions.nodeType}`,
      // We have to declare that we're extending the Node interface here
      // This does the same as 'implements Node' does for SDL-defined types.
      // See here for more info:
      // https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/#:~:text=when%20defining%20top-level%20types%2C%20don%E2%80%99t%20forget%20to%20pass%20interfaces%3A%20%5B'node'%5D%2C%20which%20does%20the%20same%20for%20type%20builders%20as%20adding%20implements%20node%20does%20for%20sdl-defined%20types.%20
      interfaces: ['Node'],
      fields: {
        [fieldOptions.fieldName]: {
          type:
            'rawURLKeys' in fieldOptions
              ? `[${imgixImageType.config.name}]`
              : imgixImageType.config.name,
          resolve: (node: unknown): { rawURL: string | string[] } => {
            try {
              const rawURL = getFieldValue({
                fieldOptions,
                node,
              });
              return {
                rawURL,
              };
            } catch (error) {
              // If no urls are found, try to find possible image urls in the
              // data, and if some are found, try to provide a useful error
              // message
              const urlPathsFound =
                typeof node === 'object' && node != null
                  ? findPossibleURLsInNode(node)
                  : [];

              const potentialImagesString = (() => {
                if (urlPathsFound.length === 0) {
                  return '';
                }

                let output = '';
                output += 'Potential images were found at these paths:\n';
                urlPathsFound.map(({ path, value }) => {
                  output += ` - ${path}\n`;

                  if (value.startsWith('http')) {
                    output += '   Set following configuration options:\n';
                    output += `     rawURLKey: '${path}'\n`;
                    output += `     URLPrefix: 'https:'\n`;
                  } else {
                    output += '   Set following configuration option:\n';
                    output += `     rawURLKey: '${path}'\n`;
                  }
                });
                return output;
              })();

              gatsbyContext.reporter.panic(
                `Error when resolving URL value for node type ${fieldOptions.nodeType}. This probably means that the rawURLKey function in gatsby-config.js is incorrectly set. Please read this project's README for detailed instructions on how to set this correctly.
                      
${potentialImagesString}`,
              );
            }
          },
        },
      },
    }),
  );
}
