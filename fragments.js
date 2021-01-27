import { graphql } from 'gatsby';

export const GatsbyImgixFluid = graphql`
  fragment GatsbyImgixFluid on ImgixFluid {
    aspectRatio
    src
    srcWebp
    srcSet
    srcSetWebp
    sizes
    base64
  }
`;

export const GatsbyImgixFluid_noBase64 = graphql`
  fragment GatsbyImgixFluid_noBase64 on ImgixFluid {
    aspectRatio
    src
    srcWebp
    srcSet
    srcSetWebp
    sizes
  }
`;

export const GatsbyImgixFixed = graphql`
  fragment GatsbyImgixFixed on ImgixFixed {
    base64
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`;

export const GatsbyImgixFixed_noBase64 = graphql`
  fragment GatsbyImgixFixed_noBase64 on ImgixFixed {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`;
