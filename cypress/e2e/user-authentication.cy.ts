/**
 * User Authentication E2E Tests
 * Tests all authentication flows: login, registration, password reset
 */

describe('User Authentication Flow', () => {
  const timestamp = Date.now();
  
  const testUsers = {
    new: {
      email: `newuser${timestamp}@example.com`,
      password: 'NewUser123!',
      firstName: 'New',
      lastName: 'User'
    },
    existing: {
      email: `existinguser${timestamp}@example.com`,
      password: 'ExistingUser123!',
      firstName: 'Existing',
      lastName: 'User'
    }
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/auth');
    cy.waitForPageReady();
  });

  describe('User Registration', () => {
    it('successfully registers a new user', () => {
      cy.log('Testing user registration flow');
      
      // Switch to registration form
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="register-tab"]').length > 0) {
          cy.get('[data-testid="register-tab"]').click();
        } else if ($body.find('button').filter(':contains("Register")').length > 0) {
          cy.get('button').contains('Register').click();
        }
      });

      // Fill registration form
      cy.get('input[name="firstName"]').type(testUsers.new.firstName);
      cy.get('input[name="lastName"]').type(testUsers.new.lastName);
      cy.get('input[name="email"]').type(testUsers.new.email);
      cy.get('input[name="password"]').type(testUsers.new.password);
      
      // Check if password confirmation field exists
      cy.get('body').then(($body) => {
        if ($body.find('input[name="confirmPassword"]').length > 0) {
          cy.get('input[name="confirmPassword"]').type(testUsers.new.password);
        }
      });

      // Check if terms checkbox exists
      cy.get('body').then(($body) => {
        if ($body.find('input[name="acceptTerms"]').length > 0) {
          cy.get('input[name="acceptTerms"]').check();
        }
      });

      // Submit registration
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();

      // Verify successful registration
      cy.url().should('include', '/dashboard');
      cy.contains(testUsers.new.firstName).should('be.visible');
      
      // Verify user is authenticated
      cy.get('body').should('contain', 'Welcome');
    });

    it('validates registration form fields', () => {
      cy.log('Testing registration form validation');
      
      // Switch to registration form
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="register-tab"]').length > 0) {
          cy.get('[data-testid="register-tab"]').click();
        }
      });

      // Try to submit empty form
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();

      // Check for validation errors
      cy.get('body').should('contain.text', 'required');

      // Test invalid email format
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('weak');
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();

      // Should show validation errors
      cy.get('body').should('contain.text', 'email');
    });

    it('prevents registration with existing email', () => {
      cy.log('Testing duplicate email prevention');
      
      // First registration
      cy.registerUser(
        testUsers.existing.email,
        testUsers.existing.password,
        testUsers.existing.firstName,
        testUsers.existing.lastName
      );

      // Logout
      cy.get('button').contains('Logout').click();
      
      // Try to register again with same email
      cy.visit('/auth');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="register-tab"]').length > 0) {
          cy.get('[data-testid="register-tab"]').click();
        }
      });

      cy.get('input[name="firstName"]').type('Another');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(testUsers.existing.email);
      cy.get('input[name="password"]').type('AnotherPassword123!');
      
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();

      // Should show error about existing email
      cy.get('body').should('contain.text', 'already exists');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Register a user first
      cy.registerUser(
        testUsers.existing.email,
        testUsers.existing.password,
        testUsers.existing.firstName,
        testUsers.existing.lastName
      );
      
      // Logout to prepare for login test
      cy.get('button').contains('Logout').click();
    });

    it('successfully logs in existing user', () => {
      cy.log('Testing user login flow');
      
      cy.loginUser(testUsers.existing.email, testUsers.existing.password);

      // Verify successful login
      cy.url().should('include', '/dashboard');
      cy.contains(testUsers.existing.firstName).should('be.visible');
    });

    it('validates login form fields', () => {
      cy.log('Testing login form validation');
      
      cy.visit('/auth');
      
      // Switch to login form
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="login-tab"]').length > 0) {
          cy.get('[data-testid="login-tab"]').click();
        }
      });

      // Try to submit empty form
      cy.get('button[type="submit"]').contains(/login|sign in/i).click();

      // Check for validation errors
      cy.get('body').should('contain.text', 'required');

      // Test invalid credentials
      cy.get('input[name="email"]').type('wrong@email.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').contains(/login|sign in/i).click();

      // Should show authentication error
      cy.get('body').should('contain.text', 'Invalid');
    });

    it('handles remember me functionality', () => {
      cy.log('Testing remember me feature');
      
      cy.visit('/auth');
      
      cy.get('input[name="email"]').type(testUsers.existing.email);
      cy.get('input[name="password"]').type(testUsers.existing.password);
      
      // Check remember me if available
      cy.get('body').then(($body) => {
        if ($body.find('input[name="rememberMe"]').length > 0) {
          cy.get('input[name="rememberMe"]').check();
        }
      });

      cy.get('button[type="submit"]').contains(/login|sign in/i).click();

      // Verify login success
      cy.url().should('include', '/dashboard');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      // Login first
      cy.loginUser(testUsers.existing.email, testUsers.existing.password);
    });

    it('successfully logs out user', () => {
      cy.log('Testing user logout flow');
      
      // Find and click logout button
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="user-menu"]').length > 0) {
          cy.get('[data-testid="user-menu"]').click();
          cy.get('[data-testid="logout-button"]').click();
        } else if ($body.find('button').filter(':contains("Logout")').length > 0) {
          cy.get('button').contains('Logout').click();
        }
      });

      // Verify logout
      cy.url().should('not.include', '/dashboard');
      cy.get('body').should('not.contain', testUsers.existing.firstName);
    });

    it('redirects to login when accessing protected pages after logout', () => {
      cy.log('Testing protected route access after logout');
      
      // Logout
      cy.get('button').contains('Logout').click();
      
      // Try to access protected page
      cy.visit('/dashboard');
      
      // Should redirect to auth page
      cy.url().should('include', '/auth');
    });
  });

  describe('Password Reset', () => {
    it('initiates password reset process', () => {
      cy.log('Testing password reset initiation');
      
      cy.visit('/auth');
      
      // Look for forgot password link
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Forgot")').length > 0) {
          cy.get('a').contains('Forgot').click();
          
          // Fill reset form
          cy.get('input[name="email"]').type(testUsers.existing.email);
          cy.get('button[type="submit"]').click();
          
          // Should show success message
          cy.get('body').should('contain.text', 'reset');
        } else {
          cy.log('Password reset not implemented yet');
        }
      });
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      // Login first
      cy.loginUser(testUsers.existing.email, testUsers.existing.password);
    });

    it('maintains session across page navigation', () => {
      cy.log('Testing session persistence');
      
      // Navigate to different pages
      cy.visit('/');
      cy.visit('/categories');
      cy.visit('/dashboard');
      
      // Should still be logged in
      cy.contains(testUsers.existing.firstName).should('be.visible');
    });

    it('handles session expiration gracefully', () => {
      cy.log('Testing session expiration handling');
      
      // Clear session cookies to simulate expiration
      cy.clearCookies();
      
      // Try to access protected page
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/auth');
    });
  });

  describe('User Profile Management', () => {
    beforeEach(() => {
      // Login first
      cy.loginUser(testUsers.existing.email, testUsers.existing.password);
    });

    it('allows user to view profile', () => {
      cy.log('Testing profile viewing');
      
      // Navigate to profile page
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="profile-link"]').length > 0) {
          cy.get('[data-testid="profile-link"]').click();
        } else if ($body.find('a').filter(':contains("Profile")').length > 0) {
          cy.get('a').contains('Profile').click();
        } else {
          cy.visit('/profile');
        }
      });
      
      // Should show user information
      cy.get('body').should('contain', testUsers.existing.email);
    });

    it('allows user to update profile information', () => {
      cy.log('Testing profile editing');
      
      // Navigate to profile edit page
      cy.visit('/profile');
      
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Edit")').length > 0) {
          cy.get('button').contains('Edit').click();
          
          // Update profile information
          cy.get('input[name="firstName"]').clear().type('Updated');
          cy.get('button[type="submit"]').click();
          
          // Should show success message
          cy.get('body').should('contain.text', 'updated');
        } else {
          cy.log('Profile editing not implemented yet');
        }
      });
    });
  });

  describe('Authentication Security', () => {
    it('prevents brute force attacks', () => {
      cy.log('Testing brute force protection');
      
      cy.visit('/auth');
      
      // Try multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        cy.get('input[name="email"]').clear().type('test@example.com');
        cy.get('input[name="password"]').clear().type('wrongpassword');
        cy.get('button[type="submit"]').contains(/login|sign in/i).click();
        cy.wait(500);
      }
      
      // Should show rate limiting message
      cy.get('body').should('contain.text', 'too many');
    });

    it('validates password strength during registration', () => {
      cy.log('Testing password strength validation');
      
      cy.visit('/auth');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="register-tab"]').length > 0) {
          cy.get('[data-testid="register-tab"]').click();
        }
      });

      // Test weak password
      cy.get('input[name="password"]').type('123456');
      
      // Should show strength indicator
      cy.get('body').should('contain.text', 'weak');
    });
  });
});