import { graphql } from "gatsby"
import React from "react"

const GatsbySourceUrl = ({ data }: { data: IPageData }) => {
  console.log("data", data)
  return (
    <div>
      {/* <img src={data.allPost.nodes[0].imgixImage.url} alt="URL Image" /> */}
      {/* <div style={{ width: 100 }}>
        <Img
          fluid={{ ...data.testImage.fluid, sizes: "100px" }}
          alt="Fluid Image"
        />
      </div>
      <Img fixed={data.testImage.fixed} alt="Fixed Image" /> */}
    </div>
  )
}

type IPageData = {
  allPost: {
    nodes: {
      imgixImage: {
        url: string
      }
    }[]
  }
}
export const query = graphql`
  {
    allPost {
      nodes {
        imageURL
      }
    }
  }
`

export default GatsbySourceUrl
