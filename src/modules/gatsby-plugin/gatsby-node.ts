import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import {
  CreateSchemaCustomizationArgs,
  GatsbyGraphQLObjectType,
  ICreateSchemaCustomizationHook,
  PatchedPluginOptions,
} from 'gatsby';
import { GraphQLNonNull, GraphQLString } from 'gatsby/graphql';
import { PathReporter } from 'io-ts/PathReporter';
import get from 'lodash.get';
import { prop } from 'ramda';
import { IImgixGatsbyOptions, ImgixSourceType } from '../..';
import { VERSION } from '../../common/constants';
import {
  createImgixURLBuilder,
  IImgixURLBuilder,
} from '../../common/imgix-js-core-wrapper';
import { findPossibleURLsInNode } from '../../common/utils';
import { ImgixGatsbyOptionsIOTS } from '../../publicTypes';
import { buildImgixGatsbyTypes } from './typeBuilder';

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((element) => typeof element === 'string')
  );
}

const getFieldValue = ({
  fieldOptions,
  node,
}: {
  fieldOptions: Exclude<IImgixGatsbyOptions['fields'], undefined>[0];
  node: any;
}): E.Either<Error, string | string[]> =>
  (() => {
    const prefixURLPrefix = (url: string): string =>
      (fieldOptions.URLPrefix || '') + url;
    if ('rawURLKey' in fieldOptions) {
      return pipe(get(node, fieldOptions.rawURLKey), (value: unknown) =>
        value == null || typeof value !== 'string'
          ? E.left(new Error('rawURLKey must reference a URL string'))
          : E.right(prefixURLPrefix(value)),
      );
    } else if ('rawURLKeys' in fieldOptions) {
      return pipe(
        fieldOptions.rawURLKeys.map((rawURLKey) => get(node, rawURLKey)),
        (value: unknown) =>
          !isStringArray(value)
            ? E.left(
                new Error('rawURLKeys must reference a list of URL strings'),
              )
            : E.right(value.map(prefixURLPrefix)),
      );
    }
    const _neverReturn: never = fieldOptions; // Fixes typescript error 'not all code paths return a value'
    return _neverReturn;
  })();

/**
 * "Decode" the options that the user set in gatsby-config.js, to verify that
 * they match our expected options schema. If they don't, the Either will
 * contain an error.
 * @param options The options object from gatsby-config.js
 * @returns Either containing the options object if they are valid, or an error
 */
const decodeOptionsE = (options: PatchedPluginOptions<IImgixGatsbyOptions>) =>
  pipe(
    options,
    ImgixGatsbyOptionsIOTS.decode,
    E.mapLeft(
      (errs) =>
        new Error(
          `The plugin config is not in the correct format. Errors: ${PathReporter.report(
            E.left(errs),
          )}`,
        ),
    ),
    E.chain((options) => {
      if (
        options.sourceType === 'webProxy' &&
        (options.secureURLToken == null || options.secureURLToken.trim() === '')
      ) {
        return E.left(
          new Error(
            `The plugin option 'secureURLToken' is required when sourceType is 'webProxy'.`,
          ),
        );
      }
      if (options.fields != null && !Array.isArray(options.fields)) {
        return E.left(new Error('Fields must be an array of field options'));
      }
      if (
        options.sourceType === ImgixSourceType.WebProxy &&
        (options.secureURLToken == null || options.secureURLToken.trim() === '')
      ) {
        return E.left(
          new Error(
            'A secure URL token must be provided if sourceType is webProxy',
          ),
        );
      }
      return E.right(options);
    }),
  );

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
 * createSchemaCustomaztion is a Gatsby core API hook which can be used to
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
  const validatedOptions = decodeOptionsE(_options);
  if (E.isLeft(validatedOptions)) {
    const errorString = `[@imgix/gatsby] Fatal error during setup, plugin options are not valid: ${String(
      validatedOptions.left,
    )}`;
    gatsbyContext.reporter.panic(errorString);
    throw new Error(errorString);
  }

  // This creates the "imgix client" (it is actually a modified version of the
  // core imgix client), which will be passed around to be used in the
  // application
  const imgixClient = setupImgixClient({
    options: validatedOptions.right,
    packageVersion: VERSION,
  });

  // Create the imgix GraphQL types, which will be added to the schema later
  const typesAndFields = buildImgixGatsbyTypes<{ rawURL: string }>({
    cache: gatsbyContext.cache,
    imgixClient,
    resolveUrl: prop('rawURL'),
    defaultParams: validatedOptions.right.defaultImgixParams,
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

  const optionsFields = validatedOptions.right.fields ?? [];

  const fieldTypes = createFieldTypes(
    optionsFields,
    gatsbyContext,
    imgixImageType,
  );
  const rootType = createRootObjectType(gatsbyContext, imgixImageType);

  // Now, we actually add the types and fields to the schema
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
            type: GraphQLNonNull(GraphQLString),
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
            const rawURLE = getFieldValue({
              fieldOptions,
              node,
            });

            return {
              rawURL: E.getOrElseW(() => {
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

                return gatsbyContext.reporter.panic(
                  `Error when resolving URL value for node type ${fieldOptions.nodeType}. This probably means that the rawURLKey function in gatsby-config.js is incorrectly set. Please read this project's README for detailed instructions on how to set this correctly.
                      
${potentialImagesString}`,
                );
              })(rawURLE),
            };
          },
        },
      },
    }),
  );
}
