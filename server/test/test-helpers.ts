import { db } from '../db';
import { users, businesses, categories, featuredRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { User, Business, Category } from '@shared/schema';

/**
 * Test data generation helpers for integration tests
 * Provides reusable functions to create consistent test data
 */

export interface TestUser extends User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface TestBusiness extends Business {
  placeid: string;
  title: string;
  ownerid: string;
  categoryId?: number;
}

export interface TestCategory extends Category {
  id: number;
  name: string;
  slug: string;
}

/**
 * Creates a test user with unique identifiers
 * Returns the complete user object including generated ID
 */
export async function createTestUser(
  overrides: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  }> = {}
): Promise<TestUser> {
  const timestamp = Date.now();
  const uniqueId = `test-user-${timestamp}-${Math.random().toString(36).substring(7)}`;
  
  const userData = {
    id: uniqueId,
    email: overrides.email || `testuser-${timestamp}@example.com`,
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    profileImageUrl: overrides.profileImageUrl || null
  };

  const [createdUser] = await db.insert(users).values(userData).returning();
  
  return createdUser as TestUser;
}

/**
 * Creates a test category with unique identifiers
 * Returns the complete category object including generated ID
 */
export async function createTestCategory(
  overrides: Partial<{
    name: string;
    slug: string;
    description: string;
  }> = {}
): Promise<TestCategory> {
  const timestamp = Date.now();
  const uniqueSuffix = Math.random().toString(36).substring(7);
  
  const categoryData = {
    name: overrides.name || `Test Category ${timestamp}`,
    slug: overrides.slug || `test-category-${timestamp}-${uniqueSuffix}`,
    description: overrides.description || `Test category created at ${new Date().toISOString()}`,
    icon: 'building-2',
    color: '#3B82F6'
  };

  const [createdCategory] = await db.insert(categories).values(categoryData).returning();
  
  return createdCategory as TestCategory;
}

/**
 * Creates a test business owned by the specified user
 * Requires a valid ownerId (user must exist in database)
 * Returns the complete business object including generated placeid
 */
export async function createTestBusiness(
  ownerId: string,
  categoryId?: number,
  overrides: Partial<{
    title: string;
    slug: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    phone: string;
    status: string;
    description: string;
  }> = {}
): Promise<TestBusiness> {
  const timestamp = Date.now();
  const uniqueSuffix = Math.random().toString(36).substring(7);
  
  // If no categoryId provided, create a test category
  let testCategoryId = categoryId;
  if (!testCategoryId) {
    const testCategory = await createTestCategory();
    testCategoryId = testCategory.id;
  }

  const businessData = {
    placeid: `test-business-${timestamp}-${uniqueSuffix}`,
    title: overrides.title || `Test Business ${timestamp}`,
    slug: overrides.slug || `test-business-${timestamp}-${uniqueSuffix}`,
    address: overrides.address || `${timestamp} Test Street`,
    city: overrides.city || 'Test City',
    state: overrides.state || 'TS',
    postalcode: overrides.zipcode || '12345',
    phone: overrides.phone || '555-0123',
    ownerid: ownerId,
    description: overrides.description || `Test business created for integration testing at ${new Date().toISOString()}`
  };

  const [createdBusiness] = await db.insert(businesses).values(businessData).returning();
  
  return createdBusiness as TestBusiness;
}

/**
 * Creates a complete test setup with user, category, and business
 * Returns all created objects for use in tests
 */
export async function createTestSetup(
  userOverrides: Parameters<typeof createTestUser>[0] = {},
  categoryOverrides: Parameters<typeof createTestCategory>[0] = {},
  businessOverrides: Parameters<typeof createTestBusiness>[2] = {}
): Promise<{
  user: TestUser;
  category: TestCategory;
  business: TestBusiness;
}> {
  const user = await createTestUser(userOverrides);
  const category = await createTestCategory(categoryOverrides);
  const business = await createTestBusiness(user.id, category.id, businessOverrides);

  return { user, category, business };
}

/**
 * Cleanup function to remove test data in correct dependency order
 * Pass the objects returned from create functions
 */
export async function cleanupTestData(data: {
  user?: TestUser;
  category?: TestCategory;
  business?: TestBusiness;
  featuredRequestIds?: number[];
}) {
  try {
    // Clean up featured requests first (no dependencies)
    if (data.featuredRequestIds && data.featuredRequestIds.length > 0) {
      for (const requestId of data.featuredRequestIds) {
        await db.delete(featuredRequests).where(eq(featuredRequests.id, requestId));
      }
    }

    // Clean up business (depends on user and category)
    if (data.business) {
      await db.delete(featuredRequests).where(eq(featuredRequests.businessId, data.business.placeid));
      await db.delete(businesses).where(eq(businesses.placeid, data.business.placeid));
    }

    // Clean up user (no dependencies on it)
    if (data.user) {
      await db.delete(users).where(eq(users.id, data.user.id));
    }

    // Clean up category last (business depends on it)
    if (data.category) {
      await db.delete(categories).where(eq(categories.id, data.category.id));
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    // Don't throw - cleanup should be best-effort
  }
}

/**
 * Validates that test objects were created correctly
 * Useful for debugging test setup issues
 */
export async function validateTestSetup(data: {
  user?: TestUser;
  business?: TestBusiness;
  category?: TestCategory;
}): Promise<{
  userExists: boolean;
  businessExists: boolean;
  categoryExists: boolean;
  businessOwnershipValid: boolean;
}> {
  const results = {
    userExists: false,
    businessExists: false,
    categoryExists: false,
    businessOwnershipValid: false
  };

  try {
    if (data.user) {
      const [foundUser] = await db.select().from(users).where(eq(users.id, data.user.id));
      results.userExists = !!foundUser;
    }

    if (data.category) {
      const [foundCategory] = await db.select().from(categories).where(eq(categories.id, data.category.id));
      results.categoryExists = !!foundCategory;
    }

    if (data.business) {
      const [foundBusiness] = await db.select().from(businesses).where(eq(businesses.placeid, data.business.placeid));
      results.businessExists = !!foundBusiness;
      
      if (foundBusiness && data.user) {
        results.businessOwnershipValid = foundBusiness.ownerid === data.user.id;
      }
    }
  } catch (error) {
    console.error('Validation error:', error);
  }

  return results;
}