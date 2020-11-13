import { FluidObject } from 'gatsby-image';
type ImgixFluidObject = Omit<FluidObject, 'base64'> &
  Required<Pick<FluidObject, 'base64'>>;
