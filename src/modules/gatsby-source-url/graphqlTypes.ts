import { camelCase } from 'camel-case';
import { GatsbyCache } from 'gatsby';
/**
 * The GraphQL type of the fluid field.
 * Corresponding TS type is FluidObject from gatsby-image.
 */
import { FixedObject, FluidObject } from 'gatsby-image';
import {
  EnumTypeComposerAsObjectDefinition,
  InputTypeComposerAsObjectDefinition,
  InputTypeComposerFieldConfigAsObjectDefinition,
  InputTypeComposerFieldConfigMapDefinition,
  ObjectTypeComposerAsObjectDefinition,
} from 'graphql-compose';
import imgixUrlParameters from 'imgix-url-params/dist/parameters.json';
import { createImgixBase64FieldConfig } from './createImgixBase64FieldConfig';

export const ImgixParamsInputType = ({
  name,
}: {
  name: string;
}): InputTypeComposerAsObjectDefinition => ({
  name,
  fields: Object.keys(imgixUrlParameters.parameters).reduce(
    (fields: InputTypeComposerFieldConfigMapDefinition, param) => {
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
      const type = expectsTypes.every((type) => type === 'integer')
        ? 'Int'
        : expectsTypes.every(
            (type) =>
              type === 'integer' || type === 'unit_scalar' || type === 'number',
          )
        ? 'Float'
        : expectsTypes.every((type) => type === 'boolean')
        ? 'Boolean'
        : 'String';

      fields[name] = {
        type,
        description:
          spec.short_description +
          // Ensure the description ends with a period.
          (spec.short_description.slice(-1) === '.' ? '' : '.'),
      };

      const field = fields[
        name
      ] as InputTypeComposerFieldConfigAsObjectDefinition;

      // Add the default value as part of the description. Setting it as a
      // GraphQL default value will automatically assign it in the final URL.
      // Doing so would result in a huge number of unwanted params.
      if ('default' in spec)
        field.description =
          field.description + ` Default: \`${spec.default}\`.`;

      // Add Imgix documentation URL as part of the description.
      if ('url' in spec)
        field.description = field.description + ` [See docs](${spec.url}).`;

      // Create aliased fields.
      if ('aliases' in spec)
        for (const alias of spec.aliases)
          fields[camelCase(alias)] = {
            ...field,
            description: `Alias for \`${name}\`.`,
          };

      return fields;
    },
    {},
  ),
});

const createBase64ConfigWithResolver = <T extends FluidObject | FixedObject>(
  cache: GatsbyCache,
) =>
  createImgixBase64FieldConfig<T>({
    resolveUrl: (obj) => obj.base64,
    cache,
  });

export const createImgixFluidType = ({
  cache,
  name,
}: {
  name: string;
  cache: GatsbyCache;
}): ObjectTypeComposerAsObjectDefinition<any, any> => ({
  name,
  fields: {
    base64: createBase64ConfigWithResolver<FluidObject>(cache),
    src: { type: 'String!' },
    srcSet: { type: 'String!' },
    srcWebp: { type: 'String!' },
    srcSetWebp: { type: 'String!' },
    sizes: { type: 'String!' },
    aspectRatio: { type: 'Float!' },
  },
});

let fluidType: ReturnType<typeof createImgixFluidType>;

export const getImgixFluidType = (
  args: Parameters<typeof createImgixFluidType>,
) => {
  if (!fluidType) {
    fluidType = createImgixFluidType(...args);
  }
  return fluidType;
};

export const createImgixFixedType = ({
  name,
  cache,
}: {
  name: string;
  cache: GatsbyCache;
}): ObjectTypeComposerAsObjectDefinition<any, any> => ({
  name: name,
  fields: {
    base64: createBase64ConfigWithResolver<FixedObject>(cache),
    src: { type: 'String!' },
    srcSet: { type: 'String!' },
    srcWebp: { type: 'String!' },
    srcSetWebp: { type: 'String!' },
    sizes: { type: 'String!' },
    width: { type: 'Int!' },
    height: { type: 'Int!' },
  },
});

export const unTransformParams = <T>(
  params: Record<string, T>,
): Record<string, T> => {
  // look for uppercase chars, replace with lowercase + `-`
  return Object.entries(params).reduce((p, [k, v]) => {
    const transformedKey = k.replace(/[A-Z]/, (c) => `-${c.toLowerCase()}`);
    return { ...p, [transformedKey]: v };
  }, {});
};

export type IGatsbySourceImgixUrlField = string;
export const gatsbySourceImgixUrlFieldType = 'String';

export const ImgixPlaceholderType = (
  name: string,
): EnumTypeComposerAsObjectDefinition => ({
  name,
  values: {
    DOMINANT_COLOR: { value: `dominantColor` },
    BLURRED: { value: `blurred` },
    NONE: { value: `none` },
  },
});
