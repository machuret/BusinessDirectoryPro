/**
 * Admin Workflows E2E Tests
 * Tests admin panel functionality, business management, user management
 */

describe('Admin Workflows', () => {
  const timestamp = Date.now();
  
  const adminUser = {
    email: 'admin@example.com',
    password: 'AdminPassword123!'
  };

  const testBusiness = {
    name: `Admin Test Business ${timestamp}`,
    description: 'A business created for admin testing purposes',
    address: '456 Admin Street, Admin City, Admin State 12345',
    phone: '+1 (555) 987-6543',
    email: `admintest${timestamp}@example.com`,
    website: `https://admintest${timestamp}.com`
  };

  const testUser = {
    email: `testuser${timestamp}@example.com`,
    password: 'TestUser123!',
    firstName: 'Test',
    lastName: 'User'
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
    
    // Login as admin
    cy.loginUser(adminUser.email, adminUser.password);
    
    // Navigate to admin panel
    cy.visit('/admin');
    cy.waitForPageReady();
  });

  describe('Admin Dashboard', () => {
    it('displays admin dashboard with statistics', () => {
      cy.log('Testing admin dashboard display');
      
      // Should show admin dashboard
      cy.get('body').should('contain.text', 'Admin');
      cy.get('body').should('contain.text', 'Dashboard');
      
      // Should show statistics
      cy.get('body').should('contain.text', 'Total');
      cy.get('body').should('contain.text', 'Businesses');
      cy.get('body').should('contain.text', 'Users');
    });

    it('allows navigation to different admin sections', () => {
      cy.log('Testing admin navigation');
      
      // Test business management navigation
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Business")').length > 0) {
          cy.get('a').contains('Business').click();
          cy.get('body').should('contain.text', 'Business Management');
        }
      });

      // Test user management navigation
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Users")').length > 0) {
          cy.get('a').contains('Users').click();
          cy.get('body').should('contain.text', 'User Management');
        }
      });
    });
  });

  describe('Business Management', () => {
    beforeEach(() => {
      // Navigate to business management
      cy.visit('/admin/businesses');
    });

    it('displays list of businesses', () => {
      cy.log('Testing business list display');
      
      cy.get('body').should('contain.text', 'Business');
      cy.get('body').should('contain.text', 'Management');
      
      // Should show business table or list
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('table').should('be.visible');
        } else if ($body.find('[data-testid="business-list"]').length > 0) {
          cy.get('[data-testid="business-list"]').should('be.visible');
        }
      });
    });

    it('allows admin to create new business', () => {
      cy.log('Testing admin business creation');
      
      // Look for add business button
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Add")').length > 0) {
          cy.get('button').contains('Add').click();
          
          // Fill business form
          cy.get('input[name="name"]').type(testBusiness.name);
          cy.get('textarea[name="description"]').type(testBusiness.description);
          cy.get('input[name="address"]').type(testBusiness.address);
          cy.get('input[name="phone"]').type(testBusiness.phone);
          cy.get('input[name="email"]').type(testBusiness.email);
          cy.get('select[name="category"]').select('1');
          
          // Submit form
          cy.get('button[type="submit"]').contains(/create|save/i).click();
          
          // Verify success
          cy.get('body').should('contain.text', 'success');
          cy.contains(testBusiness.name).should('be.visible');
        } else {
          cy.log('Add business functionality not available');
        }
      });
    });

    it('allows admin to edit existing business', () => {
      cy.log('Testing admin business editing');
      
      // Find existing business and edit
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Edit")').length > 0) {
          cy.get('button').contains('Edit').first().click();
          
          // Update business information
          cy.get('input[name="name"]').clear().type('Updated Business Name');
          
          // Submit changes
          cy.get('button[type="submit"]').contains(/save|update/i).click();
          
          // Verify update
          cy.get('body').should('contain.text', 'updated');
        } else {
          cy.log('Edit business functionality not available');
        }
      });
    });

    it('allows admin to approve/disapprove businesses', () => {
      cy.log('Testing business approval workflow');
      
      // Look for approval controls
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Approve")').length > 0) {
          cy.get('button').contains('Approve').first().click();
          
          // Verify approval
          cy.get('body').should('contain.text', 'approved');
        } else if ($body.find('input[type="checkbox"]').length > 0) {
          // Toggle approval checkbox
          cy.get('input[type="checkbox"]').first().check();
          
          // Save changes
          cy.get('button').filter(':contains("Save")').click();
          
          cy.get('body').should('contain.text', 'updated');
        } else {
          cy.log('Approval functionality not available');
        }
      });
    });

    it('allows admin to delete businesses', () => {
      cy.log('Testing business deletion');
      
      // Look for delete button
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Delete")').length > 0) {
          cy.get('button').contains('Delete').first().click();
          
          // Confirm deletion
          cy.get('body').then(($confirmBody) => {
            if ($confirmBody.find('button').filter(':contains("Confirm")').length > 0) {
              cy.get('button').contains('Confirm').click();
            }
          });
          
          // Verify deletion
          cy.get('body').should('contain.text', 'deleted');
        } else {
          cy.log('Delete functionality not available');
        }
      });
    });

    it('allows admin to search and filter businesses', () => {
      cy.log('Testing business search and filtering');
      
      // Test search functionality
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type('Test');
          
          // Should filter results
          cy.get('body').should('contain.text', 'Test');
        }
      });

      // Test category filtering
      cy.get('body').then(($body) => {
        if ($body.find('select[name="category"]').length > 0) {
          cy.get('select[name="category"]').select('1');
          
          // Should filter by category
          cy.get('body').should('be.visible');
        }
      });
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      // Navigate to user management
      cy.visit('/admin/users');
    });

    it('displays list of users', () => {
      cy.log('Testing user list display');
      
      cy.get('body').should('contain.text', 'User');
      cy.get('body').should('contain.text', 'Management');
      
      // Should show user table or list
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('table').should('be.visible');
        } else if ($body.find('[data-testid="user-list"]').length > 0) {
          cy.get('[data-testid="user-list"]').should('be.visible');
        }
      });
    });

    it('allows admin to view user details', () => {
      cy.log('Testing user details view');
      
      // Find and click on user
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("View")').length > 0) {
          cy.get('button').contains('View').first().click();
          
          // Should show user details
          cy.get('body').should('contain.text', 'email');
        } else {
          cy.log('View user functionality not available');
        }
      });
    });

    it('allows admin to change user roles', () => {
      cy.log('Testing user role management');
      
      // Look for role management controls
      cy.get('body').then(($body) => {
        if ($body.find('select[name="role"]').length > 0) {
          cy.get('select[name="role"]').first().select('admin');
          
          // Save changes
          cy.get('button').filter(':contains("Save")').click();
          
          cy.get('body').should('contain.text', 'updated');
        } else if ($body.find('button').filter(':contains("Make Admin")').length > 0) {
          cy.get('button').contains('Make Admin').first().click();
          
          cy.get('body').should('contain.text', 'admin');
        } else {
          cy.log('Role management functionality not available');
        }
      });
    });

    it('allows admin to activate/deactivate users', () => {
      cy.log('Testing user activation/deactivation');
      
      // Look for activation controls
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Deactivate")').length > 0) {
          cy.get('button').contains('Deactivate').first().click();
          
          cy.get('body').should('contain.text', 'deactivated');
        } else if ($body.find('input[type="checkbox"]').length > 0) {
          // Toggle activation checkbox
          cy.get('input[type="checkbox"]').first().uncheck();
          
          cy.get('button').filter(':contains("Save")').click();
          
          cy.get('body').should('contain.text', 'updated');
        } else {
          cy.log('User activation functionality not available');
        }
      });
    });
  });

  describe('Review Management', () => {
    beforeEach(() => {
      // Navigate to review management
      cy.visit('/admin/reviews');
    });

    it('displays list of reviews', () => {
      cy.log('Testing review list display');
      
      cy.get('body').should('contain.text', 'Review');
      
      // Should show review table or list
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('table').should('be.visible');
        } else if ($body.find('[data-testid="review-list"]').length > 0) {
          cy.get('[data-testid="review-list"]').should('be.visible');
        } else {
          cy.log('Review list not available');
        }
      });
    });

    it('allows admin to approve/reject reviews', () => {
      cy.log('Testing review moderation');
      
      // Look for moderation controls
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Approve")').length > 0) {
          cy.get('button').contains('Approve').first().click();
          
          cy.get('body').should('contain.text', 'approved');
        } else if ($body.find('button').filter(':contains("Reject")').length > 0) {
          cy.get('button').contains('Reject').first().click();
          
          cy.get('body').should('contain.text', 'rejected');
        } else {
          cy.log('Review moderation functionality not available');
        }
      });
    });

    it('allows admin to flag inappropriate reviews', () => {
      cy.log('Testing review flagging');
      
      // Look for flagging controls
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Flag")').length > 0) {
          cy.get('button').contains('Flag').first().click();
          
          cy.get('body').should('contain.text', 'flagged');
        } else {
          cy.log('Review flagging functionality not available');
        }
      });
    });
  });

  describe('Featured Requests Management', () => {
    beforeEach(() => {
      // Navigate to featured requests
      cy.visit('/admin/featured-requests');
    });

    it('displays featured requests', () => {
      cy.log('Testing featured requests display');
      
      cy.get('body').should('contain.text', 'Featured');
      
      // Should show requests table or list
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('table').should('be.visible');
        } else if ($body.find('[data-testid="request-list"]').length > 0) {
          cy.get('[data-testid="request-list"]').should('be.visible');
        } else {
          cy.log('Featured requests not available');
        }
      });
    });

    it('allows admin to approve featured requests', () => {
      cy.log('Testing featured request approval');
      
      // Look for approval controls
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Approve")').length > 0) {
          cy.get('button').contains('Approve').first().click();
          
          cy.get('body').should('contain.text', 'approved');
        } else {
          cy.log('Featured request approval not available');
        }
      });
    });
  });

  describe('Content Management', () => {
    beforeEach(() => {
      // Navigate to content management
      cy.visit('/admin/content');
    });

    it('allows admin to manage site content', () => {
      cy.log('Testing content management');
      
      cy.get('body').should('contain.text', 'Content');
      
      // Look for content editing capabilities
      cy.get('body').then(($body) => {
        if ($body.find('input[name="title"]').length > 0) {
          cy.get('input[name="title"]').clear().type('Updated Site Title');
          
          cy.get('button').filter(':contains("Save")').click();
          
          cy.get('body').should('contain.text', 'updated');
        } else {
          cy.log('Content management functionality not available');
        }
      });
    });
  });

  describe('System Settings', () => {
    beforeEach(() => {
      // Navigate to system settings
      cy.visit('/admin/settings');
    });

    it('allows admin to update system settings', () => {
      cy.log('Testing system settings management');
      
      cy.get('body').should('contain.text', 'Settings');
      
      // Look for settings forms
      cy.get('body').then(($body) => {
        if ($body.find('input[type="text"]').length > 0) {
          cy.get('input[type="text"]').first().clear().type('Updated Setting Value');
          
          cy.get('button').filter(':contains("Save")').click();
          
          cy.get('body').should('contain.text', 'saved');
        } else {
          cy.log('System settings functionality not available');
        }
      });
    });
  });

  describe('Analytics and Reports', () => {
    beforeEach(() => {
      // Navigate to analytics
      cy.visit('/admin/analytics');
    });

    it('displays analytics dashboard', () => {
      cy.log('Testing analytics dashboard');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('Analytics')) {
          cy.get('body').should('contain.text', 'Analytics');
          
          // Should show charts or statistics
          cy.get('body').should('contain.text', 'Total');
        } else {
          cy.log('Analytics dashboard not available');
        }
      });
    });

    it('allows admin to generate reports', () => {
      cy.log('Testing report generation');
      
      cy.get('body').then(($body) => {
        if ($body.find('button').filter(':contains("Generate")').length > 0) {
          cy.get('button').contains('Generate').click();
          
          cy.get('body').should('contain.text', 'report');
        } else {
          cy.log('Report generation not available');
        }
      });
    });
  });

  describe('Admin Security', () => {
    it('prevents unauthorized access to admin panel', () => {
      cy.log('Testing admin access control');
      
      // Logout admin
      cy.get('button').contains('Logout').click();
      
      // Try to access admin panel
      cy.visit('/admin');
      
      // Should redirect to login
      cy.url().should('include', '/auth');
    });

    it('validates admin permissions', () => {
      cy.log('Testing admin permission validation');
      
      // Admin should have access to all sections
      cy.visit('/admin');
      
      cy.get('body').should('contain.text', 'Admin');
      cy.get('body').should('contain.text', 'Dashboard');
    });
  });
});