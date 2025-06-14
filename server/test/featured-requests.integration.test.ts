import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../db';
import { users, businesses, featuredRequests, categories } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { setupAuth } from '../replitAuth';

// Test server setup
import express from 'express';
import { registerRoutes } from '../routes';
import request from 'supertest';

describe('Featured Requests API Integration Tests', () => {
  let app: express.Application;
  let server: any;
  let testUser: any;
  let testBusiness: any;
  let testCategory: any;
  let authCookie: string;

  beforeAll(async () => {
    // Setup test server with full middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Setup authentication middleware
    await setupAuth(app);
    
    // Register routes
    server = await registerRoutes(app);

    // Create test category first
    const [createdCategory] = await db.insert(categories).values({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category for integration tests'
    }).returning();
    
    testCategory = createdCategory;

    // Create test user using Replit Auth format
    const [createdUser] = await db.insert(users).values({
      id: 'test-user-featured-' + Date.now(),
      email: 'featuredtest@example.com',
      firstName: 'Test',
      lastName: 'User'
    }).returning();
    
    testUser = createdUser;

    // Create test business owned by test user
    const [createdBusiness] = await db.insert(businesses).values({
      placeid: 'test-business-featured-' + Date.now(),
      title: 'Test Business for Featured Requests',
      slug: 'test-business-featured-' + Date.now(),
      address: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      zipcode: '12345',
      phone: '555-0123',
      categoryId: testCategory.id,
      ownerId: testUser.id,
      status: 'active'
    }).returning();

    testBusiness = createdBusiness;

    // For Replit Auth, we need to simulate an authenticated session
    // Create a mock session for testing
    authCookie = 'mock-session-cookie=test-session-id';
  });

  afterAll(async () => {
    // Cleanup test data
    if (testBusiness) {
      await db.delete(featuredRequests).where(eq(featuredRequests.businessId, testBusiness.placeid));
      await db.delete(businesses).where(eq(businesses.placeid, testBusiness.placeid));
    }
    if (testUser) {
      await db.delete(users).where(eq(users.id, testUser.id));
    }
    
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clean up any existing featured requests for this business
    if (testBusiness) {
      await db.delete(featuredRequests).where(eq(featuredRequests.businessId, testBusiness.placeid));
    }
  });

  describe('POST /api/featured-requests', () => {
    it('should create a new featured request when authenticated user owns the business', async () => {
      const requestData = {
        businessId: testBusiness.placeid,
        message: 'Please feature our business! We provide excellent service and have great reviews.'
      };

      // Make authenticated request to create featured request
      const response = await request(server)
        .post('/api/featured-requests')
        .set('Cookie', authCookie)
        .send(requestData)
        .expect(201);

      // Assert response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('businessId', testBusiness.placeid);
      expect(response.body).toHaveProperty('userId', testUser.id);
      expect(response.body).toHaveProperty('message', requestData.message);
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('createdAt');

      // Verify the request was actually created in the database
      const [createdRequest] = await db
        .select()
        .from(featuredRequests)
        .where(
          and(
            eq(featuredRequests.businessId, testBusiness.placeid),
            eq(featuredRequests.userId, testUser.id)
          )
        );

      expect(createdRequest).toBeDefined();
      expect(createdRequest.businessId).toBe(testBusiness.placeid);
      expect(createdRequest.userId).toBe(testUser.id);
      expect(createdRequest.message).toBe(requestData.message);
      expect(createdRequest.status).toBe('pending');
      expect(createdRequest.createdAt).toBeDefined();
      expect(createdRequest.reviewedAt).toBeNull();
      expect(createdRequest.reviewedBy).toBeNull();
      expect(createdRequest.adminMessage).toBeNull();
    });

    it('should return 401 when user is not authenticated', async () => {
      const requestData = {
        businessId: testBusiness.placeid,
        message: 'Please feature our business!'
      };

      await request(server)
        .post('/api/featured-requests')
        .send(requestData)
        .expect(401);

      // Verify no request was created in database
      const requests = await db
        .select()
        .from(featuredRequests)
        .where(eq(featuredRequests.businessId, testBusiness.placeid));

      expect(requests).toHaveLength(0);
    });

    it('should return 400 when businessId is missing', async () => {
      const requestData = {
        message: 'Please feature our business!'
      };

      await request(server)
        .post('/api/featured-requests')
        .set('Cookie', authCookie)
        .send(requestData)
        .expect(400);
    });

    it('should return 403 when user does not own the business', async () => {
      // Create another business not owned by test user
      const [otherBusiness] = await db.insert(businesses).values({
        placeid: 'other-business-' + Date.now(),
        title: 'Other Business',
        slug: 'other-business-' + Date.now(),
        address: '456 Other Street',
        city: 'Other City',
        state: 'OS',
        zipcode: '67890',
        phone: '555-0456',
        categoryId: 1,
        status: 'active'
        // No ownerId - not owned by test user
      }).returning();

      const requestData = {
        businessId: otherBusiness.placeid,
        message: 'Please feature this business!'
      };

      await request(server)
        .post('/api/featured-requests')
        .set('Cookie', authCookie)
        .send(requestData)
        .expect(403);

      // Cleanup
      await db.delete(businesses).where(eq(businesses.placeid, otherBusiness.placeid));
    });

    it('should return 400 when business does not exist', async () => {
      const requestData = {
        businessId: 'non-existent-business-id',
        message: 'Please feature this business!'
      };

      await request(server)
        .post('/api/featured-requests')
        .set('Cookie', authCookie)
        .send(requestData)
        .expect(400);
    });

    it('should return 400 when user already has a pending request for the business', async () => {
      // Create an existing pending request
      await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Existing pending request',
        status: 'pending'
      });

      const requestData = {
        businessId: testBusiness.placeid,
        message: 'Another request for the same business'
      };

      await request(server)
        .post('/api/featured-requests')
        .set('Cookie', authCookie)
        .send(requestData)
        .expect(400);

      // Verify only one request exists
      const requests = await db
        .select()
        .from(featuredRequests)
        .where(eq(featuredRequests.businessId, testBusiness.placeid));

      expect(requests).toHaveLength(1);
    });
  });

  describe('GET /api/featured-requests/user', () => {
    it('should return user\'s featured requests when authenticated', async () => {
      // Create a test featured request
      const [createdRequest] = await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Test featured request',
        status: 'pending'
      }).returning();

      const response = await request(server)
        .get('/api/featured-requests/user')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      
      const request = response.body[0];
      expect(request).toHaveProperty('id', createdRequest.id);
      expect(request).toHaveProperty('businessId', testBusiness.placeid);
      expect(request).toHaveProperty('userId', testUser.id);
      expect(request).toHaveProperty('message', 'Test featured request');
      expect(request).toHaveProperty('status', 'pending');
    });

    it('should return 401 when user is not authenticated', async () => {
      await request(server)
        .get('/api/featured-requests/user')
        .expect(401);
    });
  });
});