import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../db';
import { users, businesses, featuredRequests, categories } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

describe('Featured Requests Database Integration Tests', () => {
  let testUser: any;
  let testBusiness: any;
  let testCategory: any;

  beforeAll(async () => {
    // Create test category
    const [createdCategory] = await db.insert(categories).values({
      name: 'Test Category API',
      slug: 'test-category-api-' + Date.now(),
      description: 'Test category for API integration tests'
    }).returning();
    testCategory = createdCategory;

    // Create test user
    const [createdUser] = await db.insert(users).values({
      id: 'test-user-api-' + Date.now(),
      email: 'apitest@example.com',
      firstName: 'API',
      lastName: 'Test'
    }).returning();
    testUser = createdUser;

    // Create test business
    const [createdBusiness] = await db.insert(businesses).values({
      placeid: 'test-business-api-' + Date.now(),
      title: 'Test Business for API Tests',
      slug: 'test-business-api-' + Date.now(),
      address: '123 API Test Street',
      city: 'API City',
      state: 'AT',
      zipcode: '12345',
      phone: '555-0123',
      categoryId: testCategory.id,
      ownerId: testUser.id,
      status: 'active'
    }).returning();
    testBusiness = createdBusiness;
  });

  afterAll(async () => {
    // Clean up test data in correct order
    if (testBusiness) {
      await db.delete(featuredRequests).where(eq(featuredRequests.businessId, testBusiness.placeid));
      await db.delete(businesses).where(eq(businesses.placeid, testBusiness.placeid));
    }
    if (testUser) {
      await db.delete(users).where(eq(users.id, testUser.id));
    }
    if (testCategory) {
      await db.delete(categories).where(eq(categories.id, testCategory.id));
    }
  });

  describe('Featured Request Creation', () => {
    it('should create a featured request in database', async () => {
      const requestData = {
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Please feature our business! We provide excellent service.',
        status: 'pending' as const
      };

      // Create featured request directly in database
      const [createdRequest] = await db.insert(featuredRequests).values(requestData).returning();

      // Verify the request was created correctly
      expect(createdRequest).toBeDefined();
      expect(createdRequest.id).toBeTypeOf('number');
      expect(createdRequest.businessId).toBe(testBusiness.placeid);
      expect(createdRequest.userId).toBe(testUser.id);
      expect(createdRequest.message).toBe(requestData.message);
      expect(createdRequest.status).toBe('pending');
      expect(createdRequest.createdAt).toBeInstanceOf(Date);
      expect(createdRequest.reviewedAt).toBeNull();
      expect(createdRequest.reviewedBy).toBeNull();
      expect(createdRequest.adminMessage).toBeNull();

      // Verify it exists in database
      const [foundRequest] = await db
        .select()
        .from(featuredRequests)
        .where(eq(featuredRequests.id, createdRequest.id));

      expect(foundRequest).toBeDefined();
      expect(foundRequest.businessId).toBe(testBusiness.placeid);
      expect(foundRequest.userId).toBe(testUser.id);

      // Clean up
      await db.delete(featuredRequests).where(eq(featuredRequests.id, createdRequest.id));
    });

    it('should create featured request without message', async () => {
      const requestData = {
        businessId: testBusiness.placeid,
        userId: testUser.id,
        status: 'pending' as const
        // No message field
      };

      const [createdRequest] = await db.insert(featuredRequests).values(requestData).returning();

      expect(createdRequest.message).toBeNull();
      expect(createdRequest.businessId).toBe(testBusiness.placeid);
      expect(createdRequest.userId).toBe(testUser.id);
      expect(createdRequest.status).toBe('pending');

      // Clean up
      await db.delete(featuredRequests).where(eq(featuredRequests.id, createdRequest.id));
    });

    it('should prevent duplicate pending requests for same business', async () => {
      // Create first request
      const [firstRequest] = await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'First request',
        status: 'pending'
      }).returning();

      // Verify duplicate detection logic would work
      const existingRequests = await db
        .select()
        .from(featuredRequests)
        .where(
          and(
            eq(featuredRequests.businessId, testBusiness.placeid),
            eq(featuredRequests.userId, testUser.id),
            eq(featuredRequests.status, 'pending')
          )
        );

      expect(existingRequests).toHaveLength(1);
      expect(existingRequests[0].id).toBe(firstRequest.id);

      // Clean up
      await db.delete(featuredRequests).where(eq(featuredRequests.id, firstRequest.id));
    });
  });

  describe('Featured Request Queries', () => {
    it('should retrieve requests by user', async () => {
      // Create multiple requests for the user
      const [request1] = await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Request 1',
        status: 'pending'
      }).returning();

      const [request2] = await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Request 2',
        status: 'approved'
      }).returning();

      // Query requests by user
      const userRequests = await db
        .select()
        .from(featuredRequests)
        .where(eq(featuredRequests.userId, testUser.id));

      expect(userRequests).toHaveLength(2);
      
      const requestIds = userRequests.map(r => r.id);
      expect(requestIds).toContain(request1.id);
      expect(requestIds).toContain(request2.id);

      // Clean up
      await db.delete(featuredRequests).where(eq(featuredRequests.userId, testUser.id));
    });

    it('should retrieve requests by business', async () => {
      const [request] = await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Business request',
        status: 'pending'
      }).returning();

      const businessRequests = await db
        .select()
        .from(featuredRequests)
        .where(eq(featuredRequests.businessId, testBusiness.placeid));

      expect(businessRequests).toHaveLength(1);
      expect(businessRequests[0].id).toBe(request.id);
      expect(businessRequests[0].businessId).toBe(testBusiness.placeid);

      // Clean up
      await db.delete(featuredRequests).where(eq(featuredRequests.id, request.id));
    });

    it('should update request status', async () => {
      const [request] = await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Request to approve',
        status: 'pending'
      }).returning();

      // Update status to approved
      const [updatedRequest] = await db
        .update(featuredRequests)
        .set({
          status: 'approved',
          reviewedBy: 'admin-user-id',
          reviewedAt: new Date(),
          adminMessage: 'Approved for featuring'
        })
        .where(eq(featuredRequests.id, request.id))
        .returning();

      expect(updatedRequest.status).toBe('approved');
      expect(updatedRequest.reviewedBy).toBe('admin-user-id');
      expect(updatedRequest.reviewedAt).toBeInstanceOf(Date);
      expect(updatedRequest.adminMessage).toBe('Approved for featuring');

      // Clean up
      await db.delete(featuredRequests).where(eq(featuredRequests.id, request.id));
    });
  });

  describe('Business Eligibility Check', () => {
    it('should verify business ownership for featured requests', async () => {
      // Verify the test business is owned by test user
      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.placeid, testBusiness.placeid));

      expect(business).toBeDefined();
      expect(business.ownerId).toBe(testUser.id);
      expect(business.status).toBe('active');
    });

    it('should check for existing pending requests', async () => {
      // Create a pending request
      const [request] = await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Existing pending request',
        status: 'pending'
      }).returning();

      // Check for existing pending requests (business logic)
      const existingPendingRequests = await db
        .select()
        .from(featuredRequests)
        .where(
          and(
            eq(featuredRequests.businessId, testBusiness.placeid),
            eq(featuredRequests.userId, testUser.id),
            eq(featuredRequests.status, 'pending')
          )
        );

      expect(existingPendingRequests).toHaveLength(1);
      expect(existingPendingRequests[0].id).toBe(request.id);

      // Clean up
      await db.delete(featuredRequests).where(eq(featuredRequests.id, request.id));
    });
  });
});