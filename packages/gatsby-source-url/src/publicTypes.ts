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
>;

export interface ImgixUrlArgs {
  imgixParams?: ImgixUrlParams;
}
