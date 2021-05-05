import { graphql } from "gatsby"
import Img, { FixedObject, FluidObject } from "gatsby-image"
import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image"
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
      <GatsbyImage
        image={data.allPost.nodes[0].imgixImage.gatsbyImageData}
        alt="gatsby-plugin-image image"
      />
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
        gatsbyImageData: IGatsbyImageData
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
          url(imgixParams: { w: 10, h: 10 })
          fluid {
            aspectRatio
            src
            srcWebp
            srcSet
            srcSetWebp
            sizes
            base64
          }
          fixed(width: 100) {
            base64
            width
            height
            src
            srcSet
            srcWebp
            srcSetWebp
          }
          gatsbyImageData(width: 100)
        }
      }
    }
  }
`

export default GatsbySourceUrl
