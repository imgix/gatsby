import imgixUrlParameters from 'imgix-url-params/dist/parameters.json';

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

type ImgixParamValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | undefined
  | null;

export type IImgixParams = Partial<Record<IImgixParamsKey, ImgixParamValue>>;

export interface IBaseFieldOptions {
  nodeType: string;
  fieldName: string;
  URLPrefix?: string;
}

export type IFieldsOption = (IBaseFieldOptions &
  ({ rawURLKeys: string[] } | { rawURLKey: string }))[];

export type IImgixGatsbyOptions = {
  domain: string;
  defaultImgixParams?: IImgixParams;
  disableIxlibParam?: boolean;
  secureURLToken?: string;
  sourceType?: ImgixSourceType;
  fields?: IFieldsOption;
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
