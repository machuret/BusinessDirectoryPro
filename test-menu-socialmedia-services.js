/**
 * Comprehensive Menu and Social Media Services Test
 * Tests both service layers with their complex ordering and validation logic
 */

class MenuSocialMediaServiceTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testData = {
      createdItems: [],
      createdLinks: []
    };
  }

  log(message, data = null) {
    console.log(`[TEST] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async makeRequest(method, path, data = null) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url);
    const result = await response.json();
    
    return { status: response.status, data: result };
  }

  async testMenuItemCreation() {
    this.log('Testing Menu Item Creation with Validation');
    
    try {
      const menuItem = {
        name: 'Test Service Menu',
        url: '/test-service',
        position: 'header',
        isActive: true
      };

      const result = await this.makeRequest('POST', '/api/admin/menu-items', menuItem);
      
      if (result.status === 201) {
        this.testData.createdItems.push(result.data.id);
        this.log('✓ Menu item created successfully', { id: result.data.id, name: result.data.name });
        return true;
      } else {
        this.log('❌ Failed to create menu item', result);
        return false;
      }
    } catch (error) {
      this.log('❌ Error creating menu item:', error.message);
      return false;
    }
  }

  async testMenuItemOrdering() {
    this.log('Testing Menu Item Ordering Logic');
    
    try {
      // Get all header menu items
      const getResult = await this.makeRequest('GET', '/api/menu-items?position=header');
      
      if (getResult.status === 200 && getResult.data.length >= 2) {
        const items = getResult.data;
        const firstItem = items[0];
        
        // Test moving item down
        const moveResult = await this.makeRequest('POST', `/api/admin/menu-items/${firstItem.id}/move`, {
          direction: 'down'
        });
        
        if (moveResult.status === 200) {
          this.log('✓ Menu item moved successfully', { direction: 'down', itemId: firstItem.id });
          return true;
        } else {
          this.log('❌ Failed to move menu item', moveResult);
          return false;
        }
      } else {
        this.log('ℹ️ Not enough menu items for ordering test');
        return true;
      }
    } catch (error) {
      this.log('❌ Error testing menu item ordering:', error.message);
      return false;
    }
  }

  async testSocialMediaLinkCreation() {
    this.log('Testing Social Media Link Creation with Enhanced Validation');
    
    try {
      const socialLink = {
        platform: 'facebook',
        url: 'https://facebook.com/testcompany',
        displayName: 'Test Company Facebook',
        iconClass: 'fab fa-facebook-f',
        isActive: true
      };

      const result = await this.makeRequest('POST', '/api/admin/social-media', socialLink);
      
      if (result.status === 201) {
        this.testData.createdLinks.push(result.data.id);
        this.log('✓ Social media link created successfully', { 
          id: result.data.id, 
          platform: result.data.platform 
        });
        return true;
      } else {
        this.log('❌ Failed to create social media link', result);
        return false;
      }
    } catch (error) {
      this.log('❌ Error creating social media link:', error.message);
      return false;
    }
  }

  async testSocialMediaOrdering() {
    this.log('Testing Social Media Ordering Service Module');
    
    try {
      // Get all social media links
      const getResult = await this.makeRequest('GET', '/api/admin/social-media');
      
      if (getResult.status === 200 && getResult.data.length >= 2) {
        const links = getResult.data;
        const firstLink = links[0];
        
        // Test reordering using the extracted ordering service
        const orderedIds = links.map(link => link.id).reverse();
        const reorderResult = await this.makeRequest('POST', '/api/admin/social-media/reorder', {
          orderedIds
        });
        
        if (reorderResult.status === 200) {
          this.log('✓ Social media links reordered successfully using ordering service');
          
          // Test moving individual link
          const moveResult = await this.makeRequest('POST', `/api/admin/social-media/${firstLink.id}/move`, {
            direction: 'down'
          });
          
          if (moveResult.status === 200) {
            this.log('✓ Social media link moved successfully using ordering service');
            return true;
          }
        }
        
        this.log('❌ Failed social media ordering test', { reorderResult });
        return false;
      } else {
        this.log('ℹ️ Not enough social media links for ordering test');
        return true;
      }
    } catch (error) {
      this.log('❌ Error testing social media ordering:', error.message);
      return false;
    }
  }

  async testMenuItemBulkOperations() {
    this.log('Testing Menu Item Bulk Operations');
    
    try {
      // Test bulk toggle
      const toggleResult = await this.makeRequest('POST', '/api/admin/menu-items/bulk-toggle', {
        ids: this.testData.createdItems,
        isActive: false
      });
      
      if (toggleResult.status === 200) {
        this.log('✓ Menu items bulk toggle successful');
        return true;
      } else {
        this.log('❌ Failed menu items bulk toggle', toggleResult);
        return false;
      }
    } catch (error) {
      this.log('❌ Error testing menu item bulk operations:', error.message);
      return false;
    }
  }

  async testSocialMediaBulkOperations() {
    this.log('Testing Social Media Bulk Operations');
    
    try {
      // Test bulk toggle
      const toggleResult = await this.makeRequest('POST', '/api/admin/social-media/bulk-toggle', {
        ids: this.testData.createdLinks,
        isActive: false
      });
      
      if (toggleResult.status === 200) {
        this.log('✓ Social media links bulk toggle successful');
        return true;
      } else {
        this.log('❌ Failed social media links bulk toggle', toggleResult);
        return false;
      }
    } catch (error) {
      this.log('❌ Error testing social media bulk operations:', error.message);
      return false;
    }
  }

  async testToggleOperations() {
    this.log('Testing Individual Toggle Operations');
    
    try {
      let success = true;
      
      // Test menu item toggle
      for (const itemId of this.testData.createdItems) {
        const result = await this.makeRequest('POST', `/api/admin/menu-items/${itemId}/toggle`);
        if (result.status !== 200) {
          this.log(`❌ Failed to toggle menu item ${itemId}`);
          success = false;
        }
      }
      
      // Test social media link toggle
      for (const linkId of this.testData.createdLinks) {
        const result = await this.makeRequest('POST', `/api/admin/social-media/${linkId}/toggle`);
        if (result.status !== 200) {
          this.log(`❌ Failed to toggle social media link ${linkId}`);
          success = false;
        }
      }
      
      if (success) {
        this.log('✓ All toggle operations successful');
      }
      
      return success;
    } catch (error) {
      this.log('❌ Error testing toggle operations:', error.message);
      return false;
    }
  }

  async cleanup() {
    this.log('Cleaning up test data');
    
    try {
      // Delete created menu items
      for (const itemId of this.testData.createdItems) {
        await this.makeRequest('DELETE', `/api/admin/menu-items/${itemId}`);
      }
      
      // Delete created social media links
      for (const linkId of this.testData.createdLinks) {
        await this.makeRequest('DELETE', `/api/admin/social-media/${linkId}`);
      }
      
      this.log('✓ Cleanup completed');
    } catch (error) {
      this.log('❌ Error during cleanup:', error.message);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Menu and Social Media Services Test Suite');
    console.log('='.repeat(60));
    
    const results = [];
    
    // Test menu item operations
    results.push(await this.testMenuItemCreation());
    results.push(await this.testMenuItemOrdering());
    results.push(await this.testMenuItemBulkOperations());
    
    // Test social media operations with refactored ordering service
    results.push(await this.testSocialMediaLinkCreation());
    results.push(await this.testSocialMediaOrdering());
    results.push(await this.testSocialMediaBulkOperations());
    
    // Test toggle operations
    results.push(await this.testToggleOperations());
    
    // Cleanup
    await this.cleanup();
    
    // Results summary
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('='.repeat(60));
    this.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      this.log('🎉 All tests passed! Service refactoring successful');
    } else {
      this.log('⚠️ Some tests failed. Please review the results above');
    }
    
    return passed === total;
  }
}

async function runMenuSocialMediaTests() {
  const tester = new MenuSocialMediaServiceTester();
  return await tester.runAllTests();
}

// Run the tests
runMenuSocialMediaTests().catch(console.error);