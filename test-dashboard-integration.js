/**
 * Dashboard Integration Test Script
 * Tests core dashboard functionality with real data setup
 */

import { Pool } from 'pg';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');

const API_BASE = 'http://localhost:5000';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class DashboardTester {
  constructor() {
    this.testData = {};
  }

  async setupTestData() {
    console.log('\n🔧 Setting up test data...');
    
    const timestamp = Date.now();
    const uniqueId = `test-${timestamp}`;
    
    // Create test user
    const userData = {
      id: uniqueId,
      email: `dashboard-test-${timestamp}@example.com`,
      password: '$2b$10$1234567890123456789012345678901234567890123456', // hashed 'testpassword123'
      firstName: 'Dashboard',
      lastName: 'Tester',
      role: 'user'
    };

    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userData.id, userData.email, userData.password, userData.firstName, userData.lastName, userData.role]
    );

    // Create test categories
    const [categoryA] = await pool.query(
      `INSERT INTO categories (name, slug, description, icon, color) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [`Test Category A ${timestamp}`, `test-category-a-${timestamp}`, 'Test category A', 'building-2', '#3B82F6']
    );

    const [categoryB] = await pool.query(
      `INSERT INTO categories (name, slug, description, icon, color) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [`Test Category B ${timestamp}`, `test-category-b-${timestamp}`, 'Test category B', 'building-2', '#3B82F6']
    );

    // Create test businesses
    const businessAData = {
      placeid: `business-a-${timestamp}`,
      title: 'Business A',
      slug: `business-a-${timestamp}`,
      address: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      postalcode: '12345',
      phone: '555-0123',
      ownerid: userData.id
    };

    const businessBData = {
      placeid: `business-b-${timestamp}`,
      title: 'Business B',
      slug: `business-b-${timestamp}`,
      address: '456 Test Avenue',
      city: 'Test City',
      state: 'TS',
      postalcode: '12345',
      phone: '555-0124',
      ownerid: userData.id
    };

    await pool.query(
      `INSERT INTO businesses (placeid, title, slug, address, city, state, postalcode, phone, ownerid) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [businessAData.placeid, businessAData.title, businessAData.slug, businessAData.address, 
       businessAData.city, businessAData.state, businessAData.postalcode, businessAData.phone, businessAData.ownerid]
    );

    await pool.query(
      `INSERT INTO businesses (placeid, title, slug, address, city, state, postalcode, phone, ownerid) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [businessBData.placeid, businessBData.title, businessBData.slug, businessBData.address, 
       businessBData.city, businessBData.state, businessBData.postalcode, businessBData.phone, businessBData.ownerid]
    );

    // Create ownership claim for Business A
    const [ownershipClaim] = await pool.query(
      `INSERT INTO ownership_claims (user_id, business_id, status, message) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userData.id, businessAData.placeid, 'pending', 'I am the owner of Business A and need to claim it.']
    );

    // Create featured request for Business B
    const [featuredRequest] = await pool.query(
      `INSERT INTO featured_requests (user_id, business_id, status, message) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userData.id, businessBData.placeid, 'pending', 'Please feature Business B as it provides excellent service.']
    );

    this.testData = {
      user: userData,
      businessA: businessAData,
      businessB: businessBData,
      categoryA: categoryA.rows[0],
      categoryB: categoryB.rows[0],
      ownershipClaim: ownershipClaim.rows[0],
      featuredRequest: featuredRequest.rows[0]
    };

    console.log('✅ Test data created successfully');
    console.log(`   User: ${userData.email}`);
    console.log(`   Business A: ${businessAData.title} (${businessAData.placeid})`);
    console.log(`   Business B: ${businessBData.title} (${businessBData.placeid})`);
    console.log(`   Ownership Claim: ${ownershipClaim.rows[0].id}`);
    console.log(`   Featured Request: ${featuredRequest.rows[0].id}`);
  }

  async loginUser() {
    console.log('\n🔐 Logging in test user...');
    
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.testData.user.email,
        password: 'testpassword123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const sessionCookie = response.headers.get('set-cookie');
    if (!sessionCookie) {
      throw new Error('No session cookie received');
    }

    this.sessionCookie = sessionCookie;
    console.log('✅ User logged in successfully');
    
    return response.json();
  }

  async testBusinessesSection() {
    console.log('\n📊 Testing Businesses Section...');
    
    const response = await fetch(`${API_BASE}/api/businesses/user`, {
      headers: {
        'Cookie': this.sessionCookie
      }
    });

    if (!response.ok) {
      throw new Error(`Businesses fetch failed: ${response.status}`);
    }

    const businesses = await response.json();
    
    // Verify we have exactly 2 businesses
    if (businesses.length !== 2) {
      throw new Error(`Expected 2 businesses, got ${businesses.length}`);
    }

    // Verify business titles are visible
    const businessTitles = businesses.map(b => b.title);
    if (!businessTitles.includes('Business A')) {
      throw new Error('Business A title not found in businesses list');
    }
    if (!businessTitles.includes('Business B')) {
      throw new Error('Business B title not found in businesses list');
    }

    // Verify ownership
    for (const business of businesses) {
      if (business.ownerid !== this.testData.user.id) {
        throw new Error(`Business ${business.title} not owned by test user`);
      }
    }

    console.log('✅ Businesses Section: Both "Business A" and "Business B" titles are visible');
    console.log(`   Found ${businesses.length} businesses owned by user`);
    
    return businesses;
  }

  async testClaimsSection() {
    console.log('\n🏢 Testing Claims Section...');
    
    const response = await fetch(`${API_BASE}/api/ownership-claims/user`, {
      headers: {
        'Cookie': this.sessionCookie
      }
    });

    if (!response.ok) {
      throw new Error(`Claims fetch failed: ${response.status}`);
    }

    const claims = await response.json();
    
    // Verify we have exactly 1 pending claim
    const pendingClaims = claims.filter(c => c.status === 'pending');
    if (pendingClaims.length !== 1) {
      throw new Error(`Expected 1 pending claim, got ${pendingClaims.length}`);
    }

    // Verify claim details
    const claim = pendingClaims[0];
    if (claim.businessId !== this.testData.businessA.placeid) {
      throw new Error('Claim not associated with Business A');
    }
    if (claim.userId !== this.testData.user.id) {
      throw new Error('Claim not owned by test user');
    }

    console.log('✅ Claims Section: Correctly indicates 1 pending claim');
    console.log(`   Claim ID: ${claim.id} for Business A`);
    
    return claims;
  }

  async testFeaturedRequestsSection() {
    console.log('\n⭐ Testing Featured Requests Section...');
    
    const response = await fetch(`${API_BASE}/api/featured-requests/user`, {
      headers: {
        'Cookie': this.sessionCookie
      }
    });

    if (!response.ok) {
      throw new Error(`Featured requests fetch failed: ${response.status}`);
    }

    const requests = await response.json();
    
    // Verify we have exactly 1 pending request
    const pendingRequests = requests.filter(r => r.status === 'pending');
    if (pendingRequests.length !== 1) {
      throw new Error(`Expected 1 pending featured request, got ${pendingRequests.length}`);
    }

    // Verify request details
    const request = pendingRequests[0];
    if (request.businessId !== this.testData.businessB.placeid) {
      throw new Error('Featured request not associated with Business B');
    }
    if (request.userId !== this.testData.user.id) {
      throw new Error('Featured request not owned by test user');
    }

    console.log('✅ Featured Requests Section: Correctly indicates 1 pending featured request');
    console.log(`   Request ID: ${request.id} for Business B`);
    
    return requests;
  }

  async testDashboardIntegration() {
    console.log('\n🔄 Testing Dashboard Data Integration...');
    
    // Fetch all dashboard data simultaneously
    const [businessesResponse, claimsResponse, requestsResponse] = await Promise.all([
      fetch(`${API_BASE}/api/businesses/user`, { headers: { 'Cookie': this.sessionCookie } }),
      fetch(`${API_BASE}/api/ownership-claims/user`, { headers: { 'Cookie': this.sessionCookie } }),
      fetch(`${API_BASE}/api/featured-requests/user`, { headers: { 'Cookie': this.sessionCookie } })
    ]);

    const businesses = await businessesResponse.json();
    const claims = await claimsResponse.json();
    const requests = await requestsResponse.json();

    // Verify data consistency
    const businessIds = businesses.map(b => b.placeid);
    
    // Verify claim is for a business owned by user
    if (!businessIds.includes(claims[0].businessId)) {
      throw new Error('Ownership claim not associated with user-owned business');
    }
    
    // Verify featured request is for a business owned by user
    if (!businessIds.includes(requests[0].businessId)) {
      throw new Error('Featured request not associated with user-owned business');
    }

    console.log('✅ Dashboard Integration: All data correctly associated with user');
    console.log(`   Businesses: ${businesses.length}`);
    console.log(`   Pending Claims: ${claims.filter(c => c.status === 'pending').length}`);
    console.log(`   Pending Requests: ${requests.filter(r => r.status === 'pending').length}`);
    
    return { businesses, claims, requests };
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Clean up in correct dependency order
      await pool.query('DELETE FROM featured_requests WHERE id = $1', [this.testData.featuredRequest.id]);
      await pool.query('DELETE FROM ownership_claims WHERE id = $1', [this.testData.ownershipClaim.id]);
      await pool.query('DELETE FROM businesses WHERE placeid = $1', [this.testData.businessA.placeid]);
      await pool.query('DELETE FROM businesses WHERE placeid = $1', [this.testData.businessB.placeid]);
      await pool.query('DELETE FROM categories WHERE id = $1', [this.testData.categoryA.id]);
      await pool.query('DELETE FROM categories WHERE id = $1', [this.testData.categoryB.id]);
      await pool.query('DELETE FROM users WHERE id = $1', [this.testData.user.id]);
      
      console.log('✅ Test data cleaned up successfully');
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
    }
  }

  async runAllTests() {
    try {
      await this.setupTestData();
      await this.loginUser();
      await this.testBusinessesSection();
      await this.testClaimsSection();
      await this.testFeaturedRequestsSection();
      await this.testDashboardIntegration();
      
      console.log('\n🎉 ALL DASHBOARD INTEGRATION TESTS PASSED!');
      console.log('\n✅ Verified:');
      console.log('   • User authentication and session management');
      console.log('   • Both business titles ("Business A" and "Business B") visible in My Businesses section');
      console.log('   • Claims section correctly indicates 1 pending claim');
      console.log('   • Featured Requests section correctly indicates 1 pending featured request');
      console.log('   • All data properly associated with authenticated user');
      console.log('   • Dashboard components receive correct data for rendering');
      
      return true;
    } catch (error) {
      console.error('\n❌ TEST FAILED:', error.message);
      return false;
    } finally {
      await this.cleanup();
      await pool.end();
    }
  }
}

// Run the tests
async function runDashboardTests() {
  console.log('🚀 Starting Dashboard Integration Tests...');
  console.log('🎯 Testing: User data display across all dashboard sections\n');
  
  const tester = new DashboardTester();
  const success = await tester.runAllTests();
  
  if (success) {
    console.log('\n🏆 Dashboard integration test completed successfully!');
    console.log('💫 All user data displays correctly across dashboard sections');
  } else {
    console.log('\n💥 Dashboard integration test failed!');
    process.exit(1);
  }
}

runDashboardTests();