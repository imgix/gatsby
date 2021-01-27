import { buildFixedImageData, buildFluidImageData } from "@imgix/gatsby"
import Img from "gatsby-image"
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
    </div>
  )
}

export default GatsbyTransformUrl
