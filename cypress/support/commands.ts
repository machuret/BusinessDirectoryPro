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

Cypress.Commands.add('interceptBusinessAPI', () => {
  // Intercept business-related API calls
  cy.intercept('GET', '/api/businesses*').as('getBusinesses');
  cy.intercept('POST', '/api/businesses').as('createBusiness');
  cy.intercept('PUT', '/api/businesses/*').as('updateBusiness');
  cy.intercept('DELETE', '/api/businesses/*').as('deleteBusiness');
});

Cypress.Commands.add('interceptAuthAPI', () => {
  // Intercept authentication API calls
  cy.intercept('POST', '/api/auth/login').as('loginUser');
  cy.intercept('POST', '/api/auth/register').as('registerUser');
  cy.intercept('POST', '/api/auth/logout').as('logoutUser');
  cy.intercept('GET', '/api/auth/user').as('getCurrentUser');
});

Cypress.Commands.add('interceptAdminAPI', () => {
  // Intercept admin API calls
  cy.intercept('GET', '/api/admin/businesses').as('getAdminBusinesses');
  cy.intercept('GET', '/api/admin/users').as('getAdminUsers');
  cy.intercept('GET', '/api/admin/reviews').as('getAdminReviews');
  cy.intercept('GET', '/api/admin/featured-requests').as('getFeaturedRequests');
});

Cypress.Commands.add('fillBusinessForm', (businessData: any) => {
  // Helper to fill business form with data
  cy.get('input[name="name"]').type(businessData.name);
  cy.get('textarea[name="description"]').type(businessData.description);
  cy.get('input[name="address"]').type(businessData.address);
  cy.get('input[name="phone"]').type(businessData.phone);
  cy.get('input[name="email"]').type(businessData.email);
  
  if (businessData.website) {
    cy.get('input[name="website"]').type(businessData.website);
  }
  
  if (businessData.category) {
    cy.get('select[name="category"]').select(businessData.category);
  }
});

Cypress.Commands.add('fillContactForm', (contactData: any) => {
  // Helper to fill contact form with data
  cy.get('input[name="name"]').type(contactData.name);
  cy.get('input[name="email"]').type(contactData.email);
  
  if (contactData.phone) {
    cy.get('input[name="phone"]').type(contactData.phone);
  }
  
  cy.get('textarea[name="message"]').type(contactData.message);
});

Cypress.Commands.add('submitFormAndWait', (apiAlias: string) => {
  // Submit form and wait for API response
  cy.get('button[type="submit"]').click();
  cy.wait(`@${apiAlias}`);
});

Cypress.Commands.add('checkFormValidation', (expectedErrors: string[]) => {
  // Check that form validation errors are displayed
  expectedErrors.forEach(error => {
    cy.get('body').should('contain.text', error);
  });
});

Cypress.Commands.add('checkResponsiveDesign', (viewport: { width: number, height: number }) => {
  // Check responsive design at given viewport
  cy.viewport(viewport.width, viewport.height);
  cy.get('body').should('be.visible');
  cy.get('nav').should('be.visible');
});

Cypress.Commands.add('checkAccessibility', () => {
  // Basic accessibility checks
  cy.get('h1').should('exist');
  cy.get('nav').should('have.attr', 'role');
  cy.get('main').should('exist');
  
  // Check that interactive elements are keyboard accessible
  cy.get('button').each(($btn) => {
    cy.wrap($btn).should('have.attr', 'aria-label');
  });
});

Cypress.Commands.add('checkLoadingStates', () => {
  // Check for loading states
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="loading"]').length > 0) {
      cy.get('[data-testid="loading"]').should('be.visible');
    }
  });
});

Cypress.Commands.add('checkErrorHandling', (errorMessage: string) => {
  // Check that error is displayed correctly
  cy.get('body').should('contain.text', errorMessage);
  
  // Check that error has proper ARIA attributes
  cy.get('[role="alert"]').should('exist');
});

Cypress.Commands.add('simulateNetworkError', (apiPath: string) => {
  // Simulate network error for testing
  cy.intercept('GET', apiPath, { forceNetworkError: true }).as('networkError');
});

Cypress.Commands.add('simulateSlowNetwork', (apiPath: string, delay: number = 2000) => {
  // Simulate slow network for testing
  cy.intercept('GET', apiPath, { delay }).as('slowNetwork');
});

Cypress.Commands.add('checkSEOElements', () => {
  // Check basic SEO elements
  cy.get('title').should('exist');
  cy.get('meta[name="description"]').should('exist');
  cy.get('h1').should('exist');
});

Cypress.Commands.add('checkSecurityHeaders', () => {
  // Check for security headers (basic test)
  cy.request('/').then((response) => {
    expect(response.headers).to.have.property('x-content-type-options');
    expect(response.headers).to.have.property('x-frame-options');
  });
});

// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      loginUser(email: string, password: string): Chainable<void>;
      registerUser(email: string, password: string, firstName: string, lastName: string): Chainable<void>;
      createBusiness(businessData: any): Chainable<void>;
      waitForPageReady(): Chainable<void>;
      interceptBusinessAPI(): Chainable<void>;
      interceptAuthAPI(): Chainable<void>;
      interceptAdminAPI(): Chainable<void>;
      fillBusinessForm(businessData: any): Chainable<void>;
      fillContactForm(contactData: any): Chainable<void>;
      submitFormAndWait(apiAlias: string): Chainable<void>;
      checkFormValidation(expectedErrors: string[]): Chainable<void>;
      checkResponsiveDesign(viewport: { width: number, height: number }): Chainable<void>;
      checkAccessibility(): Chainable<void>;
      checkLoadingStates(): Chainable<void>;
      checkErrorHandling(errorMessage: string): Chainable<void>;
      simulateNetworkError(apiPath: string): Chainable<void>;
      simulateSlowNetwork(apiPath: string, delay?: number): Chainable<void>;
      checkSEOElements(): Chainable<void>;
      checkSecurityHeaders(): Chainable<void>;
    }
  }
}