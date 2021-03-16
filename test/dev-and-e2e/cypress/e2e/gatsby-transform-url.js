/// <reference types="Cypress" />
describe("gatsby-transform-url", () => {
  beforeEach(() => {
    cy.visit("/e2e/gatsby-transform-url")
  })

  it("fixed image loads successfully", () => {
    cy.findByAltText("Fixed Image")
      .should("be.visible")
      .and($img => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.eq(10)
      })
  })
  it("fluid image loads successfully", () => {
    cy.findByAltText("Fluid Image")
      .should("be.visible")
      .and($img => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
  })

  describe("gatsby-plugin-image hook", () => {
    it("fixed image loads successfully", () => {
      cy.findByAltText("Gatsby-plugin-image Fixed Image")
        .should("be.visible")
        .and($img => {
          // "naturalWidth" and "naturalHeight" are set when the image loads
          expect($img[0].naturalWidth).to.be.greaterThan(0)
        })
      // Check srcsets are correct width.
      // TODO: move to unit tests
      // .invoke("attr", "srcset")
      // .should("match", /^.* 1x, .* 2x, .* 3x, .* 4x, .* 5x$/i)
    })
    it("constrained image loads successfully", () => {
      cy.findByAltText("Gatsby-plugin-image Constrained Image")
        .should("be.visible")
        .and($img => {
          // "naturalWidth" and "naturalHeight" are set when the image loads
          expect($img[0].naturalWidth).to.be.greaterThan(0)
        })
    })
  })
})
