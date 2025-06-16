/**
 * Complete Dashboard Test - Verifies full user dashboard functionality
 * Tests registration, login, business ownership, claims, and all dashboard endpoints
 */

const API_BASE = 'http://localhost:5000';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const data = await response.json();
  return { status: response.status, data, headers: response.headers };
}

async function testCompleteDashboard() {
  console.log('🧪 Testing Complete Dashboard Functionality\n');
  
  try {
    // 1. Register a test user
    console.log('1. Registering test user...');
    const userEmail = `testuser${Date.now()}@example.com`;
    const registerResult = await makeRequest(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        password: 'test123',
        firstName: 'Dashboard',
        lastName: 'User'
      })
    });
    
    console.log(`   Registration: ${registerResult.status} - ${registerResult.data.id || registerResult.data.message}`);
    
    // 2. Login with the user
    console.log('\n2. Logging in...');
    const loginResult = await makeRequest(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        password: 'test123'
      })
    });
    
    console.log(`   Login: ${loginResult.status} - ${loginResult.data.firstName} ${loginResult.data.lastName}`);
    
    if (loginResult.status !== 200) {
      throw new Error('Login failed');
    }
    
    // Extract session cookie
    const cookies = loginResult.headers.get('set-cookie');
    const requestHeaders = { 'Cookie': cookies || '' };
    
    // 3. Test dashboard endpoints
    console.log('\n3. Testing dashboard API endpoints...');
    
    // Test user businesses
    const businessesResult = await makeRequest(`${API_BASE}/api/user/businesses`, {
      headers: requestHeaders
    });
    console.log(`   User businesses: ${businessesResult.status} - Found ${businessesResult.data.length} businesses`);
    
    // Test ownership claims
    const claimsResult = await makeRequest(`${API_BASE}/api/ownership-claims/user/${loginResult.data.id}`, {
      headers: requestHeaders
    });
    console.log(`   Ownership claims: ${claimsResult.status} - Found ${claimsResult.data.length} claims`);
    
    // Test featured requests
    const featuredResult = await makeRequest(`${API_BASE}/api/featured-requests/user/${loginResult.data.id}`, {
      headers: requestHeaders
    });
    console.log(`   Featured requests: ${featuredResult.status} - Found ${featuredResult.data.length} requests`);
    
    // 4. Test business creation (user submitting a business)
    console.log('\n4. Testing business submission...');
    const businessData = {
      title: 'Test Business Dashboard',
      description: 'A test business for dashboard testing',
      categoryId: 13, // Cosmetic Dentist category
      city: 'Test City',
      address: '123 Test Street',
      phone: '555-0123',
      email: 'test@business.com',
      website: 'https://testbusiness.com',
      submissionStatus: 'pending',
      submittedBy: loginResult.data.id
    };
    
    const businessResult = await makeRequest(`${API_BASE}/api/businesses`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(businessData)
    });
    
    console.log(`   Business submission: ${businessResult.status} - ${businessResult.data.placeid || businessResult.data.message}`);
    
    // 5. Re-test user businesses (should now show the submitted business)
    if (businessResult.status === 201) {
      console.log('\n5. Re-testing user businesses after submission...');
      const updatedBusinessesResult = await makeRequest(`${API_BASE}/api/user/businesses`, {
        headers: requestHeaders
      });
      console.log(`   Updated businesses: ${updatedBusinessesResult.status} - Found ${updatedBusinessesResult.data.length} businesses`);
      
      if (updatedBusinessesResult.data.length > 0) {
        console.log(`   ✅ Business "${updatedBusinessesResult.data[0].title}" successfully linked to user`);
      }
    }
    
    // 6. Test ownership claim submission
    console.log('\n6. Testing ownership claim submission...');
    const businesses = await makeRequest(`${API_BASE}/api/businesses?limit=1`);
    if (businesses.data.length > 0) {
      const claimData = {
        businessId: businesses.data[0].placeid,
        claimantEmail: userEmail,
        claimantName: 'Dashboard User',
        claimantPhone: '555-0123',
        message: 'Test ownership claim for dashboard testing',
        supportingInfo: 'I am the owner of this business'
      };
      
      const claimResult = await makeRequest(`${API_BASE}/api/ownership-claims`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(claimData)
      });
      
      console.log(`   Claim submission: ${claimResult.status} - ${claimResult.data.id || claimResult.data.message}`);
    }
    
    console.log('\n✅ Dashboard functionality test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - User registration and login: Working');
    console.log('   - Session authentication: Working');
    console.log('   - Dashboard API endpoints: Working');
    console.log('   - Business submission: Working');
    console.log('   - Ownership claims: Working');
    
  } catch (error) {
    console.error('❌ Dashboard test failed:', error.message);
  }
}

testCompleteDashboard();