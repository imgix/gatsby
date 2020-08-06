import { graphql } from "gatsby"
import React from "react"

const GatsbySourceUrl = ({ data }: { data: IPageData }) => {
  console.log("data", data)
  return (
    <div>
      <img src={data.urlImage.url} alt="URL Image" />
    </div>
  )
}

type IPageData = {
  urlImage: {
    url: string
  }
}
export const query = graphql`
  {
    urlImage: imgixImage(url: "/blog/unsplash-kiss.jpg") {
      url(imgixParams: { w: 10, h: 10 })
    }
  }
`

export default GatsbySourceUrl
