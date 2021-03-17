import {
  buildFixedImageData,
  buildFluidImageData,
  getGatsbyImageData,
} from "@imgix/gatsby"
import Img from "gatsby-image"
import { GatsbyImage } from "gatsby-plugin-image"
import React from "react"

const GatsbyTransformUrl = () => {
  return (
    <div>
      <Img
        fixed={buildFixedImageData(
          "https://assets.imgix.net/blog/unsplash-kiss.jpg",
          { w: 10, h: 10 }
        )}
        alt="Fixed Image"
      />
      <div style={{ width: 10 }}>
        <Img
          fluid={buildFluidImageData(
            "https://assets.imgix.net/blog/unsplash-kiss.jpg",
            { ar: 2 },
            { sizes: "10px" }
          )}
          alt="Fluid Image"
        />
      </div>
      <GatsbyImage
        image={getGatsbyImageData({
          url: "https://assets.imgix.net/examples/pione.jpg",
          width: 10,
          height: 10,
          layout: "fixed",
        })}
        alt="Gatsby-plugin-image Fixed Image"
      />
      <GatsbyImage
        image={getGatsbyImageData({
          url: "https://assets.imgix.net/examples/pione.jpg",
          width: 120,
          aspectRatio: 2,
          layout: "constrained",
        })}
        alt="Gatsby-plugin-image Constrained Image"
      />
    </div>
  )
}

export default GatsbyTransformUrl