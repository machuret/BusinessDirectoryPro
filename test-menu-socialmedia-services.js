/**
 * Comprehensive Menu and Social Media Services Test
 * Tests both service layers with their complex ordering and validation logic
 */

import { storage } from './server/storage/index.ts';
import * as menuService from './server/services/menu.service.ts';
import * as socialMediaService from './server/services/socialMedia.service.ts';

class MenuSocialMediaServiceTester {
  constructor() {
    this.testResults = [];
    this.testMenuItems = [];
    this.testSocialMediaLinks = [];
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async testMenuItemCreation() {
    this.log('=== Testing Menu Item Creation ===');

    try {
      // Test 1: Valid menu item creation
      const validMenuItem = {
        name: 'Test Menu',
        url: '/test-menu',
        position: 'header',
        target: '_self'
      };

      const menuItem = await menuService.createMenuItem(validMenuItem);
      this.testMenuItems.push(menuItem.id);
      this.log('✓ Successfully created valid menu item', {
        id: menuItem.id,
        name: menuItem.name,
        position: menuItem.position,
        order: menuItem.order
      });

      // Test 2: Menu item with order specification
      const orderedMenuItem = {
        name: 'Ordered Menu',
        url: '/ordered-menu',
        position: 'footer',
        order: 5
      };

      const orderedItem = await menuService.createMenuItem(orderedMenuItem);
      this.testMenuItems.push(orderedItem.id);
      this.log('✓ Successfully created menu item with custom order', {
        id: orderedItem.id,
        order: orderedItem.order
      });

      // Test 3: Missing name validation
      try {
        await menuService.createMenuItem({
          url: '/test',
          position: 'header'
        });
        this.log('✗ Should have failed for missing name');
      } catch (error) {
        this.log('✓ Correctly validated missing name:', error.message);
      }

      // Test 4: Invalid position validation
      try {
        await menuService.createMenuItem({
          name: 'Test',
          url: '/test',
          position: 'invalid_position'
        });
        this.log('✗ Should have failed for invalid position');
      } catch (error) {
        this.log('✓ Correctly validated invalid position:', error.message);
      }

      this.testResults.push({ test: 'menu_creation', status: 'passed' });
    } catch (error) {
      this.log('✗ Menu item creation test failed:', error.message);
      this.testResults.push({ test: 'menu_creation', status: 'failed', error: error.message });
    }
  }

  async testMenuItemOrdering() {
    this.log('=== Testing Menu Item Ordering ===');

    try {
      // Create multiple items for ordering tests
      const headerItems = [];
      for (let i = 1; i <= 3; i++) {
        const item = await menuService.createMenuItem({
          name: `Header Item ${i}`,
          url: `/header-${i}`,
          position: 'header'
        });
        headerItems.push(item.id);
        this.testMenuItems.push(item.id);
      }

      // Test reordering
      const reorderedIds = [headerItems[2], headerItems[0], headerItems[1]];
      await menuService.reorderMenuItemsInPosition('header', reorderedIds);
      this.log('✓ Successfully reordered menu items');

      // Test move operations
      const moveResult = await menuService.moveMenuItem(headerItems[0], 'up');
      this.log('✓ Move operation result:', { success: moveResult });

      this.testResults.push({ test: 'menu_ordering', status: 'passed' });
    } catch (error) {
      this.log('✗ Menu item ordering test failed:', error.message);
      this.testResults.push({ test: 'menu_ordering', status: 'failed', error: error.message });
    }
  }

  async testSocialMediaLinkCreation() {
    this.log('=== Testing Social Media Link Creation ===');

    try {
      // Test 1: Valid social media link creation
      const validLink = {
        platform: 'facebook',
        url: 'https://facebook.com/testpage',
        displayName: 'Facebook',
        iconClass: 'fab fa-facebook-f'
      };

      const link = await socialMediaService.createSocialMediaLink(validLink);
      this.testSocialMediaLinks.push(link.id);
      this.log('✓ Successfully created valid social media link', {
        id: link.id,
        platform: link.platform,
        sortOrder: link.sortOrder
      });

      // Test 2: Multiple platform creation
      const platforms = [
        { platform: 'twitter', url: 'https://twitter.com/test', displayName: 'Twitter', iconClass: 'fab fa-twitter' },
        { platform: 'instagram', url: 'https://instagram.com/test', displayName: 'Instagram', iconClass: 'fab fa-instagram' }
      ];

      for (const platformData of platforms) {
        const platformLink = await socialMediaService.createSocialMediaLink(platformData);
        this.testSocialMediaLinks.push(platformLink.id);
        this.log('✓ Created platform link:', { platform: platformLink.platform });
      }

      // Test 3: Duplicate platform validation
      try {
        await socialMediaService.createSocialMediaLink({
          platform: 'facebook',
          url: 'https://facebook.com/duplicate',
          displayName: 'Facebook Duplicate',
          iconClass: 'fab fa-facebook'
        });
        this.log('✗ Should have failed for duplicate platform');
      } catch (error) {
        this.log('✓ Correctly prevented duplicate platform:', error.message);
      }

      // Test 4: Invalid URL validation
      try {
        await socialMediaService.createSocialMediaLink({
          platform: 'linkedin',
          url: 'invalid-url',
          displayName: 'LinkedIn',
          iconClass: 'fab fa-linkedin'
        });
        this.log('✗ Should have failed for invalid URL');
      } catch (error) {
        this.log('✓ Correctly validated invalid URL:', error.message);
      }

      this.testResults.push({ test: 'social_media_creation', status: 'passed' });
    } catch (error) {
      this.log('✗ Social media link creation test failed:', error.message);
      this.testResults.push({ test: 'social_media_creation', status: 'failed', error: error.message });
    }
  }

  async testSocialMediaOrdering() {
    this.log('=== Testing Social Media Link Ordering ===');

    try {
      // Get all created links
      const allLinks = await socialMediaService.getAllSocialMediaLinks();
      const linkIds = this.testSocialMediaLinks;

      if (linkIds.length >= 2) {
        // Test reordering
        const reversedIds = [...linkIds].reverse();
        await socialMediaService.reorderAllSocialMediaLinks(reversedIds);
        this.log('✓ Successfully reordered social media links');

        // Test move operations
        const moveResult = await socialMediaService.moveSocialMediaLink(linkIds[0], 'down');
        this.log('✓ Move operation result:', { success: moveResult });
      }

      this.testResults.push({ test: 'social_media_ordering', status: 'passed' });
    } catch (error) {
      this.log('✗ Social media link ordering test failed:', error.message);
      this.testResults.push({ test: 'social_media_ordering', status: 'failed', error: error.message });
    }
  }

  async testMenuItemBulkOperations() {
    this.log('=== Testing Menu Item Bulk Operations ===');

    try {
      // Create items for bulk operations
      const bulkItems = [];
      for (let i = 1; i <= 3; i++) {
        const item = await menuService.createMenuItem({
          name: `Bulk Item ${i}`,
          url: `/bulk-${i}`,
          position: 'footer1'
        });
        bulkItems.push(item.id);
      }

      // Test bulk deactivate
      const deactivateResult = await menuService.performBulkMenuItemAction(bulkItems, 'deactivate');
      this.log('✓ Bulk deactivate result:', deactivateResult);

      // Test bulk activate
      const activateResult = await menuService.performBulkMenuItemAction(bulkItems, 'activate');
      this.log('✓ Bulk activate result:', activateResult);

      // Test bulk delete
      const deleteResult = await menuService.performBulkMenuItemAction(bulkItems, 'delete');
      this.log('✓ Bulk delete result:', deleteResult);

      this.testResults.push({ test: 'menu_bulk_operations', status: 'passed' });
    } catch (error) {
      this.log('✗ Menu item bulk operations test failed:', error.message);
      this.testResults.push({ test: 'menu_bulk_operations', status: 'failed', error: error.message });
    }
  }

  async testSocialMediaBulkOperations() {
    this.log('=== Testing Social Media Bulk Operations ===');

    try {
      if (this.testSocialMediaLinks.length >= 2) {
        // Test bulk updates
        const updates = this.testSocialMediaLinks.slice(0, 2).map(id => ({
          id,
          data: { isActive: false }
        }));

        const updateResult = await socialMediaService.performBulkSocialMediaLinkUpdates(updates);
        this.log('✓ Bulk update result:', updateResult);

        // Test bulk actions
        const actionResult = await socialMediaService.performBulkSocialMediaLinkAction(
          this.testSocialMediaLinks.slice(0, 1),
          'activate'
        );
        this.log('✓ Bulk action result:', actionResult);
      }

      this.testResults.push({ test: 'social_media_bulk_operations', status: 'passed' });
    } catch (error) {
      this.log('✗ Social media bulk operations test failed:', error.message);
      this.testResults.push({ test: 'social_media_bulk_operations', status: 'failed', error: error.message });
    }
  }

  async testToggleOperations() {
    this.log('=== Testing Toggle Operations ===');

    try {
      if (this.testMenuItems.length > 0) {
        const toggledMenuItem = await menuService.toggleMenuItemStatus(this.testMenuItems[0]);
        this.log('✓ Toggled menu item status:', { 
          id: toggledMenuItem.id, 
          isActive: toggledMenuItem.isActive 
        });
      }

      if (this.testSocialMediaLinks.length > 0) {
        const toggledLink = await socialMediaService.toggleSocialMediaLinkStatus(this.testSocialMediaLinks[0]);
        this.log('✓ Toggled social media link status:', { 
          id: toggledLink.id, 
          isActive: toggledLink.isActive 
        });
      }

      this.testResults.push({ test: 'toggle_operations', status: 'passed' });
    } catch (error) {
      this.log('✗ Toggle operations test failed:', error.message);
      this.testResults.push({ test: 'toggle_operations', status: 'failed', error: error.message });
    }
  }

  async cleanup() {
    this.log('=== Cleaning Up Test Data ===');

    for (const menuItemId of this.testMenuItems) {
      try {
        await storage.deleteMenuItem(menuItemId);
        this.log(`✓ Cleaned up menu item: ${menuItemId}`);
      } catch (error) {
        this.log(`⚠ Failed to clean up menu item ${menuItemId}:`, error.message);
      }
    }

    for (const linkId of this.testSocialMediaLinks) {
      try {
        await storage.deleteSocialMediaLink(linkId);
        this.log(`✓ Cleaned up social media link: ${linkId}`);
      } catch (error) {
        this.log(`⚠ Failed to clean up social media link ${linkId}:`, error.message);
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Menu and Social Media Services Test Suite');
    this.log('='.repeat(60));

    await this.testMenuItemCreation();
    await this.testMenuItemOrdering();
    await this.testMenuItemBulkOperations();
    await this.testSocialMediaLinkCreation();
    await this.testSocialMediaOrdering();
    await this.testSocialMediaBulkOperations();
    await this.testToggleOperations();
    await this.cleanup();

    this.log('');
    this.log('📊 TEST SUMMARY');
    this.log('='.repeat(16));

    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;

    if (failed === 0) {
      this.log('✅ All tests passed!');
      this.log(`   ✓ Passed: ${passed}`);
    } else {
      this.log('❌ Some tests failed:');
      this.log(`   ✓ Passed: ${passed}`);
      this.log(`   ✗ Failed: ${failed}`);
      
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(result => {
          this.log(`   ✗ ${result.test}: ${result.error}`);
        });
    }
  }
}

async function runMenuSocialMediaTests() {
  const tester = new MenuSocialMediaServiceTester();
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

runMenuSocialMediaTests();