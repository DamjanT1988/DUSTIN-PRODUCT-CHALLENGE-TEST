// cypress/e2e/product-crud.cy.ts

describe("Product CRUD flow", () => {
  const newProductId = 9999;
  const newProductName = "Cypress Test Product";
  const updatedProductName = "Cypress Updated Product";

  beforeEach(() => {
    // Start from the main page
    cy.visit("/");
  });

  it("adds, edits, and deletes a product", () => {
    // 1. Add a product
    cy.get('[data-testid="add-product-btn"]').click();

    cy.get('[data-testid="product-id-input"]').clear().type(String(newProductId));
    cy.get('[data-testid="product-name-input"]').clear().type(newProductName);
    cy.get('[data-testid="product-brand-input"]').clear().type("Cypress Brand");
    cy.get('[data-testid="product-price-input"]').clear().type("123");
    cy.get('[data-testid="product-description-input"]')
      .clear()
      .type("Created by Cypress E2E test");
    cy.get('[data-testid="product-stock-input"]').clear().type("10");

    cy.get('[data-testid="save-product-btn"]').click();

    // Wait for success snackbar and product row
    cy.contains("Product added successfully").should("be.visible");
    cy.contains(newProductName).should("be.visible");

    // 2. Edit the product
    cy.contains("tr", newProductName).within(() => {
      cy.get('[data-testid="edit-product-btn"]').click();
    });

    cy.get('[data-testid="product-name-input"]')
      .clear()
      .type(updatedProductName);
    cy.get('[data-testid="save-product-btn"]').click();

    cy.contains("Product updated successfully").should("be.visible");
    cy.contains(updatedProductName).should("be.visible");

    // 3. Delete the product
    cy.contains("tr", updatedProductName).within(() => {
      cy.get('[data-testid="delete-product-btn"]').click();
    });

    cy.contains("Confirm delete").should("be.visible");
    cy.get('[data-testid="confirm-delete-btn"]').click();

    cy.contains("Product deleted").should("be.visible");
    cy.contains(updatedProductName).should("not.exist");
  });
});
