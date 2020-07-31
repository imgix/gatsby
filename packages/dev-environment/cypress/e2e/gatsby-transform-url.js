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
        console.log($img[0].naturalWidth)
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
})
