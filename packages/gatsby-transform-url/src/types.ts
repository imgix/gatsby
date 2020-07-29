export type IGatsbyImageFixedData = {
  width: number;
  height: number;
  src: string;
  srcSet: string;
  srcWebp?: string;
  srcSetWebp?: string;
};

export type IGatsbyImageFluidData = {
  aspectRatio: number;
  src: string;
  srcSet: string;
  sizes: string;
  srcWebp?: string;
  srcSetWebp?: string;
};

export type IImgixParams = { [k: string]: any };
