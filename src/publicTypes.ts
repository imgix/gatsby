import imgixUrlParameters from 'imgix-url-params/dist/parameters.json';
import { mapObjIndexed } from 'ramda';
import * as t from './common/ioTs';

export enum ImgixSourceType {
  AmazonS3 = 's3',
  GoogleCloudStorage = 'gcs',
  MicrosoftAzure = 'azure',
  WebFolder = 'webFolder',
  WebProxy = 'webProxy',
}

type IImgixParamsKey =
  | keyof ImgixUrlParametersSpec['parameters']
  | keyof ImgixUrlParametersSpec['aliases'];

const ImgixParamValueIOTS = t.union(
  [
    t.string,
    t.number,
    t.boolean,
    t.undefined,
    t.null,
    t.array(t.string),
    t.array(t.number),
    t.array(t.boolean),
  ],
  'ImgixParamValue',
);

const mapToImgixParamValue = <TKey extends string>(
  obj: Record<TKey, unknown>,
): Record<TKey, typeof ImgixParamValueIOTS> =>
  mapObjIndexed(() => ImgixParamValueIOTS, obj);

const ImgixParamsIOTS = t.partial(
  {
    ...mapToImgixParamValue(imgixUrlParameters.aliases),
    ...mapToImgixParamValue(imgixUrlParameters.parameters),
  },
  'ImgixParams',
);
export type IImgixParams = t.TypeOf<typeof ImgixParamsIOTS>;

export interface IBaseFieldOptions {
  nodeType: string;
  fieldName: string;
}

const ImgixGatsbyFieldBaseIOTS = t.typeOptional({
  nodeType: t.string,
  fieldName: t.string,
  URLPrefix: t.optional(t.string),
});
export const ImgixGatsbyFieldMultipleUrlsIOTS = t.intersection([
  ImgixGatsbyFieldBaseIOTS,
  t.type({
    getURLs: t.array(t.string),
  }),
]);
export const ImgixGatsbyFieldSingleUrlIOTS = t.intersection([
  ImgixGatsbyFieldBaseIOTS,
  t.type({
    getURL: t.string,
  }),
]);
export const ImgixGatsbyFieldsIOTS = t.array(
  t.union([ImgixGatsbyFieldSingleUrlIOTS, ImgixGatsbyFieldMultipleUrlsIOTS]),
);
export type IFieldsOption = t.TypeOf<typeof ImgixGatsbyFieldsIOTS>;

export const ImgixGatsbyOptionsIOTS = t.typeOptional(
  {
    domain: t.string,
    defaultImgixParams: t.optional(ImgixParamsIOTS),
    disableIxlibParam: t.optional(t.boolean),
    secureURLToken: t.optional(t.string),
    sourceType: t.optional(
      t.fromEnum('GatsbySourceUrlSourceType', ImgixSourceType),
    ),
    fields: t.optional(ImgixGatsbyFieldsIOTS),
  },
  'GatsbySourceUrlOptions',
);
export type IImgixGatsbyOptions = t.TypeOf<typeof ImgixGatsbyOptionsIOTS>;

export type IImgixGatsbyRootArgs = {
  url: string;
};

type ImgixUrlParametersSpec = typeof imgixUrlParameters;

// Can be improved
export type ImgixUrlParams = Partial<
  Record<IImgixParamsKey, string | number | boolean | undefined>
> & {
  ar?: string;
};

export interface ImgixUrlArgs {
  imgixParams?: ImgixUrlParams;
}

export interface ImgixFluidArgs {
  maxWidth?: number;
  maxHeight?: number;
  srcSetBreakpoints?: number[];
  imgixParams?: ImgixUrlParams;
  placeholderImgixParams?: ImgixUrlParams;
}

export interface ImgixFixedArgs {
  width?: number;
  height?: number;
  quality?: number;
  imgixParams?: ImgixUrlParams;
  placeholderImgixParams?: ImgixUrlParams;
}
