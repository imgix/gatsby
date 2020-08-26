import imgixUrlParameters from 'imgix-url-params/dist/parameters.json';
import * as t from 'io-ts';
export const GatsbySourceUrlOptions = t.type({
  domain: t.string,
});
export type IGatsbySourceUrlOptions = t.TypeOf<typeof GatsbySourceUrlOptions>;

export type IImgixFixedImageData = {};

export type IGatsbySourceUrlRootArgs = {
  url: string;
};

export type ImgixUrlParametersSpec = typeof imgixUrlParameters;

// Can be improved
export type ImgixUrlParams = Partial<
  Record<
    | keyof ImgixUrlParametersSpec['parameters']
    | keyof ImgixUrlParametersSpec['aliases'],
    string | number | boolean | undefined
  >
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
