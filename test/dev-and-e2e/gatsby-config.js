const { ImgixSourceType } = require("@imgix/gatsby")

module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    // `gatsby-transformer-sharp`,
    // `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-image`,
    {
      resolve: `@imgix/gatsby`,
      options: {
        domain: "sdk-proxy-test.imgix.net",
        secureURLToken: process.env.PROXY_DEMO_TOKEN,
        sourceType: ImgixSourceType.WebProxy,
        fields: [
          {
            nodeType: "Post",
            fieldName: "imgixImage",
            rawURLKey: "imageURL",
          },
        ],
      },
    },
    // TODO: add noproxy tests when  namespace is implemented
    /* {
      resolve: `@imgix/gatsby`,
      options: {
        namespace: "NoProxy",
        domain: "assets.imgix.net",
        secureURLToken: "eeHwbMQjYHJrBJqq",
        sourceType: ImgixSourceType.WebProxy,
      },
    }, */
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
