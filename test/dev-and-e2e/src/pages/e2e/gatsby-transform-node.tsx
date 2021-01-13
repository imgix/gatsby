import { graphql } from "gatsby"
import Img, { FixedObject, FluidObject } from "gatsby-image"
import React from "react"

const GatsbySourceUrl = ({ data }: { data: IPageData }) => {
  return (
    <div>
      <img src={data.allPost.nodes[0].imgixImage.url} alt="URL Image" />
      <div style={{ width: 100 }}>
        <Img
          fluid={{ ...data.allPost.nodes[0].imgixImage.fluid, sizes: "100px" }}
          alt="Fluid Image"
        />
      </div>
      <Img fixed={data.allPost.nodes[0].imgixImage.fixed} alt="Fixed Image" />
    </div>
  )
}

type IPageData = {
  allPost: {
    nodes: {
      imgixImage: {
        url: string
        fluid: FluidObject
        fixed: FixedObject
      }
    }[]
  }
}
export const query = graphql`
  {
    allPost {
      nodes {
        imageURL
        imgixImage {
          url
          # TODO: use fragments
          fluid {
            aspectRatio
            src
            srcWebp
            srcSet
            srcSetWebp
            sizes
            base64
          }
          fixed {
            base64
            width
            height
            src
            srcSet
            srcWebp
            srcSetWebp
          }
        }
      }
    }
  }
`

export default GatsbySourceUrl
