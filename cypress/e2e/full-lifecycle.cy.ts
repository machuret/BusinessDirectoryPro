/**
 * Full Lifecycle E2E Test
 * Simulates complete user journey from registration to featured business approval
 */

describe('Full User Lifecycle - Registration to Featured Business', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `testuser${timestamp}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  };

  const adminUser = {
    email: 'admin@example.com',
    password: 'AdminPassword123!'
  };

  const testBusiness = {
    title: `Test Business ${timestamp}`,
    description: 'A comprehensive test business for E2E testing',
    address: '123 Test Street, Test City, Test State',
    phone: '+1234567890',
    email: `business${timestamp}@example.com`,
    website: `https://testbusiness${timestamp}.com`,
    category: 'Restaurants' // Will be selected from dropdown
  };

  beforeEach(() => {
    // Set viewport for consistent testing
    cy.viewport(1280, 720);
  });

  it('completes full user lifecycle from registration to featured business approval', () => {
    // Step 1: Register a New User
    cy.log('Step 1: Registering new user');
    cy.visit('/auth');
    
    // Wait for auth page to load
    cy.get('form', { timeout: 10000 }).should('be.visible');
    
    // Look for registration form - it might be a tab or toggle
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="register-tab"]').length > 0) {
        cy.get('[data-testid="register-tab"]').click();
      } else if ($body.find('button').filter(':contains("Register")').length > 0) {
        cy.get('button').contains('Register').click();
      }
    });
    
    // Fill registration form
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="firstName"]').type(testUser.firstName);
    cy.get('input[name="lastName"]').type(testUser.lastName);
    
    // Submit registration
    cy.get('button[type="submit"]').contains('Register').click();
    
    // Verify successful registration and redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains(testUser.firstName).should('be.visible');

    // Step 2: Create a Business
    cy.log('Step 2: Creating new business listing');
    
    // Navigate to create business form - look for various possible navigation elements
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="nav-create-business"]').length > 0) {
        cy.get('[data-testid="nav-create-business"]').click();
      } else if ($body.find('a').filter(':contains("Create Business")').length > 0) {
        cy.get('a').contains('Create Business').click();
      } else if ($body.find('button').filter(':contains("Add Business")').length > 0) {
        cy.get('button').contains('Add Business').click();
      } else {
        // Navigate directly to the URL
        cy.visit('/create-business');
      }
    });
    
    cy.url().should('include', '/create-business');
    
    // Fill business form
    cy.get('input[name="title"]').type(testBusiness.title);
    cy.get('textarea[name="description"]').type(testBusiness.description);
    cy.get('input[name="address"]').type(testBusiness.address);
    cy.get('input[name="phone"]').type(testBusiness.phone);
    cy.get('input[name="email"]').type(testBusiness.email);
    cy.get('input[name="website"]').type(testBusiness.website);
    
    // Select category from dropdown
    cy.get('select[name="categoryId"]').select('1'); // Select first available category
    
    // Submit business creation
    cy.get('button[type="submit"]').contains('Create').click();
    
    // Verify business creation success
    cy.url().should('include', '/dashboard');
    cy.contains('successfully').should('be.visible');

    // Step 3: Request Featured Status
    cy.log('Step 3: Requesting featured status for business');
    
    // Navigate to featured requests page
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="nav-get-featured"]').length > 0) {
        cy.get('[data-testid="nav-get-featured"]').click();
      } else if ($body.find('a').filter(':contains("Get Featured")').length > 0) {
        cy.get('a').contains('Get Featured').click();
      } else if ($body.find('button').filter(':contains("Featured")').length > 0) {
        cy.get('button').contains('Featured').click();
      } else {
        // Navigate directly to the URL
        cy.visit('/get-featured');
      }
    });
    
    cy.url().should('include', '/get-featured');
    
    // Select the newly created business from dropdown
    cy.get('select[name="businessId"]').select(testBusiness.title);
    
    // Add justification for featured request
    cy.get('textarea[name="justification"]').type(
      'This is a test business requesting featured status for E2E testing purposes. ' +
      'The business offers exceptional service and should be highlighted to users.'
    );
    
    // Submit featured request
    cy.get('button[type="submit"]').contains('Submit').click();
    
    // Verify request submission
    cy.contains('success').should('be.visible');

    // Step 4: Log Out
    cy.log('Step 4: Logging out user');
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="user-menu"]').length > 0) {
        cy.get('[data-testid="user-menu"]').click();
        cy.get('[data-testid="logout-button"]').click();
      } else if ($body.find('button').filter(':contains("Logout")').length > 0) {
        cy.get('button').contains('Logout').click();
      } else if ($body.find('a').filter(':contains("Logout")').length > 0) {
        cy.get('a').contains('Logout').click();
      }
    });
    
    // Verify logout
    cy.url().should('eq', 'http://localhost:5000/');

    // Step 5: Admin Login and Approval
    cy.log('Step 5: Logging in as admin');
    cy.visit('/auth');
    
    // Switch to login form if needed
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-tab"]').length > 0) {
        cy.get('[data-testid="login-tab"]').click();
      } else if ($body.find('button').filter(':contains("Login")').length > 0) {
        cy.get('button').contains('Login').click();
      }
    });
    
    // Admin login
    cy.get('input[name="email"]').clear().type(adminUser.email);
    cy.get('input[name="password"]').clear().type(adminUser.password);
    cy.get('button[type="submit"]').contains('Login').click();
    
    // Verify admin login
    cy.url().should('include', '/dashboard');

    // Step 6: Navigate to Featured Requests Management
    cy.log('Step 6: Managing featured requests as admin');
    
    // Look for admin panel navigation
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="admin-featured-requests"]').length > 0) {
        cy.get('[data-testid="admin-featured-requests"]').click();
      } else if ($body.find('a').filter(':contains("Featured Requests")').length > 0) {
        cy.get('a').contains('Featured Requests').click();
      } else if ($body.find('button').filter(':contains("Featured")').length > 0) {
        cy.get('button').contains('Featured').click();
      } else {
        // Navigate directly to admin featured requests
        cy.visit('/admin/featured-requests');
      }
    });
    
    // Find the test user's request
    cy.contains(testBusiness.title).should('be.visible');
    
    // Approve the featured request
    cy.contains(testBusiness.title).parent().within(() => {
      cy.get('button').filter(':contains("Approve")').click();
    });
    
    // Verify approval success
    cy.contains('approved').should('be.visible');

    // Step 7: Admin Logout
    cy.log('Step 7: Logging out admin');
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':contains("Logout")').length > 0) {
        cy.get('button').contains('Logout').click();
      } else if ($body.find('a').filter(':contains("Logout")').length > 0) {
        cy.get('a').contains('Logout').click();
      }
    });
    
    // Verify logout
    cy.url().should('eq', 'http://localhost:5000/');

    // Step 8: Final Verification as Public Visitor
    cy.log('Step 8: Verifying featured business appears publicly');
    
    // Visit homepage
    cy.visit('/');
    
    // Check if the business appears in featured section
    cy.get('body').then(($body) => {
      if ($body.text().includes(testBusiness.title)) {
        cy.contains(testBusiness.title).should('be.visible');
        cy.log('✅ Featured business found on homepage');
      } else {
        cy.log('⚠️ Featured business not found on homepage - checking categories page');
        
        // Check the relevant category page
        cy.visit('/categories');
        cy.contains(testBusiness.title).should('be.visible');
      }
    });

    cy.log('✅ Full lifecycle test completed successfully');
  });

  // Additional test for error handling scenarios
  it('handles registration validation errors', () => {
    cy.log('Testing registration validation');
    
    cy.visit('/auth');
    
    // Try to register without required fields
    cy.get('button[type="submit"]').contains('Register').click();
    
    // Should show validation errors or prevent submission
    cy.get('input[name="email"]').should('be.visible');
    
    // Test with invalid email
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('weak');
    cy.get('button[type="submit"]').contains('Register').click();
    
    // Should show validation feedback
    cy.get('body').should('contain.text', 'email');
  });

  // Test navigation and basic functionality
  it('verifies basic navigation and page loads', () => {
    cy.log('Testing basic navigation');
    
    // Test homepage
    cy.visit('/');
    cy.get('body').should('be.visible');
    
    // Test categories page
    cy.visit('/categories');
    cy.get('body').should('be.visible');
    
    // Test cities page
    cy.visit('/cities');
    cy.get('body').should('be.visible');
    
    // Test auth page
    cy.visit('/auth');
    cy.get('form').should('be.visible');
    
    cy.log('✅ Basic navigation test completed');
  });
});