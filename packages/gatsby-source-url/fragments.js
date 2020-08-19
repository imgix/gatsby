import { graphql } from 'gatsby';

// TODO: add base64 when available
export const GatsbySourceImgixFluid = graphql`
  fragment GatsbySourceImgixFluid on SourceImgixFluid {
    aspectRatio
    src
    srcWebp
    srcSet
    srcSetWebp
    sizes
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
