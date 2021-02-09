import { Do } from 'fp-ts-contrib/lib/Do';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { ICreateSchemaCustomizationHook, PatchedPluginOptions } from 'gatsby';
import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { PathReporter } from 'io-ts/PathReporter';
import * as R from 'ramda';
import readPkgUp from 'read-pkg-up';
import { IImgixGatsbyOptions, ImgixSourceType } from '../..';
import { createImgixClient } from '../../common/imgix-core-js-wrapper';
import { findPossibleURLsInNode } from '../../common/utils';
import { ImgixGatsbyOptionsIOTS } from '../../publicTypes';
import { createImgixFixedFieldConfig } from '../gatsby-source-url/createImgixFixedFieldConfig';
import { createImgixFluidFieldConfig } from '../gatsby-source-url/createImgixFluidFieldConfig';
import { createImgixUrlFieldConfig } from '../gatsby-source-url/createImgixUrlFieldConfig';
import {
  createImgixFixedType,
  createImgixFluidType,
} from '../gatsby-source-url/graphqlTypes';

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

const getPackageVersionE = () =>
  pipe(
    readPkgUp.sync({ cwd: __dirname })?.packageJson?.version,
    E.fromNullable(new Error('Could not read package version.')),
  );

const setupImgixClientE = ({
  options,
  packageVersion,
}: {
  options: IImgixGatsbyOptions;
  packageVersion: string;
}) =>
  Do(E.either)
    .bind(
      'imgixClient',
      createImgixClient({
        domain: options.domain,
        secureURLToken: options.secureURLToken,
      }),
    )
    .doL(({ imgixClient }) => {
      imgixClient.includeLibraryParam = false;
      if (options.disableIxlibParam !== true) {
        (imgixClient as any).settings.libraryParam = `gatsby-source-url-${packageVersion}`;
      }
      return E.right(imgixClient);
    })
    .return(R.prop('imgixClient'));

export const createSchemaCustomization: ICreateSchemaCustomizationHook<IImgixGatsbyOptions> = async (
  gatsbyContext,
  _options,
): Promise<any> =>
  pipe(
    Do(E.either)
      .bind('options', decodeOptionsE(_options))

      .bind('packageVersion', getPackageVersionE())
      .bindL('imgixClient', ({ options, packageVersion }) =>
        setupImgixClientE({ options, packageVersion }),
      )
      .let(
        'imgixFixedType',
        createImgixFixedType({
          name: 'ImgixFixed',
          cache: gatsbyContext.cache,
        }),
      )
      .let(
        'imgixFluidType',
        createImgixFluidType({
          name: 'ImgixFluid',
          cache: gatsbyContext.cache,
        }),
      )
      .letL(
        'imgixImageType',
        ({
          imgixFluidType,
          imgixFixedType,
          imgixClient,
          options: { defaultImgixParams },
        }) =>
          new GraphQLObjectType<any, any, any>({
            name: 'ImgixImage',
            fields: {
              url: createImgixUrlFieldConfig<any, any>({
                resolveUrl: R.prop('rawURL'),
                imgixClient,
                defaultParams: defaultImgixParams,
              }),
              fluid: createImgixFluidFieldConfig({
                type: imgixFluidType,
                cache: gatsbyContext.cache,
                imgixClient,
                resolveUrl: R.prop('rawURL'),
                defaultParams: defaultImgixParams,
              }),
              fixed: createImgixFixedFieldConfig<any, unknown>({
                type: imgixFixedType,
                cache: gatsbyContext.cache,
                imgixClient,
                resolveUrl: R.prop('rawURL'),
                defaultParams: defaultImgixParams,
              }),
            },
          }),
      )
      .letL(
        'fieldTypes',
        ({ imgixImageType, options: { domain, fields = [] } }) =>
          fields.map((fieldOptions) =>
            gatsbyContext.schema.buildObjectType({
              name: `${fieldOptions.nodeType}`,
              fields: {
                [fieldOptions.fieldName]: {
                  type:
                    'getURLs' in fieldOptions
                      ? `[${imgixImageType.name}]`
                      : imgixImageType.name,
                  resolve: (node: unknown) => {
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
      .letL('rootType', ({ imgixImageType }) =>
        gatsbyContext.schema.buildObjectType({
          name: 'Query',
          fields: {
            imgixImage: {
              type: imgixImageType,
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
      .doL(
        ({
          imgixFixedType,
          imgixFluidType,
          imgixImageType,
          rootType,
          fieldTypes,
          options: {
            // TODO: handle
            // namespace,
            // TODO: handle
            // defaultPlaceholderImgixParams,
          },
        }) =>
          E.tryCatch(
            () => {
              const { createTypes } = gatsbyContext.actions;
              createTypes([imgixFixedType, imgixFluidType]);
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
