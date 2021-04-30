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
  'imgixClient' | 'resolveUrl' | 'resolveWidth' | 'resolveHeight'
> & {
  imgixClientOptions?: Parameters<typeof createImgixURLBuilder>[0];
  resolveUrl: (source: any) => string | null;
  resolveWidth?: (source: any) => number | undefined;
  resolveHeight?: (source: any) => number | undefined;
}) =>
  buildImgixGatsbyTypes({
    ...params,
    imgixClient: createImgixURLBuilder(imgixClientOptions),
  });
