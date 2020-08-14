import { camelCase } from 'camel-case';
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import imgixUrlParameters from 'imgix-url-params/dist/parameters.json';

export const ImgixUrlParamsInputType = new GraphQLInputObjectType({
  name: 'GatsbySourceImgixParamsInput',
  fields: Object.keys(imgixUrlParameters.parameters).reduce((fields, param) => {
    const spec =
      imgixUrlParameters.parameters[
        param as keyof typeof imgixUrlParameters.parameters
      ];

    // The param name is camel-cased here to appease the GraphQL field
    // requirements. This will need to be reversed with param-case when the
    // URL is constructed in `buildImgixUrl`.
    const name = camelCase(param);

    const expects = spec.expects as { type: string }[];
    const expectsTypes = Array.from(
      new Set(expects.map((expect) => expect.type)),
    );

    // TODO: Clean up this mess.
    const type = expectsTypes.every(
      (type) => type === 'integer' || type === 'unit_scalar',
    )
      ? GraphQLInt
      : expectsTypes.every(
          (type) =>
            type === 'integer' || type === 'unit_scalar' || type === 'number',
        )
      ? GraphQLFloat
      : expectsTypes.every((type) => type === 'boolean')
      ? GraphQLBoolean
      : GraphQLString;

    fields[name] = {
      type,
      description:
        spec.short_description +
        // Ensure the description ends with a period.
        (spec.short_description.slice(-1) === '.' ? '' : '.'),
    };

    // Add the default value as part of the description. Setting it as a
    // GraphQL default value will automatically assign it in the final URL.
    // Doing so would result in a huge number of unwanted params.
    if ('default' in spec)
      fields[name].description =
        fields[name].description + ` Default: \`${spec.default}\`.`;

    // Add Imgix documentation URL as part of the description.
    if ('url' in spec)
      fields[name].description =
        fields[name].description + ` [See docs](${spec.url}).`;

    // Create aliased fields.
    if ('aliases' in spec)
      for (const alias of spec.aliases)
        fields[camelCase(alias)] = {
          ...fields[name],
          description: `Alias for \`${name}\`.`,
        };

    return fields;
  }, {} as GraphQLInputFieldConfigMap),
});

/**
 * The GraphQL type of the fluid field.
 * Corresponding TS type is FluidObject from gatsby-image.
 */
export const gatsbySourceImgixFluidFieldType = new GraphQLObjectType({
  name: 'SourceImgixFluid',
  fields: {
    // base64: createImgixBase64UrlFieldConfig({ cache }),
    src: { type: new GraphQLNonNull(GraphQLString) },
    srcSet: { type: new GraphQLNonNull(GraphQLString) },
    srcWebp: { type: new GraphQLNonNull(GraphQLString) },
    srcSetWebp: { type: new GraphQLNonNull(GraphQLString) },
    sizes: { type: new GraphQLNonNull(GraphQLString) },
    aspectRatio: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export type IGatsbySourceImgixUrlField = string;
export const gatsbySourceImgixUrlFieldType = GraphQLString;
