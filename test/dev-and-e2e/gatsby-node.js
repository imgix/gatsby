const { GraphQLInt, GraphQLString } = require("gatsby/graphql")
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

const TEST_NODE_TYPE = "Post"

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
  schema,
}) => {
  const { createNode, createTypes } = actions
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

  createNode(node)
}
