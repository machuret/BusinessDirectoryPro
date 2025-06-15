import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import express from 'express';
import request from 'supertest';
import session from 'express-session';
import { setupAuthRoutes } from '../routes/auth';
import { cleanupTestData } from './test-helpers';

describe('Authentication API Integration Tests', () => {
  let app: express.Application;
  let testUserData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  let createdUserId: string | null = null;

  beforeAll(async () => {
    // Setup test server with session middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Setup session middleware (required for authentication)
    app.use(session({
      secret: 'test-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // false for testing
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));
    
    // Setup authentication routes
    setupAuthRoutes(app);
  });

  beforeEach(() => {
    // Generate unique test user data for each test
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    
    testUserData = {
      email: `testuser-${timestamp}-${randomSuffix}@example.com`,
      password: 'securePassword123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    createdUserId = null;
  });

  afterEach(async () => {
    // Cleanup created test user
    if (createdUserId) {
      try {
        await db.delete(users).where(eq(users.id, createdUserId));
      } catch (error) {
        console.error('Cleanup error:', error);
      }
      createdUserId = null;
    }
  });

  describe('User Registration', () => {
    it('should successfully register a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUserData)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUserData.email);
      expect(response.body).toHaveProperty('firstName', testUserData.firstName);
      expect(response.body).toHaveProperty('lastName', testUserData.lastName);
      expect(response.body).toHaveProperty('role', 'user');
      expect(response.body).not.toHaveProperty('password'); // Password should be excluded

      // Store user ID for cleanup
      createdUserId = response.body.id;

      // Verify user was created in database
      const [dbUser] = await db.select().from(users).where(eq(users.id, response.body.id));
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(testUserData.email);
      expect(dbUser.password).toBeDefined(); // Password should be hashed and stored
      expect(dbUser.password).not.toBe(testUserData.password); // Should be hashed, not plain text
    });

    it('should reject registration with missing required fields', async () => {
      const incompleteData = {
        email: testUserData.email,
        // Missing password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'All fields are required');
    });

    it('should reject registration with weak password', async () => {
      const weakPasswordData = {
        ...testUserData,
        password: '12345' // Less than 6 characters
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Password must be at least 6 characters long');
    });

    it('should reject registration with duplicate email', async () => {
      // First registration should succeed
      const firstResponse = await request(app)
        .post('/api/auth/register')
        .send(testUserData)
        .expect(201);

      createdUserId = firstResponse.body.id;

      // Second registration with same email should fail
      const secondResponse = await request(app)
        .post('/api/auth/register')
        .send(testUserData)
        .expect(400);

      expect(secondResponse.body).toHaveProperty('message', 'User with this email already exists');
    });
  });

  describe('User Login', () => {
    let registeredUser: any;

    beforeEach(async () => {
      // Register a user first for login tests
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUserData)
        .expect(201);

      registeredUser = registerResponse.body;
      createdUserId = registeredUser.id;
    });

    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: testUserData.email,
        password: testUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('id', registeredUser.id);
      expect(response.body).toHaveProperty('email', testUserData.email);
      expect(response.body).toHaveProperty('firstName', testUserData.firstName);
      expect(response.body).toHaveProperty('lastName', testUserData.lastName);
      expect(response.body).not.toHaveProperty('password'); // Password should be excluded

      // Verify session was created (cookie should be set)
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const invalidLoginData = {
        email: testUserData.email,
        password: 'wrongPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLoginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      const invalidLoginData = {
        email: 'nonexistent@example.com',
        password: testUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLoginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should reject login with missing credentials', async () => {
      const incompleteData = {
        email: testUserData.email,
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });
  });

  describe('Session Management', () => {
    let registeredUser: any;
    let authenticatedAgent: request.SuperAgentTest;

    beforeEach(async () => {
      // Register and login a user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUserData)
        .expect(201);

      registeredUser = registerResponse.body;
      createdUserId = registeredUser.id;

      // Create an agent to maintain session cookies
      authenticatedAgent = request.agent(app);
      
      await authenticatedAgent
        .post('/api/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        })
        .expect(200);
    });

    it('should return user data when authenticated', async () => {
      const response = await authenticatedAgent
        .get('/api/auth/user')
        .expect(200);

      expect(response.body).toHaveProperty('id', registeredUser.id);
      expect(response.body).toHaveProperty('email', testUserData.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject access to protected endpoint when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authenticated');
    });

    it('should successfully logout and destroy session', async () => {
      // Verify user is authenticated
      await authenticatedAgent
        .get('/api/auth/user')
        .expect(200);

      // Logout
      const logoutResponse = await authenticatedAgent
        .post('/api/auth/logout')
        .expect(200);

      expect(logoutResponse.body).toHaveProperty('message', 'Logged out successfully');

      // Verify session is destroyed - subsequent requests should fail
      await authenticatedAgent
        .get('/api/auth/user')
        .expect(401);
    });
  });

  describe('Password Security', () => {
    let registeredUser: any;

    beforeEach(async () => {
      // Register a user for password tests
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUserData)
        .expect(201);

      registeredUser = registerResponse.body;
      createdUserId = registeredUser.id;
    });

    it('should store hashed password in database', async () => {
      // Verify password is hashed in database
      const [dbUser] = await db.select().from(users).where(eq(users.id, registeredUser.id));
      
      expect(dbUser.password).toBeDefined();
      expect(dbUser.password).not.toBe(testUserData.password); // Should not be plain text
      expect(dbUser.password).toMatch(/^[a-f0-9]+\.[a-f0-9]+$/); // Should match hash.salt format
    });

    it('should accept login with correct password after registration', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        })
        .expect(200);

      expect(loginResponse.body.id).toBe(registeredUser.id);
    });

    it('should reject similar but incorrect passwords', async () => {
      const similarPasswords = [
        testUserData.password + '1',    // Extra character
        testUserData.password.slice(0, -1), // Missing character
        testUserData.password.toUpperCase(), // Different case
        ' ' + testUserData.password,    // Leading space
        testUserData.password + ' '     // Trailing space
      ];

      for (const wrongPassword of similarPasswords) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUserData.email,
            password: wrongPassword
          })
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid email or password');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send('{"invalid": json"}')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message', 'All fields are required');
    });

    it('should handle extremely long input values', async () => {
      const longString = 'a'.repeat(10000);
      const invalidData = {
        email: longString + '@example.com',
        password: longString,
        firstName: longString,
        lastName: longString
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      // Should handle gracefully (either validation error or server error, but not crash)
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Edge Cases', () => {
    it('should handle email case insensitivity correctly', async () => {
      const originalEmail = testUserData.email;
      const upperCaseEmail = originalEmail.toUpperCase();
      const mixedCaseEmail = originalEmail.split('').map((char, i) => 
        i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
      ).join('');

      // Register with original case
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUserData)
        .expect(201);

      createdUserId = registerResponse.body.id;

      // Try to register with different case - should fail if email uniqueness is properly enforced
      await request(app)
        .post('/api/auth/register')
        .send({
          ...testUserData,
          email: upperCaseEmail
        })
        .expect(400);

      // Login should work with original case
      await request(app)
        .post('/api/auth/login')
        .send({
          email: originalEmail,
          password: testUserData.password
        })
        .expect(200);
    });

    it('should handle special characters in passwords', async () => {
      const specialPasswordData = {
        ...testUserData,
        password: 'Test@123!#$%^&*()'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(specialPasswordData)
        .expect(201);

      createdUserId = registerResponse.body.id;

      // Login should work with special characters
      await request(app)
        .post('/api/auth/login')
        .send({
          email: specialPasswordData.email,
          password: specialPasswordData.password
        })
        .expect(200);
    });

    it('should handle unicode characters in names', async () => {
      const unicodeData = {
        ...testUserData,
        firstName: 'José',
        lastName: 'García-Müller'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(unicodeData)
        .expect(201);

      createdUserId = registerResponse.body.id;

      expect(registerResponse.body.firstName).toBe('José');
      expect(registerResponse.body.lastName).toBe('García-Müller');
    });
  });
});