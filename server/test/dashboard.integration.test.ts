import express from 'express';
import request from 'supertest';
import { db } from '../db';
import { users, businesses, categories, ownershipClaims, featuredRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';
import {
  createDashboardTestSetup,
  cleanupTestData,
  type TestUser,
  type TestBusiness,
  type TestCategory
} from './test-helpers';
import { setupAuth } from '../auth-clean';
import type { OwnershipClaim, FeaturedRequest } from '@shared/schema';

/**
 * Dashboard Integration Tests
 * Comprehensive testing of dashboard functionality including:
 * - User authentication and session management
 * - Business ownership display
 * - Ownership claims tracking
 * - Featured requests tracking
 * - Data integrity across dashboard sections
 */

describe('Dashboard Integration Tests', () => {
  let app: express.Application;
  let testData: {
    user: TestUser;
    businessA: TestBusiness;
    businessB: TestBusiness;
    categoryA: TestCategory;
    categoryB: TestCategory;
    ownershipClaim: OwnershipClaim;
    featuredRequest: FeaturedRequest;
  };

  beforeAll(async () => {
    // Create Express app with authentication
    app = express();
    app.use(express.json());
    setupAuth(app);
    
    // Create comprehensive test data setup
    testData = await createDashboardTestSetup();
    
    console.log('Dashboard test setup created:', {
      userId: testData.user.id,
      businessAId: testData.businessA.placeid,
      businessBId: testData.businessB.placeid,
      ownershipClaimId: testData.ownershipClaim.id,
      featuredRequestId: testData.featuredRequest.id
    });
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      // Clean up ownership claims and featured requests first
      await db.delete(ownershipClaims).where(eq(ownershipClaims.id, testData.ownershipClaim.id));
      await db.delete(featuredRequests).where(eq(featuredRequests.id, testData.featuredRequest.id));
      
      // Clean up businesses
      await db.delete(businesses).where(eq(businesses.placeid, testData.businessA.placeid));
      await db.delete(businesses).where(eq(businesses.placeid, testData.businessB.placeid));
      
      // Clean up categories
      await db.delete(categories).where(eq(categories.id, testData.categoryA.id));
      await db.delete(categories).where(eq(categories.id, testData.categoryB.id));
      
      // Clean up user
      await db.delete(users).where(eq(users.id, testData.user.id));
      
      console.log('Dashboard test cleanup completed');
    } catch (error) {
      console.error('Dashboard test cleanup error:', error);
    }
  });

  describe('Authentication and Session Management', () => {
    test('should authenticate user and maintain session', async () => {
      // Test user login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testData.user.email,
          password: 'testpassword123' // Default test password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('id', testData.user.id);
      expect(loginResponse.body).toHaveProperty('email', testData.user.email);

      // Extract session cookie
      const sessionCookie = loginResponse.headers['set-cookie']?.[0];
      expect(sessionCookie).toBeDefined();

      // Test authenticated user endpoint
      const userResponse = await request(app)
        .get('/api/user')
        .set('Cookie', sessionCookie!);

      expect(userResponse.status).toBe(200);
      expect(userResponse.body).toHaveProperty('id', testData.user.id);
      expect(userResponse.body).toHaveProperty('firstName', 'Dashboard');
      expect(userResponse.body).toHaveProperty('lastName', 'Tester');
    });
  });

  describe('Business Ownership Display', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      // Login and get session cookie
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testData.user.email,
          password: 'testpassword123'
        });
      
      sessionCookie = loginResponse.headers['set-cookie']?.[0] || '';
    });

    test('should fetch user businesses correctly', async () => {
      const response = await request(app)
        .get('/api/businesses/user')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      // Verify both businesses are returned
      const businessTitles = response.body.map((b: any) => b.title);
      expect(businessTitles).toContain('Business A');
      expect(businessTitles).toContain('Business B');

      // Verify business ownership
      response.body.forEach((business: any) => {
        expect(business.ownerid).toBe(testData.user.id);
      });
    });

    test('should display correct business details in dashboard', async () => {
      const response = await request(app)
        .get('/api/businesses/user')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      
      const businessA = response.body.find((b: any) => b.title === 'Business A');
      const businessB = response.body.find((b: any) => b.title === 'Business B');

      expect(businessA).toBeDefined();
      expect(businessA.placeid).toBe(testData.businessA.placeid);
      expect(businessA.ownerid).toBe(testData.user.id);

      expect(businessB).toBeDefined();
      expect(businessB.placeid).toBe(testData.businessB.placeid);
      expect(businessB.ownerid).toBe(testData.user.id);
    });
  });

  describe('Ownership Claims Tracking', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testData.user.email,
          password: 'testpassword123'
        });
      
      sessionCookie = loginResponse.headers['set-cookie']?.[0] || '';
    });

    test('should fetch user ownership claims correctly', async () => {
      const response = await request(app)
        .get('/api/ownership-claims/user')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      const claim = response.body[0];
      expect(claim.id).toBe(testData.ownershipClaim.id);
      expect(claim.userId).toBe(testData.user.id);
      expect(claim.businessId).toBe(testData.businessA.placeid);
      expect(claim.status).toBe('pending');
      expect(claim.message).toBe('I am the owner of Business A and need to claim it.');
    });

    test('should display correct ownership claim status', async () => {
      const response = await request(app)
        .get('/api/ownership-claims/user')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      
      const claim = response.body[0];
      expect(claim.status).toBe('pending');
      expect(claim.businessId).toBe(testData.businessA.placeid);
      
      // Verify claim is associated with correct business
      expect(claim.businessId).toBe(testData.businessA.placeid);
    });

    test('should handle ownership claims analytics correctly', async () => {
      const response = await request(app)
        .get('/api/ownership-claims/user')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      
      // Verify exactly one pending claim
      const pendingClaims = response.body.filter((claim: any) => claim.status === 'pending');
      expect(pendingClaims).toHaveLength(1);
      
      const approvedClaims = response.body.filter((claim: any) => claim.status === 'approved');
      expect(approvedClaims).toHaveLength(0);
      
      const rejectedClaims = response.body.filter((claim: any) => claim.status === 'rejected');
      expect(rejectedClaims).toHaveLength(0);
    });
  });

  describe('Featured Requests Tracking', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testData.user.email,
          password: 'testpassword123'
        });
      
      sessionCookie = loginResponse.headers['set-cookie']?.[0] || '';
    });

    test('should fetch user featured requests correctly', async () => {
      const response = await request(app)
        .get('/api/featured-requests/user')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      const request = response.body[0];
      expect(request.id).toBe(testData.featuredRequest.id);
      expect(request.userId).toBe(testData.user.id);
      expect(request.businessId).toBe(testData.businessB.placeid);
      expect(request.status).toBe('pending');
      expect(request.message).toBe('Please feature Business B as it provides excellent service.');
    });

    test('should display correct featured request status', async () => {
      const response = await request(app)
        .get('/api/featured-requests/user')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      
      const featuredRequest = response.body[0];
      expect(featuredRequest.status).toBe('pending');
      expect(featuredRequest.businessId).toBe(testData.businessB.placeid);
      
      // Verify request is associated with correct business
      expect(featuredRequest.businessId).toBe(testData.businessB.placeid);
    });

    test('should handle featured requests analytics correctly', async () => {
      const response = await request(app)
        .get('/api/featured-requests/user')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      
      // Verify exactly one pending request
      const pendingRequests = response.body.filter((req: any) => req.status === 'pending');
      expect(pendingRequests).toHaveLength(1);
      
      const approvedRequests = response.body.filter((req: any) => req.status === 'approved');
      expect(approvedRequests).toHaveLength(0);
      
      const rejectedRequests = response.body.filter((req: any) => req.status === 'rejected');
      expect(rejectedRequests).toHaveLength(0);
    });
  });

  describe('Dashboard Data Integrity', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testData.user.email,
          password: 'testpassword123'
        });
      
      sessionCookie = loginResponse.headers['set-cookie']?.[0] || '';
    });

    test('should maintain data consistency across dashboard sections', async () => {
      // Fetch all dashboard data
      const [businessesResponse, claimsResponse, requestsResponse] = await Promise.all([
        request(app).get('/api/businesses/user').set('Cookie', sessionCookie),
        request(app).get('/api/ownership-claims/user').set('Cookie', sessionCookie),
        request(app).get('/api/featured-requests/user').set('Cookie', sessionCookie)
      ]);

      expect(businessesResponse.status).toBe(200);
      expect(claimsResponse.status).toBe(200);
      expect(requestsResponse.status).toBe(200);

      // Verify data consistency
      const businesses = businessesResponse.body;
      const claims = claimsResponse.body;
      const requests = requestsResponse.body;

      // All data should belong to the same user
      businesses.forEach((business: any) => {
        expect(business.ownerid).toBe(testData.user.id);
      });
      
      claims.forEach((claim: any) => {
        expect(claim.userId).toBe(testData.user.id);
      });
      
      requests.forEach((request: any) => {
        expect(request.userId).toBe(testData.user.id);
      });

      // Verify business associations are correct
      const businessIds = businesses.map((b: any) => b.placeid);
      expect(businessIds).toContain(claims[0].businessId);
      expect(businessIds).toContain(requests[0].businessId);
    });

    test('should handle dashboard analytics calculations correctly', async () => {
      const [businessesResponse, claimsResponse, requestsResponse] = await Promise.all([
        request(app).get('/api/businesses/user').set('Cookie', sessionCookie),
        request(app).get('/api/ownership-claims/user').set('Cookie', sessionCookie),
        request(app).get('/api/featured-requests/user').set('Cookie', sessionCookie)
      ]);

      // Calculate expected analytics
      const totalBusinesses = businessesResponse.body.length;
      const pendingClaims = claimsResponse.body.filter((c: any) => c.status === 'pending').length;
      const pendingRequests = requestsResponse.body.filter((r: any) => r.status === 'pending').length;

      // Verify counts match expected test data
      expect(totalBusinesses).toBe(2); // Business A and Business B
      expect(pendingClaims).toBe(1); // One pending claim for Business A
      expect(pendingRequests).toBe(1); // One pending request for Business B
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle unauthenticated requests correctly', async () => {
      const responses = await Promise.all([
        request(app).get('/api/businesses/user'),
        request(app).get('/api/ownership-claims/user'),
        request(app).get('/api/featured-requests/user')
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(401);
      });
    });

    test('should handle invalid session correctly', async () => {
      const invalidCookie = 'connect.sid=invalid-session-id';
      
      const responses = await Promise.all([
        request(app).get('/api/businesses/user').set('Cookie', invalidCookie),
        request(app).get('/api/ownership-claims/user').set('Cookie', invalidCookie),
        request(app).get('/api/featured-requests/user').set('Cookie', invalidCookie)
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('Dashboard Component Integration', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testData.user.email,
          password: 'testpassword123'
        });
      
      sessionCookie = loginResponse.headers['set-cookie']?.[0] || '';
    });

    test('should provide all data needed for dashboard rendering', async () => {
      // Test all endpoints that dashboard components depend on
      const [
        userResponse,
        businessesResponse,
        claimsResponse,
        requestsResponse
      ] = await Promise.all([
        request(app).get('/api/user').set('Cookie', sessionCookie),
        request(app).get('/api/businesses/user').set('Cookie', sessionCookie),
        request(app).get('/api/ownership-claims/user').set('Cookie', sessionCookie),
        request(app).get('/api/featured-requests/user').set('Cookie', sessionCookie)
      ]);

      // Verify all responses are successful
      expect(userResponse.status).toBe(200);
      expect(businessesResponse.status).toBe(200);
      expect(claimsResponse.status).toBe(200);
      expect(requestsResponse.status).toBe(200);

      // Verify response structure matches dashboard component expectations
      const user = userResponse.body;
      const businesses = businessesResponse.body;
      const claims = claimsResponse.body;
      const requests = requestsResponse.body;

      // User data for header/profile
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('email');

      // Business data for BusinessesSection
      expect(Array.isArray(businesses)).toBe(true);
      businesses.forEach((business: any) => {
        expect(business).toHaveProperty('title');
        expect(business).toHaveProperty('placeid');
        expect(business).toHaveProperty('ownerid');
      });

      // Claims data for ClaimsSection
      expect(Array.isArray(claims)).toBe(true);
      claims.forEach((claim: any) => {
        expect(claim).toHaveProperty('status');
        expect(claim).toHaveProperty('businessId');
        expect(claim).toHaveProperty('message');
      });

      // Requests data for FeaturedRequestsSection
      expect(Array.isArray(requests)).toBe(true);
      requests.forEach((request: any) => {
        expect(request).toHaveProperty('status');
        expect(request).toHaveProperty('businessId');
        expect(request).toHaveProperty('message');
      });
    });
  });
});