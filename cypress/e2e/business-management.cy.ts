/**
 * Business Management E2E Tests
 * Tests business creation, editing, searching, and management workflows
 */

describe('Business Management Flow', () => {
  const timestamp = Date.now();
  
  const testUser = {
    email: `businessowner${timestamp}@example.com`,
    password: 'BusinessOwner123!',
    firstName: 'Business',
    lastName: 'Owner'
  };

  const testBusiness = {
    name: `Test Business ${timestamp}`,
    description: 'A comprehensive test business for E2E testing with detailed description that meets minimum length requirements',
    address: '123 Test Street, Test City, Test State 12345',
    phone: '+1 (555) 123-4567',
    email: `business${timestamp}@example.com`,
    website: `https://testbusiness${timestamp}.com`,
    category: 'Restaurant',
    hours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' }
    }
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
    
    // Register and login user
    cy.registerUser(
      testUser.email,
      testUser.password,
      testUser.firstName,
      testUser.lastName
    );
  });

  describe('Business Creation', () => {
    it('successfully creates a new business', () => {
      cy.log('Testing business creation flow');
      
      // Navigate to business creation
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="create-business-btn"]').length > 0) {
          cy.get('[data-testid="create-business-btn"]').click();
        } else if ($body.find('a').filter(':contains("Create Business")').length > 0) {
          cy.get('a').contains('Create Business').click();
        } else {
          cy.visit('/create-business');
        }
      });

      cy.url().should('include', '/create-business');
      
      // Fill business form
      cy.get('input[name="name"]').type(testBusiness.name);
      cy.get('textarea[name="description"]').type(testBusiness.description);
      cy.get('input[name="address"]').type(testBusiness.address);
      cy.get('input[name="phone"]').type(testBusiness.phone);
      cy.get('input[name="email"]').type(testBusiness.email);
      cy.get('input[name="website"]').type(testBusiness.website);
      
      // Select category
      cy.get('select[name="category"]').select('1');
      
      // Add business hours if form exists
      cy.get('body').then(($body) => {
        if ($body.find('input[name="mondayOpen"]').length > 0) {
          cy.get('input[name="mondayOpen"]').type('09:00');
          cy.get('input[name="mondayClose"]').type('17:00');
        }
      });

      // Submit business creation
      cy.get('button[type="submit"]').contains(/create|submit/i).click();

      // Verify success
      cy.url().should('include', '/dashboard');
      cy.get('body').should('contain.text', 'success');
      cy.contains(testBusiness.name).should('be.visible');
    });

    it('validates business creation form', () => {
      cy.log('Testing business creation validation');
      
      cy.visit('/create-business');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').contains(/create|submit/i).click();
      
      // Should show validation errors
      cy.get('body').should('contain.text', 'required');
      
      // Test invalid email format
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').contains(/create|submit/i).click();
      
      cy.get('body').should('contain.text', 'email');
    });

    it('handles business photo upload', () => {
      cy.log('Testing business photo upload');
      
      cy.visit('/create-business');
      
      // Fill required fields
      cy.get('input[name="name"]').type(testBusiness.name);
      cy.get('textarea[name="description"]').type(testBusiness.description);
      cy.get('input[name="address"]').type(testBusiness.address);
      cy.get('input[name="phone"]').type(testBusiness.phone);
      cy.get('input[name="email"]').type(testBusiness.email);
      cy.get('select[name="category"]').select('1');
      
      // Upload photo if file input exists
      cy.get('body').then(($body) => {
        if ($body.find('input[type="file"]').length > 0) {
          cy.fixture('test-image.jpg').then(fileContent => {
            cy.get('input[type="file"]').attachFile({
              fileContent: fileContent.toString(),
              fileName: 'test-image.jpg',
              mimeType: 'image/jpeg'
            });
          });
        }
      });

      cy.get('button[type="submit"]').contains(/create|submit/i).click();
      
      // Verify success
      cy.url().should('include', '/dashboard');
      cy.get('body').should('contain.text', 'success');
    });
  });

  describe('Business Editing', () => {
    beforeEach(() => {
      // Create a business first
      cy.createBusiness(testBusiness);
    });

    it('allows business owner to edit their business', () => {
      cy.log('Testing business editing');
      
      // Navigate to business management
      cy.visit('/dashboard');
      
      // Find and edit the business
      cy.contains(testBusiness.name).parent().within(() => {
        cy.get('button').filter(':contains("Edit")').click();
      });
      
      // Update business information
      const updatedName = `${testBusiness.name} Updated`;
      cy.get('input[name="name"]').clear().type(updatedName);
      cy.get('textarea[name="description"]').clear().type('Updated description for the business');
      
      // Submit changes
      cy.get('button[type="submit"]').contains(/save|update/i).click();
      
      // Verify update
      cy.get('body').should('contain.text', 'updated');
      cy.contains(updatedName).should('be.visible');
    });

    it('allows business owner to update business hours', () => {
      cy.log('Testing business hours update');
      
      cy.visit('/dashboard');
      
      // Find and edit business hours
      cy.contains(testBusiness.name).parent().within(() => {
        cy.get('button').filter(':contains("Edit")').click();
      });
      
      // Update hours if form exists
      cy.get('body').then(($body) => {
        if ($body.find('input[name="mondayOpen"]').length > 0) {
          cy.get('input[name="mondayOpen"]').clear().type('08:00');
          cy.get('input[name="mondayClose"]').clear().type('18:00');
          
          cy.get('button[type="submit"]').contains(/save|update/i).click();
          
          cy.get('body').should('contain.text', 'updated');
        }
      });
    });

    it('allows business owner to manage business photos', () => {
      cy.log('Testing business photo management');
      
      cy.visit('/dashboard');
      
      // Navigate to photo management
      cy.contains(testBusiness.name).parent().within(() => {
        cy.get('button').filter(':contains("Photos")').click();
      });
      
      // Upload new photo if available
      cy.get('body').then(($body) => {
        if ($body.find('input[type="file"]').length > 0) {
          cy.fixture('test-image.jpg').then(fileContent => {
            cy.get('input[type="file"]').attachFile({
              fileContent: fileContent.toString(),
              fileName: 'new-photo.jpg',
              mimeType: 'image/jpeg'
            });
          });
          
          cy.get('button').filter(':contains("Upload")').click();
          cy.get('body').should('contain.text', 'uploaded');
        }
      });
    });
  });

  describe('Business Search and Discovery', () => {
    beforeEach(() => {
      // Create a business for search testing
      cy.createBusiness(testBusiness);
      cy.get('button').contains('Logout').click();
    });

    it('allows public users to search for businesses', () => {
      cy.log('Testing business search functionality');
      
      cy.visit('/');
      
      // Find search input
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type(testBusiness.name);
          cy.get('button').filter(':contains("Search")').click();
          
          // Should show search results
          cy.contains(testBusiness.name).should('be.visible');
        } else {
          cy.log('Search functionality not available on homepage');
        }
      });
    });

    it('allows filtering businesses by category', () => {
      cy.log('Testing category filtering');
      
      cy.visit('/categories');
      
      // Click on a category
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Restaurant")').length > 0) {
          cy.get('a').contains('Restaurant').click();
          
          // Should show businesses in that category
          cy.get('body').should('contain.text', 'Restaurant');
        } else {
          cy.log('Category filtering not available');
        }
      });
    });

    it('allows filtering businesses by location', () => {
      cy.log('Testing location filtering');
      
      cy.visit('/cities');
      
      // Click on a city
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Test City")').length > 0) {
          cy.get('a').contains('Test City').click();
          
          // Should show businesses in that location
          cy.get('body').should('contain.text', 'Test City');
        } else {
          cy.log('Location filtering not available');
        }
      });
    });

    it('displays business details page', () => {
      cy.log('Testing business details page');
      
      cy.visit('/');
      
      // Find and click on business
      cy.get('body').then(($body) => {
        if ($body.text().includes(testBusiness.name)) {
          cy.contains(testBusiness.name).click();
          
          // Should show business details
          cy.get('body').should('contain', testBusiness.description);
          cy.get('body').should('contain', testBusiness.address);
          cy.get('body').should('contain', testBusiness.phone);
        } else {
          cy.log('Business not found on homepage');
        }
      });
    });
  });

  describe('Business Reviews', () => {
    beforeEach(() => {
      // Create business and logout
      cy.createBusiness(testBusiness);
      cy.get('button').contains('Logout').click();
    });

    it('allows users to leave reviews', () => {
      cy.log('Testing review submission');
      
      // Find business and navigate to its page
      cy.visit('/');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes(testBusiness.name)) {
          cy.contains(testBusiness.name).click();
          
          // Look for review form
          cy.get('body').then(($reviewBody) => {
            if ($reviewBody.find('textarea[name="comment"]').length > 0) {
              // Fill review form
              cy.get('input[name="customerName"]').type('John Reviewer');
              cy.get('input[name="customerEmail"]').type('reviewer@example.com');
              cy.get('input[name="rating"][value="5"]').check();
              cy.get('textarea[name="comment"]').type('Excellent business with great service!');
              
              // Submit review
              cy.get('button').filter(':contains("Submit Review")').click();
              
              // Verify success
              cy.get('body').should('contain.text', 'review');
            } else {
              cy.log('Review form not available');
            }
          });
        }
      });
    });

    it('validates review form fields', () => {
      cy.log('Testing review validation');
      
      cy.visit('/');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes(testBusiness.name)) {
          cy.contains(testBusiness.name).click();
          
          // Try to submit empty review
          cy.get('body').then(($reviewBody) => {
            if ($reviewBody.find('button').filter(':contains("Submit Review")').length > 0) {
              cy.get('button').filter(':contains("Submit Review")').click();
              
              // Should show validation errors
              cy.get('body').should('contain.text', 'required');
            }
          });
        }
      });
    });
  });

  describe('Business Contact', () => {
    beforeEach(() => {
      // Create business and logout
      cy.createBusiness(testBusiness);
      cy.get('button').contains('Logout').click();
    });

    it('allows users to contact business', () => {
      cy.log('Testing business contact form');
      
      cy.visit('/');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes(testBusiness.name)) {
          cy.contains(testBusiness.name).click();
          
          // Look for contact form
          cy.get('body').then(($contactBody) => {
            if ($contactBody.find('button').filter(':contains("Contact")').length > 0) {
              cy.get('button').filter(':contains("Contact")').click();
              
              // Fill contact form
              cy.get('input[name="name"]').type('John Customer');
              cy.get('input[name="email"]').type('customer@example.com');
              cy.get('input[name="phone"]').type('(555) 987-6543');
              cy.get('textarea[name="message"]').type('I would like to inquire about your services.');
              
              // Submit contact form
              cy.get('button[type="submit"]').contains(/send|submit/i).click();
              
              // Verify success
              cy.get('body').should('contain.text', 'sent');
            } else {
              cy.log('Contact form not available');
            }
          });
        }
      });
    });
  });

  describe('Business Claim Process', () => {
    beforeEach(() => {
      // Create business and logout
      cy.createBusiness(testBusiness);
      cy.get('button').contains('Logout').click();
    });

    it('allows users to claim business ownership', () => {
      cy.log('Testing business claim process');
      
      cy.visit('/');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes(testBusiness.name)) {
          cy.contains(testBusiness.name).click();
          
          // Look for claim button
          cy.get('body').then(($claimBody) => {
            if ($claimBody.find('button').filter(':contains("Claim")').length > 0) {
              cy.get('button').filter(':contains("Claim")').click();
              
              // Fill claim form
              cy.get('input[name="fullName"]').type('Business Owner');
              cy.get('input[name="email"]').type('owner@business.com');
              cy.get('input[name="phone"]').type('(555) 123-4567');
              cy.get('select[name="relationship"]').select('Owner');
              cy.get('textarea[name="additionalInfo"]').type('I am the owner of this business.');
              
              // Submit claim
              cy.get('button[type="submit"]').contains(/submit|claim/i).click();
              
              // Verify success
              cy.get('body').should('contain.text', 'claim');
            } else {
              cy.log('Claim functionality not available');
            }
          });
        }
      });
    });
  });
});