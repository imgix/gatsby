import imgixUrlParameters from 'imgix-url-params/dist/parameters.json';
import Joi from 'joi';
import { mapObjIndexed } from 'ramda';

export enum ImgixSourceType {
  AmazonS3 = 's3',
  GoogleCloudStorage = 'gcs',
  MicrosoftAzure = 'azure',
  WebFolder = 'webFolder',
  WebProxy = 'webProxy',
}

const ImgixSourceTypeJOI = Joi.string().valid(
  's3',
  'gcs',
  'azure',
  'webFolder',
  'webProxy',
);

type IImgixParamsKey =
  | keyof ImgixUrlParametersSpec['parameters']
  | keyof ImgixUrlParametersSpec['aliases'];

const ImgixParamValueJOI = Joi.alternatives()
  .try(
    Joi.string(),
    Joi.number(),
    Joi.boolean(),
    Joi.array().items(Joi.string()),
    Joi.array().items(Joi.number()),
    Joi.array().items(Joi.boolean()),
  )
  .optional()
  .allow(null);
type ImgixParamValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | undefined
  | null;

const mapToImgixParamJOIValue = <TKey extends string>(
  obj: Record<TKey, unknown>,
): Record<TKey, typeof ImgixParamValueJOI> =>
  mapObjIndexed(() => ImgixParamValueJOI, obj);

const ImgixParamsJOI = Joi.object().keys({
  ...mapToImgixParamJOIValue(imgixUrlParameters.aliases),
  ...mapToImgixParamJOIValue(imgixUrlParameters.parameters),
});

export type IImgixParams = Record<IImgixParamsKey, ImgixParamValue>;

export interface IBaseFieldOptions {
  nodeType: string;
  fieldName: string;
  URLPrefix?: string;
}

export const ImgixGatsbyFieldsJOI = Joi.object()
  .keys({
    nodeType: Joi.string().required(),
    fieldName: Joi.string().required(),
    URLPrefix: Joi.string().optional(),
    rawURLKeys: Joi.array().items(Joi.string()).required(),
    rawURLKey: Joi.string().required(),
  })
  .xor('rawURLKeys', 'rawURLKey');

export type IFieldsOption = IBaseFieldOptions &
  ({ rawURLKeys: string[] } | { rawURLKey: string });

export const ImgixGatsbyOptionsJOI = Joi.object<IImgixGatsbyOptions>().keys({
  domain: Joi.string().required(),
  defaultImgixParams: ImgixParamsJOI.optional(),
  disableIxlibParam: Joi.boolean().optional(),
  secureURLToken: Joi.string().optional(),
  sourceType: ImgixSourceTypeJOI.optional(),
  fields: ImgixGatsbyFieldsJOI.optional,
});
export type IImgixGatsbyOptions = {
  domain: string;
  defaultImgixParams?: IImgixParams;
  disableIxlibParam?: boolean;
  secureURLToken?: string;
  sourceType?: ImgixSourceType;
  fields?: IFieldsOption[];
};

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
