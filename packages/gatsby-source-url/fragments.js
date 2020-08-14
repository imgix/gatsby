import { graphql } from 'gatsby';

export const GatsbySourceImgixFluid = graphql`
  fragment GatsbySourceImgixFluid on SourceImgixFluid {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`;
