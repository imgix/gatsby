import { IImgixFixedImageData } from "@imgix/gatsby-source-url"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import React from "react"

const GatsbySourceUrl = ({ data }: { data: IPageData }) => {
  return <Img fixed={data.fixedImage.fixed} alt="Fixed Image" />
}

type IPageData = {
  fixedImage: {
    fixed: IImgixFixedImageData
  }
}
export const query = graphql`
  {
    fixedImage: imgixImage(
      url: "https://assets.imgix.net/blog/unsplash-kiss.jpg"
    ) {
      fixed {
        ...GatsbyImgixFixed
      }
    }
  }
`

export default GatsbySourceUrl
