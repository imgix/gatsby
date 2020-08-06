/// <reference types="Cypress" />
describe("gatsby-source-url", () => {
  beforeEach(() => {
    cy.visit("/e2e/gatsby-source-url")
  })

  it("url image loads", () => {
    cy.findByAltText("URL Image")
      .should("be.visible")
      .and($img => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
  })
})