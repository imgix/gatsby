import { graphql } from "gatsby"
import Img, { FixedObject, FluidObject } from "gatsby-image"
import React from "react"

const GatsbySourceUrl = ({ data }: { data: IPageData }) => {
  return (
    <div>
      <img src={data.testImage.url} alt="URL Image" />
      <div style={{ width: 100 }}>
        <Img
          fluid={{ ...data.testImage.fluid, sizes: "100px" }}
          alt="Fluid Image"
        />
      </div>
      <Img fixed={data.testImage.fixed} alt="Fixed Image" />
    </div>
  )
}

type IPageData = {
  testImage: {
    url: string
    fluid: FluidObject
    fixed: FixedObject
  }
}
export const query = graphql`
  {
    testImage: imgixImage(
      url: "https://assets.imgix.net/blog/unsplash-kiss.jpg"
    ) {
      url(imgixParams: { w: 10, h: 10 })
      fluid {
        ...GatsbyImgixFluid
      }
      fixed(width: 100) {
        ...GatsbyImgixFixed
      }
    }
  }
`

export default GatsbySourceUrl
