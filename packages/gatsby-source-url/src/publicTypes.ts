import imgixUrlParameters from 'imgix-url-params/dist/parameters.json';
import R from 'ramda';
import * as t from './common/ioTs';

type IImgixParamsKey =
  | keyof ImgixUrlParametersSpec['parameters']
  | keyof ImgixUrlParametersSpec['aliases'];

const ImgixParamValueIOTS = t.union([
  t.string,
  t.number,
  t.boolean,
  t.undefined,
  t.null,
  t.array(t.string),
  t.array(t.number),
  t.array(t.boolean),
]);

const mapToImgixParamValue = <TKey extends string>(
  obj: Record<TKey, unknown>,
): Record<TKey, typeof ImgixParamValueIOTS> =>
  R.mapObjIndexed(() => ImgixParamValueIOTS, obj);

const ImgixParamsIOTS = t.partial({
  ...mapToImgixParamValue(imgixUrlParameters.aliases),
  ...mapToImgixParamValue(imgixUrlParameters.parameters),
});
export type IImgixParams = t.TypeOf<typeof ImgixParamsIOTS>;

export const GatsbySourceUrlOptions = t.typeOptional({
  domain: t.string,
  defaultImgixParams: t.optional(ImgixParamsIOTS),
  disableIxlibParam: t.optional(t.boolean),
});
export type IGatsbySourceUrlOptions = t.TypeOf<typeof GatsbySourceUrlOptions>;

export type IGatsbySourceUrlRootArgs = {
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

// Internal use only
// TODO: refactor to private types (along with fixed args below)
export interface ImgixFluidArgsResolved {
  maxWidth: number;
  maxHeight?: number;
  srcSetBreakpoints?: number[];
  imgixParams: ImgixUrlParams;
  placeholderImgixParams: ImgixUrlParams;
}

export interface ImgixFixedArgs {
  width?: number;
  height?: number;
  quality?: number;
  imgixParams?: ImgixUrlParams;
  placeholderImgixParams?: ImgixUrlParams;
}

// Internal use only
export interface ImgixFixedArgsResolved {
  width: number;
  height?: number;
  quality?: number;
  imgixParams: ImgixUrlParams;
  placeholderImgixParams: ImgixUrlParams;
}
