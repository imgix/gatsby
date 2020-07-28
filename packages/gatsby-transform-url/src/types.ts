export type IGatsbyImageFixedData = {
  // Supports blur-up effect
  base64?: string;
  // Supports traced svg effect
  tracedSvg?: string;
  /**
   * Float
   */
  width: number;
  height: number;
  src: string;
  srcSet: string;
  srcWebp?: string;
  srcSetWebp?: string;
};

export type IGatsbyImageFluidData = {
  // Supports blur-up effect
  base64?: string;
  /**
   * Float
   */
  aspectRatio?: number;
  src: string;
  srcSet: string;
  sizes: string;
};

export type IImgixParams = { [k: string]: any };
