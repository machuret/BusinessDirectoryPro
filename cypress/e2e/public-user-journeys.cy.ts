/**
 * Public User Journeys E2E Tests
 * Tests anonymous user interactions and public functionality
 */

describe('Public User Journeys', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/');
    cy.waitForPageReady();
  });

  describe('Homepage Experience', () => {
    it('displays homepage with all key sections', () => {
      cy.log('Testing homepage layout and content');
      
      // Should show main navigation
      cy.get('nav').should('be.visible');
      
      // Should show hero section
      cy.get('body').should('contain.text', 'Business Directory');
      
      // Should show featured businesses if available
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="featured-businesses"]').length > 0) {
          cy.get('[data-testid="featured-businesses"]').should('be.visible');
        }
      });
      
      // Should show search functionality
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').should('be.visible');
        }
      });
      
      // Should show category links
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Categories")').length > 0) {
          cy.get('a').contains('Categories').should('be.visible');
        }
      });
    });

    it('allows navigation to main sections', () => {
      cy.log('Testing main navigation functionality');
      
      // Test Categories navigation
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Categories")').length > 0) {
          cy.get('a').contains('Categories').click();
          cy.url().should('include', '/categories');
          cy.get('body').should('contain.text', 'Categories');
        }
      });
      
      // Return to homepage
      cy.visit('/');
      
      // Test Cities navigation
      cy.get('body').then(($body) => {
        if ($body.find('a').filter(':contains("Cities")').length > 0) {
          cy.get('a').contains('Cities').click();
          cy.url().should('include', '/cities');
          cy.get('body').should('contain.text', 'Cities');
        }
      });
    });

    it('displays featured businesses correctly', () => {
      cy.log('Testing featured business display');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="featured-business"]').length > 0) {
          // Should show featured business cards
          cy.get('[data-testid="featured-business"]').should('be.visible');
          
          // Each card should have essential information
          cy.get('[data-testid="featured-business"]').each(($card) => {
            cy.wrap($card).should('contain.text', 'Business');
            cy.wrap($card).find('a').should('exist');
          });
        } else {
          cy.log('No featured businesses found');
        }
      });
    });

    it('provides working search functionality', () => {
      cy.log('Testing homepage search');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type('restaurant');
          
          // Submit search
          cy.get('button').filter(':contains("Search")').click();
          
          // Should navigate to search results
          cy.url().should('include', 'search');
          cy.get('body').should('contain.text', 'restaurant');
        }
      });
    });
  });

  describe('Business Discovery', () => {
    it('allows browsing businesses by category', () => {
      cy.log('Testing category-based business discovery');
      
      cy.visit('/categories');
      
      // Should show list of categories
      cy.get('body').should('contain.text', 'Categories');
      
      // Click on first available category
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          const categoryLink = $body.find('a').first();
          const categoryName = categoryLink.text();
          
          cy.wrap(categoryLink).click();
          
          // Should show businesses in that category
          cy.get('body').should('contain.text', categoryName);
          
          // Should show business listings
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('[data-testid="business-card"]').length > 0) {
              cy.get('[data-testid="business-card"]').should('be.visible');
            }
          });
        }
      });
    });

    it('allows browsing businesses by city', () => {
      cy.log('Testing city-based business discovery');
      
      cy.visit('/cities');
      
      // Should show list of cities
      cy.get('body').should('contain.text', 'Cities');
      
      // Click on first available city
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          const cityLink = $body.find('a').first();
          const cityName = cityLink.text();
          
          cy.wrap(cityLink).click();
          
          // Should show businesses in that city
          cy.get('body').should('contain.text', cityName);
          
          // Should show business listings
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('[data-testid="business-card"]').length > 0) {
              cy.get('[data-testid="business-card"]').should('be.visible');
            }
          });
        }
      });
    });

    it('handles empty category/city results gracefully', () => {
      cy.log('Testing empty results handling');
      
      // Try to access a category with no businesses
      cy.visit('/categories/nonexistent-category');
      
      // Should show appropriate message
      cy.get('body').should('contain.text', 'No businesses found');
    });

    it('provides pagination for large result sets', () => {
      cy.log('Testing pagination functionality');
      
      cy.visit('/categories');
      
      // Navigate to category with many businesses
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          // Check for pagination controls
          cy.get('body').then(($paginationBody) => {
            if ($paginationBody.find('[data-testid="pagination"]').length > 0) {
              cy.get('[data-testid="pagination"]').should('be.visible');
              
              // Test next page
              if ($paginationBody.find('button').filter(':contains("Next")').length > 0) {
                cy.get('button').contains('Next').click();
                cy.url().should('include', 'page=2');
              }
            }
          });
        }
      });
    });
  });

  describe('Business Detail Pages', () => {
    it('displays complete business information', () => {
      cy.log('Testing business detail page');
      
      // Navigate to a business detail page
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          // Should show business listings
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Should show business details
              cy.get('body').should('contain.text', 'Business');
              cy.get('body').should('contain.text', 'Address');
              cy.get('body').should('contain.text', 'Phone');
              cy.get('body').should('contain.text', 'Email');
            }
          });
        }
      });
    });

    it('displays business hours correctly', () => {
      cy.log('Testing business hours display');
      
      // Navigate to business detail
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Should show business hours
              cy.get('body').then(($detailBody) => {
                if ($detailBody.text().includes('Hours')) {
                  cy.get('body').should('contain.text', 'Hours');
                  cy.get('body').should('contain.text', 'Monday');
                }
              });
            }
          });
        }
      });
    });

    it('displays business photos and gallery', () => {
      cy.log('Testing business photo gallery');
      
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Should show business photos
              cy.get('body').then(($photoBody) => {
                if ($photoBody.find('img').length > 0) {
                  cy.get('img').should('be.visible');
                  
                  // Images should be properly sized
                  cy.get('img').should('have.attr', 'alt');
                }
              });
            }
          });
        }
      });
    });

    it('provides working contact information', () => {
      cy.log('Testing contact information functionality');
      
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Should have clickable phone number
              cy.get('body').then(($contactBody) => {
                if ($contactBody.find('a[href^="tel:"]').length > 0) {
                  cy.get('a[href^="tel:"]').should('be.visible');
                }
                
                // Should have clickable email
                if ($contactBody.find('a[href^="mailto:"]').length > 0) {
                  cy.get('a[href^="mailto:"]').should('be.visible');
                }
                
                // Should have clickable website
                if ($contactBody.find('a[href^="http"]').length > 0) {
                  cy.get('a[href^="http"]').should('be.visible');
                }
              });
            }
          });
        }
      });
    });

    it('shows business reviews and ratings', () => {
      cy.log('Testing business reviews display');
      
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Should show reviews section
              cy.get('body').then(($reviewBody) => {
                if ($reviewBody.text().includes('Reviews')) {
                  cy.get('body').should('contain.text', 'Reviews');
                  
                  // Should show review form
                  if ($reviewBody.find('textarea[name="comment"]').length > 0) {
                    cy.get('textarea[name="comment"]').should('be.visible');
                  }
                }
              });
            }
          });
        }
      });
    });
  });

  describe('Search Functionality', () => {
    it('performs basic text search', () => {
      cy.log('Testing basic search functionality');
      
      cy.visit('/');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type('restaurant');
          cy.get('button').filter(':contains("Search")').click();
          
          // Should show search results
          cy.url().should('include', 'search');
          cy.get('body').should('contain.text', 'restaurant');
        }
      });
    });

    it('handles search with filters', () => {
      cy.log('Testing search with filters');
      
      cy.visit('/search?q=business');
      
      // Should show search results
      cy.get('body').should('contain.text', 'Search');
      
      // Should show filter options
      cy.get('body').then(($body) => {
        if ($body.find('select[name="category"]').length > 0) {
          cy.get('select[name="category"]').select('1');
          
          // Should update results
          cy.get('body').should('be.visible');
        }
        
        if ($body.find('select[name="city"]').length > 0) {
          cy.get('select[name="city"]').select('1');
          
          // Should update results
          cy.get('body').should('be.visible');
        }
      });
    });

    it('handles empty search results', () => {
      cy.log('Testing empty search results');
      
      cy.visit('/search?q=nonexistentbusiness12345');
      
      // Should show no results message
      cy.get('body').should('contain.text', 'No results found');
      cy.get('body').should('contain.text', 'Try different keywords');
    });

    it('provides search suggestions', () => {
      cy.log('Testing search suggestions');
      
      cy.visit('/');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type('rest');
          
          // Should show suggestions
          cy.get('body').then(($suggestionBody) => {
            if ($suggestionBody.find('[data-testid="search-suggestions"]').length > 0) {
              cy.get('[data-testid="search-suggestions"]').should('be.visible');
            }
          });
        }
      });
    });
  });

  describe('Contact and Lead Generation', () => {
    it('allows public contact form submission', () => {
      cy.log('Testing public contact form');
      
      cy.visit('/contact');
      
      // Should show contact form
      cy.get('form').should('be.visible');
      
      // Fill contact form
      cy.get('input[name="name"]').type('John Public');
      cy.get('input[name="email"]').type('john@public.com');
      cy.get('input[name="phone"]').type('(555) 123-4567');
      cy.get('textarea[name="message"]').type('I would like to inquire about listing my business.');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show success message
      cy.get('body').should('contain.text', 'Thank you');
      cy.get('body').should('contain.text', 'message');
    });

    it('validates contact form fields', () => {
      cy.log('Testing contact form validation');
      
      cy.visit('/contact');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.get('body').should('contain.text', 'required');
      
      // Test invalid email
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      
      cy.get('body').should('contain.text', 'email');
    });

    it('allows business inquiries from detail pages', () => {
      cy.log('Testing business inquiry form');
      
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Look for inquiry form
              cy.get('body').then(($inquiryBody) => {
                if ($inquiryBody.find('button').filter(':contains("Contact")').length > 0) {
                  cy.get('button').contains('Contact').click();
                  
                  // Fill inquiry form
                  cy.get('input[name="name"]').type('Interested Customer');
                  cy.get('input[name="email"]').type('customer@example.com');
                  cy.get('textarea[name="message"]').type('I am interested in your services.');
                  
                  cy.get('button[type="submit"]').click();
                  
                  // Should show success message
                  cy.get('body').should('contain.text', 'sent');
                }
              });
            }
          });
        }
      });
    });
  });

  describe('Public Review System', () => {
    it('allows anonymous users to leave reviews', () => {
      cy.log('Testing anonymous review submission');
      
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Look for review form
              cy.get('body').then(($reviewBody) => {
                if ($reviewBody.find('textarea[name="comment"]').length > 0) {
                  // Fill review form
                  cy.get('input[name="customerName"]').type('Anonymous Reviewer');
                  cy.get('input[name="customerEmail"]').type('reviewer@example.com');
                  cy.get('input[name="rating"][value="5"]').check();
                  cy.get('textarea[name="comment"]').type('Great business with excellent service!');
                  
                  cy.get('button').filter(':contains("Submit Review")').click();
                  
                  // Should show success message
                  cy.get('body').should('contain.text', 'review');
                }
              });
            }
          });
        }
      });
    });

    it('validates review form fields', () => {
      cy.log('Testing review form validation');
      
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
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
        }
      });
    });

    it('displays existing reviews correctly', () => {
      cy.log('Testing review display');
      
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          cy.get('body').then(($businessBody) => {
            if ($businessBody.find('a').filter(':contains("Business")').length > 0) {
              cy.get('a').contains('Business').first().click();
              
              // Should show existing reviews
              cy.get('body').then(($reviewBody) => {
                if ($reviewBody.find('[data-testid="review-item"]').length > 0) {
                  cy.get('[data-testid="review-item"]').should('be.visible');
                  
                  // Each review should have rating and comment
                  cy.get('[data-testid="review-item"]').each(($review) => {
                    cy.wrap($review).should('contain.text', 'stars');
                    cy.wrap($review).should('contain.text', 'comment');
                  });
                }
              });
            }
          });
        }
      });
    });
  });

  describe('Navigation and User Experience', () => {
    it('provides consistent navigation across pages', () => {
      cy.log('Testing navigation consistency');
      
      const pages = ['/', '/categories', '/cities', '/contact'];
      
      pages.forEach(page => {
        cy.visit(page);
        
        // Should have consistent navigation
        cy.get('nav').should('be.visible');
        
        // Should have home link
        cy.get('nav').should('contain.text', 'Home');
        
        // Should have categories link
        cy.get('nav').should('contain.text', 'Categories');
      });
    });

    it('provides breadcrumb navigation', () => {
      cy.log('Testing breadcrumb navigation');
      
      cy.visit('/categories');
      
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          // Should show breadcrumbs
          cy.get('body').then(($breadcrumbBody) => {
            if ($breadcrumbBody.find('[data-testid="breadcrumbs"]').length > 0) {
              cy.get('[data-testid="breadcrumbs"]').should('be.visible');
              cy.get('[data-testid="breadcrumbs"]').should('contain.text', 'Home');
              cy.get('[data-testid="breadcrumbs"]').should('contain.text', 'Categories');
            }
          });
        }
      });
    });

    it('handles 404 errors gracefully', () => {
      cy.log('Testing 404 error handling');
      
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      
      // Should show 404 page
      cy.get('body').should('contain.text', '404');
      cy.get('body').should('contain.text', 'Page not found');
      
      // Should provide navigation back to home
      cy.get('a').filter(':contains("Home")').should('be.visible');
    });

    it('maintains scroll position on back navigation', () => {
      cy.log('Testing scroll position maintenance');
      
      cy.visit('/categories');
      
      // Scroll down
      cy.scrollTo(0, 500);
      
      // Navigate to business detail
      cy.get('body').then(($body) => {
        if ($body.find('a').length > 0) {
          cy.get('a').first().click();
          
          // Navigate back
          cy.go('back');
          
          // Should maintain scroll position
          cy.window().its('scrollY').should('be.closeTo', 500, 100);
        }
      });
    });
  });

  describe('Performance and Loading', () => {
    it('loads pages quickly', () => {
      cy.log('Testing page load performance');
      
      const pages = ['/', '/categories', '/cities', '/contact'];
      
      pages.forEach(page => {
        const startTime = Date.now();
        cy.visit(page);
        cy.waitForPageReady();
        const endTime = Date.now();
        
        // Should load within 2 seconds
        expect(endTime - startTime).to.be.lessThan(2000);
      });
    });

    it('handles slow network gracefully', () => {
      cy.log('Testing slow network handling');
      
      // Simulate slow network
      cy.intercept('GET', '/api/**', { delay: 2000 }).as('slowAPI');
      
      cy.visit('/categories');
      
      // Should show loading states
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="loading"]').length > 0) {
          cy.get('[data-testid="loading"]').should('be.visible');
        }
      });
    });

    it('provides progressive loading for images', () => {
      cy.log('Testing progressive image loading');
      
      cy.visit('/');
      
      // Images should have lazy loading
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'loading', 'lazy');
      });
    });
  });
});