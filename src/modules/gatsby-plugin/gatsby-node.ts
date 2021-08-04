import { Do } from 'fp-ts-contrib/lib/Do';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import { ICreateSchemaCustomizationHook, PatchedPluginOptions } from 'gatsby';
import { GraphQLNonNull, GraphQLString } from 'gatsby/graphql';
import { PathReporter } from 'io-ts/PathReporter';
import * as R from 'ramda';
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
    if ('getURL' in fieldOptions) {
      return pipe(fieldOptions.getURL(node), (value: unknown) =>
        value == null || typeof value !== 'string'
          ? E.left(new Error('getURL must return a URL string'))
          : E.right(value),
      );
    } else if ('getURLs' in fieldOptions) {
      return pipe(fieldOptions.getURLs(node), (value: unknown) =>
        !isStringArray(value)
          ? E.left(new Error('getURL must return a URL string'))
          : E.right(value),
      );
    }
    const _neverReturn: never = fieldOptions; // Fixes typescript error 'not all code paths return a value'
    return _neverReturn;
  })();
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

export const createSchemaCustomization: ICreateSchemaCustomizationHook<IImgixGatsbyOptions> = async (
  gatsbyContext,
  _options,
): Promise<any> =>
  pipe(
    Do(E.either)
      .bind('options', decodeOptionsE(_options))

      .let('packageVersion', VERSION)
      .letL('imgixClient', ({ options, packageVersion }) =>
        setupImgixClient({ options, packageVersion }),
      )
      .letL(
        'typesAndFields',
        ({ imgixClient, options: { defaultImgixParams } }) =>
          buildImgixGatsbyTypes<{ rawURL: string }>({
            cache: gatsbyContext.cache,
            imgixClient,
            resolveUrl: R.prop('rawURL'),
            defaultParams: defaultImgixParams,
          }),
      )
      .letL('imgixImageType', ({ typesAndFields }) =>
        gatsbyContext.schema.buildObjectType({
          name: 'ImgixImage',
          fields: {
            url: typesAndFields.fields.url,
            fluid: typesAndFields.fields.fluid,
            fixed: typesAndFields.fields.fixed,
            gatsbyImageData: typesAndFields.fields.gatsbyImageData,
          },
        }),
      )
      .letL(
        'fieldTypes',
        ({ imgixImageType, options: { domain, fields = [] } }) =>
          fields.map((fieldOptions) =>
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
                    'getURLs' in fieldOptions
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

                        return gatsbyContext.reporter.panic(
                          `Error when resolving URL value for node type ${
                            fieldOptions.nodeType
                          }. This probably means that the getURL function in gatsby-config.js is incorrectly set. Please read this project's README for detailed instructions on how to set this correctly.
                          
${
  urlPathsFound.length > 0
    ? `Potential images were found at these paths: 
${urlPathsFound
  .map(
    ({ path, value }) =>
      ` - ${path}
   Usage: getURL: (node) => ${
     value.startsWith('http') ? `node.${path}` : `\`https:\${node.${path}}\``
   }`,
  )
  .join('\n')}
`
    : ''
}
                          `,
                        );
                      })(rawURLE),
                    };
                  },
                },
              },
            }),
          ),
      )
      .letL(`rootType`, ({ imgixImageType }) =>
        gatsbyContext.schema.buildObjectType({
          name: 'Query',
          fields: {
            imgixImage: {
              type: imgixImageType.config.name,
              resolve(
                _: any,
                args: Record<string, unknown>,
              ): IRootSource | null {
                if (args?.url == null || typeof args?.url !== 'string') {
                  return null;
                }
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
        }),
      )
      // prettier-ignore
      .doL(
        ({
          typesAndFields,
          imgixImageType,
          rootType,
          fieldTypes,
          options: {},
        }) =>
          E.tryCatch(
            () => {
              const { createTypes } = gatsbyContext.actions;
              createTypes(
                typesAndFields.types.map(gatsbyContext.schema.buildObjectType),
              );
              createTypes(
                typesAndFields.enumTypes.map(
                  gatsbyContext.schema.buildEnumType,
                ),
              );
              createTypes(
                typesAndFields.inputTypes.map(
                  gatsbyContext.schema.buildInputObjectType,
                ),
              );
              createTypes(fieldTypes);
              createTypes(imgixImageType);
              createTypes(rootType);
            },
            (e) => (e instanceof Error ? e : new Error('unknown error')),
          ),
      )
      .return(() => undefined),
    E.getOrElseW((err) => {
      gatsbyContext.reporter.panic(
        `[@imgix/gatsby] Fatal error during setup: ${String(err)}`,
      );
      throw err;
    }),
  );

type IRootSource = {
  rawURL: string;
};
