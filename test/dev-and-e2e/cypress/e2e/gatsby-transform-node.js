describe("gatsby-transform-node", () => {
  beforeEach(() => {
    cy.visit("/e2e/gatsby-transform-node")
  })

  it("url image loads", () => {
    cy.findByAltText("URL Image")
      .should("be.visible")
      .and($img => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
  })
  it("fluid image loads", () => {
    cy.findByAltText("Fluid Image")
      .should("be.visible")
      .and($img => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
  })
  it("fixed image loads", () => {
    cy.findByAltText("Fixed Image")
      .should("be.visible")
      .and($img => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
  })
})
