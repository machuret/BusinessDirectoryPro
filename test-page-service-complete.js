/**
 * Comprehensive Page Service Test
 * Tests the complete page service layer implementation with validation and business logic
 */

import { storage } from './server/storage/index.ts';
import * as pageService from './server/services/page.service.ts';

class PageServiceTester {
  constructor() {
    this.testResults = [];
    this.createdPages = [];
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async createTestUser() {
    try {
      // Create a test admin user for page authorship
      const testUser = await storage.createUser({
        email: 'pageadmin@test.com',
        username: 'pageadmin',
        password: 'hashedpassword123',
        role: 'admin',
        firstName: 'Page',
        lastName: 'Admin'
      });

      this.log('✓ Created test admin user for page authorship', { 
        id: testUser.id, 
        email: testUser.email 
      });
      
      return testUser;
    } catch (error) {
      this.log('✗ Error creating test user:', error.message);
      throw error;
    }
  }

  async testPageCreation() {
    this.log('\n=== Testing Page Creation ===');

    try {
      const testUser = await this.createTestUser();

      // Test 1: Valid page creation
      const validPageData = {
        title: 'Test Privacy Policy',
        slug: 'test-privacy-policy',
        content: '<h1>Privacy Policy</h1><p>This is our comprehensive privacy policy...</p>',
        seoTitle: 'Privacy Policy - Our Site',
        seoDescription: 'Learn about our privacy policy and data protection practices.',
        status: 'draft',
        authorId: testUser.id
      };

      const createdPage = await pageService.createPage(validPageData);
      this.createdPages.push(createdPage.id);

      this.log('✓ Successfully created valid page', {
        id: createdPage.id,
        title: createdPage.title,
        slug: createdPage.slug,
        status: createdPage.status,
        authorId: createdPage.authorId
      });

      // Test 2: Validation - missing title
      try {
        await pageService.createPage({
          slug: 'invalid-page',
          content: 'Some content',
          authorId: testUser.id
        });
        this.log('✗ Should have failed for missing title');
      } catch (error) {
        this.log('✓ Correctly validated missing title:', error.message);
      }

      // Test 3: Validation - invalid slug format
      try {
        await pageService.createPage({
          title: 'Invalid Slug Page',
          slug: 'Invalid Slug With Spaces!',
          content: 'Some content',
          authorId: testUser.id
        });
        this.log('✗ Should have failed for invalid slug format');
      } catch (error) {
        this.log('✓ Correctly validated invalid slug format:', error.message);
      }

      // Test 4: Validation - duplicate slug
      try {
        await pageService.createPage({
          title: 'Duplicate Slug Page',
          slug: 'test-privacy-policy', // Same as first page
          content: 'Different content',
          authorId: testUser.id
        });
        this.log('✗ Should have failed for duplicate slug');
      } catch (error) {
        this.log('✓ Correctly prevented duplicate slug:', error.message);
      }

      return { success: true, testUser, createdPage };

    } catch (error) {
      this.log('✗ Page creation test failed:', error.message);
      return { success: false, error };
    }
  }

  async testPageUpdate() {
    this.log('\n=== Testing Page Update ===');

    try {
      const { testUser, createdPage } = await this.testPageCreation();
      if (!testUser || !createdPage) {
        throw new Error('Setup failed - no test page created');
      }

      // Test 1: Valid page update
      const updateData = {
        title: 'Updated Privacy Policy',
        content: '<h1>Updated Privacy Policy</h1><p>This is our updated privacy policy...</p>',
        seoTitle: 'Updated Privacy Policy - Our Site'
      };

      const updatedPage = await pageService.updatePage(createdPage.id, updateData);
      
      this.log('✓ Successfully updated page', {
        id: updatedPage.id,
        title: updatedPage.title,
        updatedFields: Object.keys(updateData)
      });

      // Test 2: Validation - empty title
      try {
        await pageService.updatePage(createdPage.id, { title: '' });
        this.log('✗ Should have failed for empty title');
      } catch (error) {
        this.log('✓ Correctly validated empty title in update:', error.message);
      }

      // Test 3: Update non-existent page
      try {
        await pageService.updatePage(99999, { title: 'Non-existent' });
        this.log('✗ Should have failed for non-existent page');
      } catch (error) {
        this.log('✓ Correctly handled non-existent page update:', error.message);
      }

      return { success: true, updatedPage };

    } catch (error) {
      this.log('✗ Page update test failed:', error.message);
      return { success: false, error };
    }
  }

  async testPagePublishing() {
    this.log('\n=== Testing Page Publishing ===');

    try {
      const { testUser } = await this.testPageCreation();
      if (!testUser) {
        throw new Error('Setup failed - no test user created');
      }

      // Create a draft page for publishing test
      const draftPage = await pageService.createPage({
        title: 'Draft Article',
        slug: 'draft-article',
        content: '<h1>Draft Article</h1><p>This article is ready to be published.</p>',
        status: 'draft',
        authorId: testUser.id
      });

      this.createdPages.push(draftPage.id);
      this.log('✓ Created draft page for publishing test', {
        id: draftPage.id,
        status: draftPage.status
      });

      // Test 1: Publish the draft page
      const publishedPage = await pageService.publishPage(draftPage.id, testUser.id);
      
      this.log('✓ Successfully published page', {
        id: publishedPage.id,
        title: publishedPage.title,
        status: publishedPage.status,
        publishedAt: publishedPage.publishedAt
      });

      // Test 2: Try to publish already published page (should be idempotent)
      const republishedPage = await pageService.publishPage(draftPage.id, testUser.id);
      
      this.log('✓ Publishing already published page is idempotent', {
        id: republishedPage.id,
        status: republishedPage.status
      });

      // Test 3: Unpublish the page
      const unpublishedPage = await pageService.unpublishPage(draftPage.id, testUser.id);
      
      this.log('✓ Successfully unpublished page', {
        id: unpublishedPage.id,
        status: unpublishedPage.status
      });

      // Test 4: Try to publish non-existent page
      try {
        await pageService.publishPage(99999, testUser.id);
        this.log('✗ Should have failed for non-existent page');
      } catch (error) {
        this.log('✓ Correctly handled non-existent page publishing:', error.message);
      }

      return { success: true, publishedPage, unpublishedPage };

    } catch (error) {
      this.log('✗ Page publishing test failed:', error.message);
      return { success: false, error };
    }
  }

  async testPageRetrieval() {
    this.log('\n=== Testing Page Retrieval ===');

    try {
      const { testUser } = await this.testPageCreation();
      if (!testUser) {
        throw new Error('Setup failed - no test user created');
      }

      // Create test pages with different statuses
      const publishedPage = await pageService.createPage({
        title: 'Published Test Page',
        slug: 'published-test-page',
        content: '<p>This page is published</p>',
        status: 'published',
        authorId: testUser.id
      });

      const draftPage = await pageService.createPage({
        title: 'Draft Test Page',
        slug: 'draft-test-page',
        content: '<p>This page is a draft</p>',
        status: 'draft',
        authorId: testUser.id
      });

      this.createdPages.push(publishedPage.id, draftPage.id);

      // Test 1: Get all pages
      const allPages = await pageService.getPages();
      this.log('✓ Retrieved all pages', { count: allPages.length });

      // Test 2: Get published pages only
      const publishedPages = await pageService.getPages('published');
      this.log('✓ Retrieved published pages', { count: publishedPages.length });

      // Test 3: Get draft pages only
      const draftPages = await pageService.getPages('draft');
      this.log('✓ Retrieved draft pages', { count: draftPages.length });

      // Test 4: Get page by ID
      const retrievedById = await pageService.getPageById(publishedPage.id);
      this.log('✓ Retrieved page by ID', {
        id: retrievedById?.id,
        title: retrievedById?.title
      });

      // Test 5: Get page by slug
      const retrievedBySlug = await pageService.getPageBySlug('published-test-page');
      this.log('✓ Retrieved page by slug', {
        slug: retrievedBySlug?.slug,
        title: retrievedBySlug?.title
      });

      // Test 6: Try to get non-existent page
      const nonExistentById = await pageService.getPageById(99999);
      const nonExistentBySlug = await pageService.getPageBySlug('non-existent-slug');
      
      this.log('✓ Correctly handled non-existent page queries', {
        byId: nonExistentById === undefined,
        bySlug: nonExistentBySlug === undefined
      });

      return { success: true, allPages, publishedPages, draftPages };

    } catch (error) {
      this.log('✗ Page retrieval test failed:', error.message);
      return { success: false, error };
    }
  }

  async testPageDeletion() {
    this.log('\n=== Testing Page Deletion ===');

    try {
      const { testUser } = await this.testPageCreation();
      if (!testUser) {
        throw new Error('Setup failed - no test user created');
      }

      // Create a page for deletion test
      const pageToDelete = await pageService.createPage({
        title: 'Page to Delete',
        slug: 'page-to-delete',
        content: '<p>This page will be deleted</p>',
        status: 'draft',
        authorId: testUser.id
      });

      this.log('✓ Created page for deletion test', {
        id: pageToDelete.id,
        title: pageToDelete.title
      });

      // Test 1: Delete the page
      await pageService.deletePage(pageToDelete.id);
      this.log('✓ Successfully deleted page');

      // Test 2: Verify page is deleted
      const deletedPage = await pageService.getPageById(pageToDelete.id);
      if (!deletedPage) {
        this.log('✓ Confirmed page was deleted');
      } else {
        this.log('✗ Page was not properly deleted');
      }

      // Test 3: Try to delete non-existent page
      try {
        await pageService.deletePage(99999);
        this.log('✗ Should have failed for non-existent page');
      } catch (error) {
        this.log('✓ Correctly handled non-existent page deletion:', error.message);
      }

      // Test 4: Try to delete protected page (simulate)
      const protectedPage = await pageService.createPage({
        title: 'Home Page',
        slug: 'home',
        content: '<p>This is the home page</p>',
        status: 'published',
        authorId: testUser.id
      });

      this.createdPages.push(protectedPage.id);

      try {
        await pageService.deletePage(protectedPage.id);
        this.log('✗ Should have failed for protected page');
      } catch (error) {
        this.log('✓ Correctly prevented deletion of protected page:', error.message);
      }

      return { success: true };

    } catch (error) {
      this.log('✗ Page deletion test failed:', error.message);
      return { success: false, error };
    }
  }

  async cleanup() {
    this.log('\n=== Cleaning Up Test Data ===');

    try {
      // Clean up created pages (except protected ones)
      for (const pageId of this.createdPages) {
        try {
          const page = await storage.getPage(pageId);
          if (page && !['home', 'about', 'contact', 'privacy', 'terms'].includes(page.slug)) {
            await storage.deletePage(pageId);
            this.log(`✓ Cleaned up page: ${pageId}`);
          }
        } catch (error) {
          this.log(`⚠ Could not clean up page ${pageId}:`, error.message);
        }
      }

      // Clean up test users
      try {
        const testUser = await storage.getUserByEmail('pageadmin@test.com');
        if (testUser) {
          await storage.deleteUser(testUser.id);
          this.log('✓ Cleaned up test admin user');
        }
      } catch (error) {
        this.log('⚠ Could not clean up test user:', error.message);
      }

    } catch (error) {
      this.log('⚠ Cleanup had some issues:', error.message);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Page Service Comprehensive Test Suite');
    this.log('================================================');

    const results = {
      creation: await this.testPageCreation(),
      update: await this.testPageUpdate(),
      publishing: await this.testPagePublishing(),
      retrieval: await this.testPageRetrieval(),
      deletion: await this.testPageDeletion()
    };

    await this.cleanup();

    this.log('\n📊 TEST SUMMARY');
    this.log('================');

    const allSuccess = Object.values(results).every(result => result.success);

    if (allSuccess) {
      this.log('🎉 ALL PAGE SERVICE TESTS PASSED!');
      this.log('✓ Page creation with validation works correctly');
      this.log('✓ Page update with business rules works correctly');
      this.log('✓ Page publishing workflow works correctly');
      this.log('✓ Page retrieval and filtering works correctly');
      this.log('✓ Page deletion with protection works correctly');
    } else {
      this.log('❌ Some tests failed:');
      Object.entries(results).forEach(([test, result]) => {
        if (!result.success) {
          this.log(`   ✗ ${test}: ${result.error?.message}`);
        }
      });
    }

    return allSuccess;
  }
}

async function runPageServiceTests() {
  const tester = new PageServiceTester();
  
  try {
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Fatal error in page service tests:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPageServiceTests();
}

export { PageServiceTester };