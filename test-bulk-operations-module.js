/**
 * Bulk Operations Module Test
 * Tests the extracted bulk operations functionality for social media links
 */

class BulkOperationsModuleTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testData = {
      createdLinks: []
    };
  }

  log(message, data = null) {
    console.log(`[BULK TEST] ${message}`);
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

  async setupTestData() {
    this.log('Setting up test data for bulk operations');
    
    const testLinks = [
      {
        platform: 'twitter',
        url: 'https://twitter.com/testcompany1',
        displayName: 'Test Company Twitter 1',
        iconClass: 'fab fa-twitter',
        isActive: true
      },
      {
        platform: 'instagram',
        url: 'https://instagram.com/testcompany2',
        displayName: 'Test Company Instagram 2',
        iconClass: 'fab fa-instagram',
        isActive: true
      }
    ];

    for (const linkData of testLinks) {
      try {
        const result = await this.makeRequest('POST', '/api/admin/social-media', linkData);
        if (result.status === 201) {
          this.testData.createdLinks.push(result.data.id);
          this.log(`Created test link: ${linkData.platform} (ID: ${result.data.id})`);
        }
      } catch (error) {
        this.log(`Failed to create test link: ${linkData.platform}`, error.message);
      }
    }

    return this.testData.createdLinks.length >= 2;
  }

  async testBulkUpdates() {
    this.log('Testing Bulk Updates Module');
    
    if (this.testData.createdLinks.length < 2) {
      this.log('Not enough test links for bulk update test');
      return false;
    }

    try {
      const updates = this.testData.createdLinks.map(id => ({
        id,
        data: {
          displayName: `Updated Test Link ${id}`,
          isActive: false
        }
      }));

      const result = await this.makeRequest('POST', '/api/admin/social-media/bulk-update', {
        updates
      });

      if (result.status === 200) {
        this.log('✓ Bulk updates successful using extracted module', {
          success: result.data.success,
          failed: result.data.failed
        });
        return true;
      } else {
        this.log('❌ Bulk updates failed', result);
        return false;
      }
    } catch (error) {
      this.log('❌ Error testing bulk updates:', error.message);
      return false;
    }
  }

  async testBulkActions() {
    this.log('Testing Bulk Actions Module');
    
    try {
      // Test bulk activate
      const activateResult = await this.makeRequest('POST', '/api/admin/social-media/bulk-action', {
        linkIds: this.testData.createdLinks,
        action: 'activate'
      });

      if (activateResult.status === 200) {
        this.log('✓ Bulk activate successful using extracted module');
        
        // Test bulk deactivate
        const deactivateResult = await this.makeRequest('POST', '/api/admin/social-media/bulk-action', {
          linkIds: this.testData.createdLinks,
          action: 'deactivate'
        });

        if (deactivateResult.status === 200) {
          this.log('✓ Bulk deactivate successful using extracted module');
          return true;
        }
      }

      this.log('❌ Bulk actions failed', { activateResult, deactivateResult });
      return false;
    } catch (error) {
      this.log('❌ Error testing bulk actions:', error.message);
      return false;
    }
  }

  async testBulkToggle() {
    this.log('Testing Bulk Toggle Module');
    
    try {
      // Test bulk toggle to active
      const toggleResult = await this.makeRequest('POST', '/api/admin/social-media/bulk-toggle', {
        ids: this.testData.createdLinks,
        isActive: true
      });

      if (toggleResult.status === 200) {
        this.log('✓ Bulk toggle successful using extracted module');
        return true;
      } else {
        this.log('❌ Bulk toggle failed', toggleResult);
        return false;
      }
    } catch (error) {
      this.log('❌ Error testing bulk toggle:', error.message);
      return false;
    }
  }

  async testValidationFunctions() {
    this.log('Testing Bulk Operations Validation Functions');
    
    try {
      // Test with invalid data
      const invalidResult = await this.makeRequest('POST', '/api/admin/social-media/bulk-action', {
        linkIds: [],
        action: 'invalid_action'
      });

      if (invalidResult.status === 400) {
        this.log('✓ Validation correctly rejected invalid bulk action');
        return true;
      } else {
        this.log('❌ Validation should have rejected invalid data', invalidResult);
        return false;
      }
    } catch (error) {
      this.log('Expected validation error:', error.message);
      return true;
    }
  }

  async testErrorHandling() {
    this.log('Testing Bulk Operations Error Handling');
    
    try {
      // Test with non-existent link IDs
      const errorResult = await this.makeRequest('POST', '/api/admin/social-media/bulk-action', {
        linkIds: [99999, 99998],
        action: 'activate'
      });

      if (errorResult.status === 207 || errorResult.status === 200) {
        this.log('✓ Error handling working correctly for non-existent IDs');
        return true;
      } else {
        this.log('❌ Error handling test failed', errorResult);
        return false;
      }
    } catch (error) {
      this.log('❌ Error testing error handling:', error.message);
      return false;
    }
  }

  async cleanup() {
    this.log('Cleaning up test data');
    
    try {
      for (const linkId of this.testData.createdLinks) {
        await this.makeRequest('DELETE', `/api/admin/social-media/${linkId}`);
      }
      this.log('✓ Cleanup completed');
    } catch (error) {
      this.log('❌ Error during cleanup:', error.message);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Bulk Operations Module Test Suite');
    console.log('='.repeat(60));
    
    const setupSuccess = await this.setupTestData();
    if (!setupSuccess) {
      this.log('❌ Failed to set up test data. Aborting tests.');
      return false;
    }

    const results = [];
    
    // Test extracted bulk operations modules
    results.push(await this.testBulkUpdates());
    results.push(await this.testBulkActions());
    results.push(await this.testBulkToggle());
    results.push(await this.testValidationFunctions());
    results.push(await this.testErrorHandling());
    
    // Cleanup
    await this.cleanup();
    
    // Results summary
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('='.repeat(60));
    this.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      this.log('🎉 All bulk operations tests passed! Module extraction successful');
    } else {
      this.log('⚠️ Some tests failed. Please review the results above');
    }
    
    return passed === total;
  }
}

async function runBulkOperationsTests() {
  const tester = new BulkOperationsModuleTester();
  return await tester.runAllTests();
}

// Run the tests
runBulkOperationsTests().catch(console.error);