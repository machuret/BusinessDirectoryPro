import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../db';
import { users, businesses, featuredRequests, categories } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { storage } from '../storage';

describe('Featured Requests API Integration Tests', () => {
  let app: express.Application;
  let testUser: any;
  let testBusiness: any;
  let testCategory: any;
  let authenticatedAgent: request.SuperAgentTest;

  beforeAll(async () => {
    // Setup minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Simple session setup for testing
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }));

    // Mock authentication middleware for testing
    app.use((req: any, res, next) => {
      if (req.path.includes('/api/featured-requests') && req.method !== 'GET') {
        // Simulate authenticated user
        req.user = { 
          claims: { sub: testUser?.id },
          isAuthenticated: () => true 
        };
      }
      next();
    });

    // Setup API routes
    app.post('/api/featured-requests', async (req: any, res) => {
      try {
        if (!req.user?.claims?.sub) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const { businessId, message } = req.body;
        if (!businessId) {
          return res.status(400).json({ message: 'Business ID is required' });
        }

        // Check if business exists and user owns it
        const business = await storage.getBusinessById(businessId);
        if (!business) {
          return res.status(400).json({ message: 'Business not found' });
        }

        if (business.ownerId !== req.user.claims.sub) {
          return res.status(403).json({ message: 'You do not own this business' });
        }

        // Check for existing pending requests
        const existingRequests = await db
          .select()
          .from(featuredRequests)
          .where(
            and(
              eq(featuredRequests.businessId, businessId),
              eq(featuredRequests.userId, req.user.claims.sub),
              eq(featuredRequests.status, 'pending')
            )
          );

        if (existingRequests.length > 0) {
          return res.status(400).json({ message: 'You already have a pending request for this business' });
        }

        // Create featured request
        const [newRequest] = await db.insert(featuredRequests).values({
          businessId,
          userId: req.user.claims.sub,
          message: message || null,
          status: 'pending'
        }).returning();

        res.status(201).json(newRequest);
      } catch (error) {
        console.error('Featured request creation error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    app.get('/api/featured-requests/user', async (req: any, res) => {
      try {
        if (!req.user?.claims?.sub) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRequests = await db
          .select()
          .from(featuredRequests)
          .where(eq(featuredRequests.userId, req.user.claims.sub));

        res.json(userRequests);
      } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    // Create test data
    await setupTestData();

    // Create authenticated agent
    authenticatedAgent = request.agent(app);
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  beforeEach(async () => {
    // Clean up featured requests before each test
    if (testBusiness) {
      await db.delete(featuredRequests).where(eq(featuredRequests.businessId, testBusiness.placeid));
    }
  });

  async function setupTestData() {
    // Create test category
    const [createdCategory] = await db.insert(categories).values({
      name: 'Test Category',
      slug: 'test-category-' + Date.now(),
      description: 'Test category for integration tests'
    }).returning();
    testCategory = createdCategory;

    // Create test user
    const [createdUser] = await db.insert(users).values({
      id: 'test-user-featured-' + Date.now(),
      email: 'featuredtest@example.com',
      firstName: 'Test',
      lastName: 'User'
    }).returning();
    testUser = createdUser;

    // Create test business
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
  }

  async function cleanupTestData() {
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
  }

  describe('POST /api/featured-requests', () => {
    it('should create a new featured request with authenticated user', async () => {
      const requestData = {
        businessId: testBusiness.placeid,
        message: 'Please feature our business! We provide excellent service and have great reviews.'
      };

      const response = await authenticatedAgent
        .post('/api/featured-requests')
        .send(requestData)
        .expect(201);

      // Assert response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('businessId', testBusiness.placeid);
      expect(response.body).toHaveProperty('userId', testUser.id);
      expect(response.body).toHaveProperty('message', requestData.message);
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('createdAt');

      // Verify the request exists in the database
      const [dbRequest] = await db
        .select()
        .from(featuredRequests)
        .where(
          and(
            eq(featuredRequests.businessId, testBusiness.placeid),
            eq(featuredRequests.userId, testUser.id)
          )
        );

      expect(dbRequest).toBeDefined();
      expect(dbRequest.businessId).toBe(testBusiness.placeid);
      expect(dbRequest.userId).toBe(testUser.id);
      expect(dbRequest.message).toBe(requestData.message);
      expect(dbRequest.status).toBe('pending');
      expect(dbRequest.createdAt).toBeDefined();
      expect(dbRequest.reviewedAt).toBeNull();
      expect(dbRequest.reviewedBy).toBeNull();
      expect(dbRequest.adminMessage).toBeNull();
    });

    it('should create featured request without message', async () => {
      const requestData = {
        businessId: testBusiness.placeid
      };

      const response = await authenticatedAgent
        .post('/api/featured-requests')
        .send(requestData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('businessId', testBusiness.placeid);
      expect(response.body).toHaveProperty('userId', testUser.id);
      expect(response.body.message).toBeNull();
      expect(response.body).toHaveProperty('status', 'pending');

      // Verify in database
      const [dbRequest] = await db
        .select()
        .from(featuredRequests)
        .where(eq(featuredRequests.id, response.body.id));

      expect(dbRequest.message).toBeNull();
    });

    it('should return 400 when businessId is missing', async () => {
      const requestData = {
        message: 'Please feature our business!'
      };

      await authenticatedAgent
        .post('/api/featured-requests')
        .send(requestData)
        .expect(400);

      // Verify no request was created
      const requests = await db
        .select()
        .from(featuredRequests)
        .where(eq(featuredRequests.userId, testUser.id));

      expect(requests).toHaveLength(0);
    });

    it('should return 400 when business does not exist', async () => {
      const requestData = {
        businessId: 'non-existent-business-id',
        message: 'Please feature this business!'
      };

      await authenticatedAgent
        .post('/api/featured-requests')
        .send(requestData)
        .expect(400);
    });

    it('should return 400 when user already has pending request for business', async () => {
      // Create existing pending request
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

      await authenticatedAgent
        .post('/api/featured-requests')
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
    it('should return user featured requests', async () => {
      // Create test featured request
      const [createdRequest] = await db.insert(featuredRequests).values({
        businessId: testBusiness.placeid,
        userId: testUser.id,
        message: 'Test featured request',
        status: 'pending'
      }).returning();

      const response = await authenticatedAgent
        .get('/api/featured-requests/user')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      
      const returnedRequest = response.body[0];
      expect(returnedRequest).toHaveProperty('id', createdRequest.id);
      expect(returnedRequest).toHaveProperty('businessId', testBusiness.placeid);
      expect(returnedRequest).toHaveProperty('userId', testUser.id);
      expect(returnedRequest).toHaveProperty('message', 'Test featured request');
      expect(returnedRequest).toHaveProperty('status', 'pending');
    });

    it('should return empty array when user has no requests', async () => {
      const response = await authenticatedAgent
        .get('/api/featured-requests/user')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });
  });
});