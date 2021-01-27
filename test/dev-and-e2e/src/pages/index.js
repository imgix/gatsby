import { buildFixedImageData, buildFluidImageData } from "@imgix/gatsby"
import { Link } from "gatsby"
import Img from "gatsby-image"
import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => {
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
    </Layout>
  )
}

export default IndexPage
