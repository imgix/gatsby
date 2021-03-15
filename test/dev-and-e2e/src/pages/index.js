import {
  buildFixedImageData,
  buildFluidImageData,
  getGatsbyImageData,
} from "@imgix/gatsby"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import { GatsbyImage } from "gatsby-plugin-image"
import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = props => {
  return (
    <Layout>
      <SEO title="Home" />
      <h1>Hi people</h1>
      <p>Welcome to your new Gatsby site.</p>
      <p>Now go build something great.</p>
      <Img
        fixed={{
          ...buildFixedImageData(
            "https://assets.imgix.net/examples/pione.jpg",
            { w: 300, h: 300 }
          ),
        }}
      />
      <Img
        fluid={buildFluidImageData(
          "https://assets.imgix.net/examples/pione.jpg",
          { ar: 2 },
          { sizes: "50vw" }
        )}
      />
      <Link to="/page-2/">Go to page 2</Link> <br />
      <Link to="/using-typescript/">Go to "Using TypeScript"</Link>
      <GatsbyImage image={props.data.imgixImage.gatsbyImageData}></GatsbyImage>
      <GatsbyImage
        image={getGatsbyImageData({
          url: "https://assets.imgix.net/examples/pione.jpg",
          width: 10,
          height: 10,
          layout: "fixed",
        })}
      />
    </Layout>
  )
}

export const query = graphql`
  query IndexQuery {
    imgixImage(url: "https://assets.imgix.net/amsterdam.jpg") {
      gatsbyImageData(placeholder: DOMINANT_COLOR)
    }
  }
`
export default IndexPage
