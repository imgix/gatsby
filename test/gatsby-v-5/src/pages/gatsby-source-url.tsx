import { graphql } from "gatsby"
import Img, { FixedObject, FluidObject } from "gatsby-image"
import React from "react"

const GatsbySourceUrl = ({ data }: { data: IPageData }) => {
  return (
    <div>
      <img src={data.testImage.url} alt="URL Image" />
      <div style={{ width: 100 }}>
      </div>
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
      url(imgixParams: { w: 500, h: 500 })
    }
  }
`

export default GatsbySourceUrl
