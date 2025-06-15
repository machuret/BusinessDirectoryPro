// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

Cypress.Commands.add('loginUser', (email: string, password: string) => {
  cy.visit('/auth');
  
  // Switch to login form if needed
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="login-tab"]').length > 0) {
      cy.get('[data-testid="login-tab"]').click();
    } else if ($body.find('button').filter(':contains("Login")').length > 0) {
      cy.get('button').contains('Login').click();
    }
  });
  
  cy.get('input[name="email"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('button[type="submit"]').contains('Login').click();
  
  // Wait for successful login
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('registerUser', (email: string, password: string, firstName: string, lastName: string) => {
  cy.visit('/auth');
  
  // Switch to register form if needed
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="register-tab"]').length > 0) {
      cy.get('[data-testid="register-tab"]').click();
    } else if ($body.find('button').filter(':contains("Register")').length > 0) {
      cy.get('button').contains('Register').click();
    }
  });
  
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="firstName"]').type(firstName);
  cy.get('input[name="lastName"]').type(lastName);
  
  cy.get('button[type="submit"]').contains('Register').click();
  
  // Wait for successful registration
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createBusiness', (businessData: any) => {
  // Navigate to create business form
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="nav-create-business"]').length > 0) {
      cy.get('[data-testid="nav-create-business"]').click();
    } else if ($body.find('a').filter(':contains("Create Business")').length > 0) {
      cy.get('a').contains('Create Business').click();
    } else {
      cy.visit('/create-business');
    }
  });
  
  cy.url().should('include', '/create-business');
  
  // Fill business form
  cy.get('input[name="title"]').type(businessData.title);
  cy.get('textarea[name="description"]').type(businessData.description);
  cy.get('input[name="address"]').type(businessData.address);
  cy.get('input[name="phone"]').type(businessData.phone);
  cy.get('input[name="email"]').type(businessData.email);
  cy.get('input[name="website"]').type(businessData.website);
  
  // Select category
  cy.get('select[name="categoryId"]').select('1');
  
  // Submit form
  cy.get('button[type="submit"]').contains('Create').click();
  
  // Wait for success
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('waitForPageReady', () => {
  // Wait for React to hydrate and page to be interactive
  cy.get('body').should('be.visible');
  cy.wait(1000); // Allow for any async operations to complete
});