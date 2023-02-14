const { GraphQLInt, GraphQLString } = require("gatsby/graphql")
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ actions }) => {
  const { createPage } = actions
  createPage({
    path: "/using-dsg",
    component: require.resolve("./src/templates/using-dsg.js"),
    context: {},
    defer: true,
  })
}

const TEST_NODE_TYPE = "Post"

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions
  createTypes(
    schema.buildObjectType({
      name: TEST_NODE_TYPE,
      interfaces: ["Node"],
      fields: {
        key: {
          type: GraphQLInt,
        },
        imageURL: {
          type: GraphQLString,
        },
      },
      extensions: {
        infer: true,
      },
    })
  )
}

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions
  // Data can come from anywhere, but for now create it manually
  const testData = {
    key: 123,
    imageURL: "https://assets.imgix.net/amsterdam.jpg",
  }
  const nodeContent = JSON.stringify(testData)
  const node = {
    ...testData,
    id: createNodeId(`${TEST_NODE_TYPE}-${testData.key}`),
    parent: null,
    children: [],
    internal: {
      type: TEST_NODE_TYPE,
      content: nodeContent,
      contentDigest: createContentDigest(testData),
    },
  }

  createNode(node)
}