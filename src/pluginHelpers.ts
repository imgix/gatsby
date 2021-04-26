import { createImgixURLBuilder } from './common/imgix-js-core-wrapper';
import { buildImgixGatsbyTypes } from './modules/gatsby-source-url/typeBuilder';

export { createImgixFixedSchemaFieldConfig } from './modules/gatsby-source-url/createImgixFixedFieldConfig';
export { createImgixFluidSchemaFieldConfig } from './modules/gatsby-source-url/createImgixFluidFieldConfig';
export { createImgixGatsbyImageSchemaFieldConfig } from './modules/gatsby-source-url/createImgixGatsbyImageDataFieldConfig';
export { createImgixUrlSchemaFieldConfig } from './modules/gatsby-source-url/createImgixUrlFieldConfig';

export const createImgixGatsbyTypes = ({
  imgixClientOptions,
  ...params
}: Omit<
  Parameters<typeof buildImgixGatsbyTypes>[0],
  'imgixClient' | 'resolveUrl'
> & {
  imgixClientOptions?: Parameters<typeof createImgixURLBuilder>[0];
  resolveUrl: (source: any) => string | null;
}) =>
  buildImgixGatsbyTypes({
    ...params,
    imgixClient: createImgixURLBuilder(imgixClientOptions),
  });
