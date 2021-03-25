import {
  buildFixedImageData,
  buildFluidImageData,
  getGatsbyImageData,
  ImgixGatsbyImage,
} from "@imgix/gatsby"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import { GatsbyImage } from "gatsby-plugin-image"
import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = (props: any) => {
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
      <GatsbyImage
        image={props.data.imgixImage.gatsbyImageData}
        alt="Gatsby-plugin-image GraphQL image"
      ></GatsbyImage>
      <GatsbyImage
        image={getGatsbyImageData({
          src: "https://assets.imgix.net/amsterdam.jpg",
          sourceWidth: 5000,
          sourceHeight: 4000,
          aspectRatio: 2,
          width: 1000,
          height: 500,
          layout: "fixed",
        })}
        alt="Gatsby-plugin-image hook image"
      />
      <ImgixGatsbyImage
        src="https://assets.imgix.net/amsterdam.jpg"
        alt="ImgixGatsbyImage"
        layout="fullWidth"
        aspectRatio={2}
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
