import { graphql } from "gatsby"
import Img, { FluidObject } from "gatsby-image"
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
    </div>
  )
}

type IPageData = {
  testImage: {
    url: string
    fluid: FluidObject
  }
}
export const query = graphql`
  {
    testImage: imgixImage(url: "/blog/unsplash-kiss.jpg") {
      url(imgixParams: { w: 10, h: 10 })
      fluid {
        ...GatsbySourceImgixFluid
      }
    }
  }
`

export default GatsbySourceUrl
