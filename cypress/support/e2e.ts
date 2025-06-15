// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Set global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  console.log('Uncaught exception:', err.message);
  return false;
});

// Add custom commands for common operations
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as a user
       * @example cy.loginUser('user@example.com', 'password123')
       */
      loginUser(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to register a new user
       * @example cy.registerUser('user@example.com', 'password123', 'John', 'Doe')
       */
      registerUser(email: string, password: string, firstName: string, lastName: string): Chainable<void>;
      
      /**
       * Custom command to create a business
       * @example cy.createBusiness({title: 'Test Business', description: 'Test description'})
       */
      createBusiness(businessData: any): Chainable<void>;
      
      /**
       * Custom command to wait for page to be ready
       * @example cy.waitForPageReady()
       */
      waitForPageReady(): Chainable<void>;
    }
  }
}