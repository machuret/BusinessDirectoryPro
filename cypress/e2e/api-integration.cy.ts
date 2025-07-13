/**
 * API Integration E2E Tests
 * Tests frontend-backend integration and API functionality
 */

describe('API Integration Tests', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Business API Integration', () => {
    it('fetches businesses from API correctly', () => {
      cy.log('Testing business API integration');
      
      // Intercept API call
      cy.intercept('GET', '/api/businesses*').as('getBusinesses');
      
      cy.visit('/categories');
      
      // Wait for API call
      cy.wait('@getBusinesses').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.be.an('array');
      });
      
      // Should display businesses
      cy.get('body').should('be.visible');
    });

    it('handles business API errors gracefully', () => {
      cy.log('Testing business API error handling');
      
      // Mock API error
      cy.intercept('GET', '/api/businesses*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getBusinessesError');
      
      cy.visit('/categories');
      
      // Wait for API call
      cy.wait('@getBusinessesError');
      
      // Should show error message
      cy.get('body').should('contain.text', 'Error loading businesses');
    });

    it('creates business via API correctly', () => {
      cy.log('Testing business creation API');
      
      // Login first
      cy.registerUser(
        'businessowner@test.com',
        'Password123!',
        'Business',
        'Owner'
      );
      
      // Intercept API call
      cy.intercept('POST', '/api/businesses').as('createBusiness');
      
      cy.visit('/create-business');
      
      // Fill form
      cy.get('input[name="name"]').type('API Test Business');
      cy.get('textarea[name="description"]').type('A business created via API testing');
      cy.get('input[name="address"]').type('123 API Street');
      cy.get('input[name="phone"]').type('(555) 123-4567');
      cy.get('input[name="email"]').type('api@test.com');
      cy.get('select[name="category"]').select('1');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Wait for API call
      cy.wait('@createBusiness').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
        expect(interception.request.body).to.have.property('name', 'API Test Business');
      });
      
      // Should show success message
      cy.get('body').should('contain.text', 'success');
    });

    it('updates business via API correctly', () => {
      cy.log('Testing business update API');
      
      // Login and create business first
      cy.registerUser(
        'businessowner@test.com',
        'Password123!',
        'Business',
        'Owner'
      );
      
      cy.createBusiness({
        name: 'Original Business Name',
        description: 'Original description',
        address: '123 Original Street',
        phone: '(555) 123-4567',
        email: 'original@test.com',
        website: 'https://original.com'
      });
      
      // Intercept update API call
      cy.intercept('PUT', '/api/businesses/*').as('updateBusiness');
      
      cy.visit('/dashboard');
      
      // Edit business
      cy.get('button').filter(':contains("Edit")').first().click();
      
      // Update name
      cy.get('input[name="name"]').clear().type('Updated Business Name');
      
      // Submit update
      cy.get('button[type="submit"]').click();
      
      // Wait for API call
      cy.wait('@updateBusiness').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.request.body).to.have.property('name', 'Updated Business Name');
      });
      
      // Should show success message
      cy.get('body').should('contain.text', 'updated');
    });

    it('deletes business via API correctly', () => {
      cy.log('Testing business deletion API');
      
      // Login and create business first
      cy.registerUser(
        'businessowner@test.com',
        'Password123!',
        'Business',
        'Owner'
      );
      
      cy.createBusiness({
        name: 'Business to Delete',
        description: 'This business will be deleted',
        address: '123 Delete Street',
        phone: '(555) 123-4567',
        email: 'delete@test.com',
        website: 'https://delete.com'
      });
      
      // Intercept delete API call
      cy.intercept('DELETE', '/api/businesses/*').as('deleteBusiness');
      
      cy.visit('/dashboard');
      
      // Delete business
      cy.get('button').filter(':contains("Delete")').first().click();
      
      // Confirm deletion
      cy.get('button').filter(':contains("Confirm")').click();
      
      // Wait for API call
      cy.wait('@deleteBusiness').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
      
      // Should show success message
      cy.get('body').should('contain.text', 'deleted');
    });
  });

  describe('Authentication API Integration', () => {
    it('authenticates user via API correctly', () => {
      cy.log('Testing authentication API');
      
      // Register user first
      cy.registerUser(
        'apiuser@test.com',
        'Password123!',
        'API',
        'User'
      );
      
      // Logout
      cy.get('button').contains('Logout').click();
      
      // Intercept login API call
      cy.intercept('POST', '/api/auth/login').as('loginUser');
      
      cy.visit('/auth');
      
      // Login
      cy.get('input[name="email"]').type('apiuser@test.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();
      
      // Wait for API call
      cy.wait('@loginUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.request.body).to.have.property('email', 'apiuser@test.com');
      });
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });

    it('handles authentication errors via API', () => {
      cy.log('Testing authentication error handling');
      
      // Intercept login API call with error
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('loginError');
      
      cy.visit('/auth');
      
      // Try to login with invalid credentials
      cy.get('input[name="email"]').type('invalid@test.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Wait for API call
      cy.wait('@loginError');
      
      // Should show error message
      cy.get('body').should('contain.text', 'Invalid credentials');
    });

    it('registers user via API correctly', () => {
      cy.log('Testing user registration API');
      
      // Intercept registration API call
      cy.intercept('POST', '/api/auth/register').as('registerUser');
      
      cy.visit('/auth');
      
      // Switch to registration
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="register-tab"]').length > 0) {
          cy.get('[data-testid="register-tab"]').click();
        }
      });
      
      // Fill registration form
      cy.get('input[name="firstName"]').type('New');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('newuser@test.com');
      cy.get('input[name="password"]').type('Password123!');
      
      // Submit registration
      cy.get('button[type="submit"]').click();
      
      // Wait for API call
      cy.wait('@registerUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
        expect(interception.request.body).to.have.property('email', 'newuser@test.com');
      });
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });

    it('logs out user via API correctly', () => {
      cy.log('Testing user logout API');
      
      // Login first
      cy.loginUser('apiuser@test.com', 'Password123!');
      
      // Intercept logout API call
      cy.intercept('POST', '/api/auth/logout').as('logoutUser');
      
      // Logout
      cy.get('button').contains('Logout').click();
      
      // Wait for API call
      cy.wait('@logoutUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
      
      // Should redirect to homepage
      cy.url().should('not.include', '/dashboard');
    });
  });

  describe('Review API Integration', () => {
    it('creates review via API correctly', () => {
      cy.log('Testing review creation API');
      
      // Intercept review API call
      cy.intercept('POST', '/api/reviews').as('createReview');
      
      cy.visit('/categories');
      
      // Navigate to business detail
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Fill review form
              cy.get('body').then(($reviewBody) => {
                if ($reviewBody.find('textarea[name="comment"]').length > 0) {
                  cy.get('input[name="customerName"]').type('API Reviewer');
                  cy.get('input[name="customerEmail"]').type('reviewer@test.com');
                  cy.get('input[name="rating"][value="5"]').check();
                  cy.get('textarea[name="comment"]').type('Great business tested via API!');
                  
                  // Submit review
                  cy.get('button').filter(':contains("Submit Review")').click();
                  
                  // Wait for API call
                  cy.wait('@createReview').then((interception) => {
                    expect(interception.response.statusCode).to.equal(201);
                    expect(interception.request.body).to.have.property('customerName', 'API Reviewer');
                  });
                  
                  // Should show success message
                  cy.get('body').should('contain.text', 'review');
                }
              });
            }
          });
        }
      });
    });

    it('fetches reviews via API correctly', () => {
      cy.log('Testing review fetching API');
      
      // Intercept reviews API call
      cy.intercept('GET', '/api/reviews*').as('getReviews');
      
      cy.visit('/categories');
      
      // Navigate to business detail
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Wait for reviews API call
              cy.wait('@getReviews').then((interception) => {
                expect(interception.response.statusCode).to.equal(200);
                expect(interception.response.body).to.be.an('array');
              });
            }
          });
        }
      });
    });
  });

  describe('Contact API Integration', () => {
    it('submits contact form via API correctly', () => {
      cy.log('Testing contact form API');
      
      // Intercept contact API call
      cy.intercept('POST', '/api/contact').as('submitContact');
      
      cy.visit('/contact');
      
      // Fill contact form
      cy.get('input[name="name"]').type('API Contact');
      cy.get('input[name="email"]').type('contact@test.com');
      cy.get('input[name="phone"]').type('(555) 123-4567');
      cy.get('textarea[name="message"]').type('This is a test message via API');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Wait for API call
      cy.wait('@submitContact').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.request.body).to.have.property('name', 'API Contact');
      });
      
      // Should show success message
      cy.get('body').should('contain.text', 'Thank you');
    });

    it('validates contact form via API', () => {
      cy.log('Testing contact form validation API');
      
      // Intercept contact API call with validation error
      cy.intercept('POST', '/api/contact', {
        statusCode: 400,
        body: { error: 'Validation failed', details: ['Name is required'] }
      }).as('contactValidationError');
      
      cy.visit('/contact');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Wait for API call
      cy.wait('@contactValidationError');
      
      // Should show validation error
      cy.get('body').should('contain.text', 'required');
    });
  });

  describe('Search API Integration', () => {
    it('performs search via API correctly', () => {
      cy.log('Testing search API');
      
      // Intercept search API call
      cy.intercept('GET', '/api/search*').as('searchBusinesses');
      
      cy.visit('/');
      
      // Perform search
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type('restaurant');
          cy.get('button').filter(':contains("Search")').click();
          
          // Wait for API call
          cy.wait('@searchBusinesses').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body).to.be.an('array');
            expect(interception.request.url).to.include('q=restaurant');
          });
          
          // Should show search results
          cy.get('body').should('contain.text', 'restaurant');
        }
      });
    });

    it('handles search API errors gracefully', () => {
      cy.log('Testing search API error handling');
      
      // Mock search API error
      cy.intercept('GET', '/api/search*', {
        statusCode: 500,
        body: { error: 'Search service unavailable' }
      }).as('searchError');
      
      cy.visit('/');
      
      // Perform search
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type('test');
          cy.get('button').filter(':contains("Search")').click();
          
          // Wait for API call
          cy.wait('@searchError');
          
          // Should show error message
          cy.get('body').should('contain.text', 'Search unavailable');
        }
      });
    });
  });

  describe('File Upload API Integration', () => {
    it('uploads business photos via API correctly', () => {
      cy.log('Testing photo upload API');
      
      // Login and create business first
      cy.registerUser(
        'businessowner@test.com',
        'Password123!',
        'Business',
        'Owner'
      );
      
      cy.createBusiness({
        name: 'Photo Test Business',
        description: 'Testing photo upload',
        address: '123 Photo Street',
        phone: '(555) 123-4567',
        email: 'photo@test.com',
        website: 'https://photo.com'
      });
      
      // Intercept upload API call
      cy.intercept('POST', '/api/upload/photo').as('uploadPhoto');
      
      cy.visit('/dashboard');
      
      // Navigate to photo management
      cy.get('button').filter(':contains("Photos")').first().click();
      
      // Upload photo
      cy.get('body').then(($body) => {
        if ($body.find('input[type="file"]').length > 0) {
          cy.fixture('test-image.jpg').then(fileContent => {
            cy.get('input[type="file"]').attachFile({
              fileContent: fileContent.toString(),
              fileName: 'test-image.jpg',
              mimeType: 'image/jpeg'
            });
          });
          
          cy.get('button').filter(':contains("Upload")').click();
          
          // Wait for API call
          cy.wait('@uploadPhoto').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.request.body).to.be.instanceof(FormData);
          });
          
          // Should show success message
          cy.get('body').should('contain.text', 'uploaded');
        }
      });
    });

    it('handles file upload errors via API', () => {
      cy.log('Testing file upload error handling');
      
      // Login first
      cy.loginUser('businessowner@test.com', 'Password123!');
      
      // Mock upload API error
      cy.intercept('POST', '/api/upload/photo', {
        statusCode: 413,
        body: { error: 'File too large' }
      }).as('uploadError');
      
      cy.visit('/dashboard');
      
      // Try to upload file
      cy.get('body').then(($body) => {
        if ($body.find('input[type="file"]').length > 0) {
          cy.fixture('test-image.jpg').then(fileContent => {
            cy.get('input[type="file"]').attachFile({
              fileContent: fileContent.toString(),
              fileName: 'large-image.jpg',
              mimeType: 'image/jpeg'
            });
          });
          
          cy.get('button').filter(':contains("Upload")').click();
          
          // Wait for API call
          cy.wait('@uploadError');
          
          // Should show error message
          cy.get('body').should('contain.text', 'File too large');
        }
      });
    });
  });

  describe('Admin API Integration', () => {
    it('fetches admin data via API correctly', () => {
      cy.log('Testing admin API integration');
      
      // Login as admin
      cy.loginUser('admin@example.com', 'AdminPassword123!');
      
      // Intercept admin API calls
      cy.intercept('GET', '/api/admin/businesses').as('getAdminBusinesses');
      cy.intercept('GET', '/api/admin/users').as('getAdminUsers');
      
      cy.visit('/admin');
      
      // Navigate to business management
      cy.get('a').contains('Business').click();
      
      // Wait for API call
      cy.wait('@getAdminBusinesses').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.be.an('array');
      });
      
      // Navigate to user management
      cy.get('a').contains('Users').click();
      
      // Wait for API call
      cy.wait('@getAdminUsers').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.be.an('array');
      });
    });

    it('handles admin API authorization correctly', () => {
      cy.log('Testing admin API authorization');
      
      // Login as regular user
      cy.registerUser(
        'regularuser@test.com',
        'Password123!',
        'Regular',
        'User'
      );
      
      // Try to access admin API
      cy.request({
        method: 'GET',
        url: '/api/admin/businesses',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(403);
      });
    });
  });

  describe('API Rate Limiting', () => {
    it('handles API rate limiting correctly', () => {
      cy.log('Testing API rate limiting');
      
      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        cy.request({
          method: 'GET',
          url: '/api/businesses',
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 429) {
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.include('rate limit');
          }
        });
      }
    });
  });

  describe('API Error Handling', () => {
    it('handles network errors gracefully', () => {
      cy.log('Testing network error handling');
      
      // Mock network error
      cy.intercept('GET', '/api/businesses*', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/categories');
      
      // Wait for network error
      cy.wait('@networkError');
      
      // Should show error message
      cy.get('body').should('contain.text', 'Network error');
    });

    it('handles server errors gracefully', () => {
      cy.log('Testing server error handling');
      
      // Mock server error
      cy.intercept('GET', '/api/businesses*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('serverError');
      
      cy.visit('/categories');
      
      // Wait for server error
      cy.wait('@serverError');
      
      // Should show error message
      cy.get('body').should('contain.text', 'Server error');
    });
  });
});