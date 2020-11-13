import { graphql } from 'gatsby';

export const GatsbySourceImgixFluid = graphql`
  fragment GatsbySourceImgixFluid on SourceImgixFluid {
    aspectRatio
    src
    srcWebp
    srcSet
    srcSetWebp
    sizes
    base64
  }
`;

export const GatsbySourceImgixFluid_noBase64 = graphql`
  fragment GatsbySourceImgixFluid_noBase64 on SourceImgixFluid {
    aspectRatio
    src
    srcWebp
    srcSet
    srcSetWebp
    sizes
  }
`;

export const GatsbySourceImgixFixed = graphql`
  fragment GatsbySourceImgixFixed on SourceImgixFixed {
    base64
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`;

export const GatsbySourceImgixFixed_noBase64 = graphql`
  fragment GatsbySourceImgixFixed_noBase64 on SourceImgixFixed {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`;
