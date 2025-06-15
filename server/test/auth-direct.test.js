/**
 * Direct Authentication API Integration Test
 * Tests authentication endpoints without vitest/MSW interference
 * Uses native Node.js HTTP client for direct server testing
 */

import http from 'http';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

// Test configuration
const TEST_PORT = 5001; // Different port to avoid conflicts
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const responseData = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Helper function to extract session cookie
function extractSessionCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return '';
  
  const sessionCookie = setCookie.find(cookie => cookie.startsWith('connect.sid='));
  return sessionCookie ? sessionCookie.split(';')[0] : '';
}

// Test assertion helper
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    console.log(`✓ ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    console.log(`✗ ${message}`);
  }
}

// Cleanup function
async function cleanupTestUser(email) {
  try {
    await db.delete(users).where(eq(users.email, email));
  } catch (error) {
    console.log(`Cleanup note: ${error.message}`);
  }
}

// Test Suite
async function runAuthenticationTests() {
  console.log('🔒 Starting Authentication API Integration Tests...\n');
  
  // Generate unique test data
  const timestamp = Date.now();
  const testUser = {
    email: `authtest-${timestamp}@example.com`,
    password: 'securePassword123',
    firstName: 'Auth',
    lastName: 'Tester'
  };

  try {
    // Test 1: Successful Registration
    console.log('📝 Testing User Registration...');
    
    const registerResponse = await makeRequest('POST', '/api/auth/register', testUser);
    
    assert(
      registerResponse.statusCode === 201,
      `Registration returns 201 status (got ${registerResponse.statusCode})`
    );
    
    assert(
      registerResponse.body.email === testUser.email,
      'Registration response contains correct email'
    );
    
    assert(
      !registerResponse.body.password,
      'Registration response excludes password field'
    );
    
    assert(
      registerResponse.body.id,
      'Registration response includes user ID'
    );
    
    const registeredUserId = registerResponse.body.id;
    
    // Verify user in database
    const [dbUser] = await db.select().from(users).where(eq(users.email, testUser.email));
    assert(
      dbUser && dbUser.email === testUser.email,
      'User successfully created in database'
    );
    
    assert(
      dbUser.password && dbUser.password !== testUser.password,
      'Password is hashed in database'
    );

    // Test 2: Duplicate Registration Prevention
    console.log('\n🚫 Testing Duplicate Registration Prevention...');
    
    const duplicateResponse = await makeRequest('POST', '/api/auth/register', testUser);
    
    assert(
      duplicateResponse.statusCode === 400,
      `Duplicate registration rejected (got ${duplicateResponse.statusCode})`
    );
    
    assert(
      duplicateResponse.body.message.includes('already exists'),
      'Duplicate registration returns appropriate error message'
    );

    // Test 3: Successful Login
    console.log('\n🔑 Testing User Login...');
    
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
    
    assert(
      loginResponse.statusCode === 200,
      `Login returns 200 status (got ${loginResponse.statusCode})`
    );
    
    assert(
      loginResponse.body.email === testUser.email,
      'Login response contains correct user data'
    );
    
    assert(
      !loginResponse.body.password,
      'Login response excludes password field'
    );
    
    // Extract session cookie for authenticated requests
    const sessionCookie = extractSessionCookie(loginResponse.headers);
    assert(
      sessionCookie.length > 0,
      'Login sets session cookie'
    );

    // Test 4: Failed Login with Wrong Password
    console.log('\n❌ Testing Failed Login...');
    
    const wrongPasswordData = {
      email: testUser.email,
      password: 'wrongPassword123'
    };
    
    const failedLoginResponse = await makeRequest('POST', '/api/auth/login', wrongPasswordData);
    
    assert(
      failedLoginResponse.statusCode === 401,
      `Failed login returns 401 status (got ${failedLoginResponse.statusCode})`
    );
    
    assert(
      failedLoginResponse.body.message === 'Invalid email or password',
      'Failed login returns appropriate error message'
    );

    // Test 5: Session Validation
    console.log('\n👤 Testing Session Management...');
    
    const userResponse = await makeRequest('GET', '/api/auth/user', null, sessionCookie);
    
    assert(
      userResponse.statusCode === 200,
      `Authenticated user endpoint returns 200 (got ${userResponse.statusCode})`
    );
    
    assert(
      userResponse.body.email === testUser.email,
      'Session returns correct user data'
    );

    // Test 6: Unauthenticated Access
    const unauthenticatedResponse = await makeRequest('GET', '/api/auth/user');
    
    assert(
      unauthenticatedResponse.statusCode === 401,
      `Unauthenticated access returns 401 (got ${unauthenticatedResponse.statusCode})`
    );

    // Test 7: Logout
    console.log('\n🚪 Testing Logout...');
    
    const logoutResponse = await makeRequest('POST', '/api/auth/logout', null, sessionCookie);
    
    assert(
      logoutResponse.statusCode === 200,
      `Logout returns 200 status (got ${logoutResponse.statusCode})`
    );

    // Test 8: Session Destroyed After Logout
    const postLogoutResponse = await makeRequest('GET', '/api/auth/user', null, sessionCookie);
    
    assert(
      postLogoutResponse.statusCode === 401,
      `Session invalidated after logout (got ${postLogoutResponse.statusCode})`
    );

    // Test 9: Input Validation
    console.log('\n📋 Testing Input Validation...');
    
    const invalidRegistration = await makeRequest('POST', '/api/auth/register', {
      email: testUser.email + '_invalid',
      password: '123', // Too short
      firstName: 'Test',
      lastName: 'User'
    });
    
    assert(
      invalidRegistration.statusCode === 400,
      'Short password rejected during registration'
    );
    
    const missingFieldsRegistration = await makeRequest('POST', '/api/auth/register', {
      email: 'incomplete@example.com'
      // Missing password, firstName, lastName
    });
    
    assert(
      missingFieldsRegistration.statusCode === 400,
      'Missing required fields rejected during registration'
    );

    // Test 10: Non-existent User Login
    const nonExistentLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'anyPassword123'
    });
    
    assert(
      nonExistentLoginResponse.statusCode === 401,
      'Non-existent user login properly rejected'
    );

    console.log('\n🧹 Cleaning up test data...');
    await cleanupTestUser(testUser.email);

  } catch (error) {
    console.error('❌ Test execution error:', error);
    testResults.failed++;
    testResults.errors.push(`Test execution error: ${error.message}`);
    
    // Attempt cleanup even on error
    try {
      await cleanupTestUser(testUser.email);
    } catch (cleanupError) {
      console.log('Cleanup error:', cleanupError.message);
    }
  }

  // Test Results Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 Failed Tests:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All authentication tests passed! The authentication system is secure and functioning correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the authentication implementation.');
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthenticationTests().catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}

export { runAuthenticationTests };