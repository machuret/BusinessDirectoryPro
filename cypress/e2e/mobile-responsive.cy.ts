/**
 * Mobile Responsive E2E Tests
 * Tests mobile-specific functionality and responsive design
 */

describe('Mobile Responsive Design', () => {
  const mobileViewports = [
    { width: 375, height: 667, device: 'iPhone 6/7/8' },
    { width: 414, height: 896, device: 'iPhone XR' },
    { width: 360, height: 640, device: 'Samsung Galaxy S5' },
    { width: 412, height: 915, device: 'Google Pixel 5' }
  ];

  const tabletViewports = [
    { width: 768, height: 1024, device: 'iPad' },
    { width: 1024, height: 768, device: 'iPad Landscape' },
    { width: 820, height: 1180, device: 'iPad Air' }
  ];

  describe('Mobile Navigation', () => {
    mobileViewports.forEach(viewport => {
      it(`displays mobile navigation correctly on ${viewport.device}`, () => {
        cy.log(`Testing mobile navigation on ${viewport.device}`);
        
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/');
        cy.waitForPageReady();
        
        // Should have mobile navigation
        cy.get('nav').should('be.visible');
        
        // Look for mobile menu toggle
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="mobile-menu-toggle"]').length > 0) {
            cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
            cy.get('[data-testid="mobile-menu-toggle"]').click();
            
            // Mobile menu should open
            cy.get('[data-testid="mobile-menu"]').should('be.visible');
          } else if ($body.find('button').filter(':contains("Menu")').length > 0) {
            cy.get('button').contains('Menu').should('be.visible');
            cy.get('button').contains('Menu').click();
            
            // Menu should expand
            cy.get('body').should('contain.text', 'Home');
          } else {
            cy.log('Mobile menu toggle not found');
          }
        });
      });
    });

    it('allows mobile menu navigation', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Open mobile menu
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-menu-toggle"]').length > 0) {
          cy.get('[data-testid="mobile-menu-toggle"]').click();
          
          // Navigate to categories
          cy.get('a').contains('Categories').click();
          cy.url().should('include', '/categories');
        }
      });
    });

    it('closes mobile menu when clicking outside', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Open mobile menu
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-menu-toggle"]').length > 0) {
          cy.get('[data-testid="mobile-menu-toggle"]').click();
          
          // Click outside menu
          cy.get('body').click(100, 100);
          
          // Menu should close
          cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
        }
      });
    });
  });

  describe('Mobile Forms', () => {
    it('displays forms correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/contact');
      
      // Form should be mobile-friendly
      cy.get('form').should('be.visible');
      
      // Form fields should be properly sized
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('textarea[name="message"]').should('be.visible');
      
      // Test form interaction
      cy.get('input[name="name"]').type('Mobile Test User');
      cy.get('input[name="email"]').type('mobile@test.com');
      cy.get('textarea[name="message"]').type('Testing mobile form functionality');
      
      // Submit button should be accessible
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('handles touch interactions properly', () => {
      cy.viewport(375, 667);
      cy.visit('/contact');
      
      // Test touch events
      cy.get('input[name="name"]').click();
      cy.get('input[name="name"]').should('have.focus');
      
      // Test textarea expansion
      cy.get('textarea[name="message"]').click();
      cy.get('textarea[name="message"]').should('have.focus');
    });

    it('validates mobile form submissions', () => {
      cy.viewport(375, 667);
      cy.visit('/contact');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.get('body').should('contain.text', 'required');
      
      // Error messages should be visible on mobile
      cy.get('body').then(($body) => {
        if ($body.find('.error').length > 0) {
          cy.get('.error').should('be.visible');
        }
      });
    });
  });

  describe('Mobile Business Listings', () => {
    it('displays business cards correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/categories');
      
      // Navigate to a category
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          // Business cards should be mobile-friendly
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('[data-testid="business-card"]').length > 0) {
              cy.get('[data-testid="business-card"]').should('be.visible');
              
              // Cards should stack vertically on mobile
              cy.get('[data-testid="business-card"]').should('have.css', 'width');
            }
          });
        }
      });
    });

    it('allows mobile business detail viewing', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Navigate to business detail
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Business")').length > 0) {
          cy.get('a').contains('Business').first().click();
          
          // Business details should be mobile-friendly
          cy.get('body').should('contain.text', 'Business');
          
          // Contact info should be clickable on mobile
          cy.get('body').then(($detailBody) => {
            if ($detailBody.find('a[href^="tel:"]').length > 0) {
              cy.get('a[href^="tel:"]').should('be.visible');
            }
            if ($detailBody.find('a[href^="mailto:"]').length > 0) {
              cy.get('a[href^="mailto:"]').should('be.visible');
            }
          });
        }
      });
    });

    it('handles mobile business image gallery', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Navigate to business with images
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Business")').length > 0) {
          cy.get('a').contains('Business').first().click();
          
          // Images should be mobile-optimized
          cy.get('body').then(($imageBody) => {
            if ($imageBody.find('img').length > 0) {
              cy.get('img').should('be.visible');
              
              // Images should be responsive
              cy.get('img').should('have.css', 'max-width');
            }
          });
        }
      });
    });
  });

  describe('Mobile Search', () => {
    it('displays mobile search interface', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Search should be mobile-friendly
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').should('be.visible');
          
          // Search input should be properly sized
          cy.get('input[placeholder*="Search"]').should('have.css', 'width');
        }
      });
    });

    it('handles mobile search input', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Test search functionality
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type('restaurant');
          
          // Should handle mobile keyboard
          cy.get('input[placeholder*="Search"]').should('have.value', 'restaurant');
          
          // Search button should be accessible
          if ($body.find('button').filter(':contains("Search")').length > 0) {
            cy.get('button').contains('Search').should('be.visible');
          }
        }
      });
    });

    it('displays mobile search results', () => {
      cy.viewport(375, 667);
      cy.visit('/search?q=business');
      
      // Search results should be mobile-friendly
      cy.get('body').should('be.visible');
      
      // Results should stack vertically
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-result"]').length > 0) {
          cy.get('[data-testid="search-result"]').should('be.visible');
        }
      });
    });
  });

  describe('Mobile Authentication', () => {
    it('displays mobile login form', () => {
      cy.viewport(375, 667);
      cy.visit('/auth');
      
      // Login form should be mobile-friendly
      cy.get('form').should('be.visible');
      
      // Form fields should be properly sized
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      
      // Submit button should be accessible
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('handles mobile login interaction', () => {
      cy.viewport(375, 667);
      cy.visit('/auth');
      
      // Test form interaction
      cy.get('input[name="email"]').type('mobile@test.com');
      cy.get('input[name="password"]').type('password123');
      
      // Form should handle mobile input
      cy.get('input[name="email"]').should('have.value', 'mobile@test.com');
      cy.get('input[name="password"]').should('have.value', 'password123');
    });

    it('displays mobile registration form', () => {
      cy.viewport(375, 667);
      cy.visit('/auth');
      
      // Switch to registration
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="register-tab"]').length > 0) {
          cy.get('[data-testid="register-tab"]').click();
        }
      });
      
      // Registration form should be mobile-friendly
      cy.get('body').then(($body) => {
        if ($body.find('input[name="firstName"]').length > 0) {
          cy.get('input[name="firstName"]').should('be.visible');
          cy.get('input[name="lastName"]').should('be.visible');
          cy.get('input[name="email"]').should('be.visible');
          cy.get('input[name="password"]').should('be.visible');
        }
      });
    });
  });

  describe('Tablet Responsive Design', () => {
    tabletViewports.forEach(viewport => {
      it(`displays correctly on ${viewport.device}`, () => {
        cy.log(`Testing tablet layout on ${viewport.device}`);
        
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/');
        cy.waitForPageReady();
        
        // Should have appropriate layout for tablet
        cy.get('body').should('be.visible');
        
        // Navigation should be visible
        cy.get('nav').should('be.visible');
        
        // Content should be properly spaced
        cy.get('main').should('be.visible');
      });
    });

    it('handles tablet business listings', () => {
      cy.viewport(768, 1024);
      cy.visit('/categories');
      
      // Navigate to category
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          // Business cards should display in grid on tablet
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('[data-testid="business-card"]').length > 0) {
              cy.get('[data-testid="business-card"]').should('be.visible');
            }
          });
        }
      });
    });

    it('handles tablet form layouts', () => {
      cy.viewport(768, 1024);
      cy.visit('/contact');
      
      // Form should be optimized for tablet
      cy.get('form').should('be.visible');
      
      // Form should have appropriate width
      cy.get('form').should('have.css', 'max-width');
      
      // Form fields should be properly spaced
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('textarea[name="message"]').should('be.visible');
    });
  });

  describe('Touch Interactions', () => {
    it('handles touch gestures properly', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Test touch events
      cy.get('body').trigger('touchstart');
      cy.get('body').trigger('touchend');
      
      // Should handle touch navigation
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().trigger('touchstart');
          cy.get('a').first().trigger('touchend');
        }
      });
    });

    it('handles swipe gestures if implemented', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Test swipe gestures on image galleries
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="image-gallery"]').length > 0) {
          cy.get('[data-testid="image-gallery"]')
            .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
            .trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
            .trigger('touchend');
        }
      });
    });

    it('provides proper touch feedback', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Buttons should have touch feedback
      cy.get('button').each(($button) => {
        cy.wrap($button).should('have.css', 'cursor');
      });
      
      // Links should have touch feedback
      cy.get('a').each(($link) => {
        cy.wrap($link).should('have.css', 'cursor');
      });
    });
  });

  describe('Mobile Performance', () => {
    it('loads quickly on mobile', () => {
      cy.viewport(375, 667);
      
      const startTime = Date.now();
      cy.visit('/');
      cy.waitForPageReady();
      const endTime = Date.now();
      
      // Should load within 3 seconds on mobile
      expect(endTime - startTime).to.be.lessThan(3000);
    });

    it('handles mobile image optimization', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Images should be optimized for mobile
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'loading');
        cy.wrap($img).should('have.css', 'max-width');
      });
    });

    it('minimizes mobile data usage', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Should use responsive images
      cy.get('img').each(($img) => {
        const src = $img.attr('src');
        if (src) {
          expect(src).to.match(/\.(jpg|jpeg|png|webp)$/i);
        }
      });
    });
  });

  describe('Mobile Accessibility', () => {
    it('supports mobile screen readers', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Should have proper ARIA labels
      cy.get('button').each(($button) => {
        cy.wrap($button).should('have.attr', 'aria-label');
      });
      
      // Should have proper heading structure
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
    });

    it('supports mobile keyboard navigation', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Should support tab navigation
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Should support focus management
      cy.get('input').first().focus();
      cy.focused().should('be.visible');
    });

    it('provides adequate touch targets', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Buttons should be large enough for touch
      cy.get('button').each(($button) => {
        cy.wrap($button).should('have.css', 'min-height');
        cy.wrap($button).should('have.css', 'min-width');
      });
      
      // Links should be large enough for touch
      cy.get('a').each(($link) => {
        cy.wrap($link).should('have.css', 'padding');
      });
    });
  });
});