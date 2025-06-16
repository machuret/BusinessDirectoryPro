/**
 * Quick API test to diagnose user dashboard issues for militardataintelligence@gmail.com
 */

const API_BASE = 'http://localhost:5000';

async function makeRequest(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

async function testUserDashboardAPI() {
  console.log('Testing User Dashboard API for militardataintelligence@gmail.com\n');
  
  try {
    // Step 1: Login as militardataintelligence@gmail.com
    console.log('1. Attempting login...');
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'militardataintelligence@gmail.com',
        password: 'password123'
      })
    });
    
    console.log('Login status:', loginResult.status);
    if (loginResult.status !== 200) {
      console.log('Login failed:', loginResult.data);
      console.log('\n❌ Cannot proceed - user login failed');
      return;
    }
    
    console.log('✅ Login successful for:', loginResult.data.email);
    const sessionCookie = `connect.sid=${loginResult.data.sessionId || 'dummy'}`;
    
    // Step 2: Test /api/user/businesses endpoint
    console.log('\n2. Testing /api/user/businesses...');
    const businessesResult = await makeRequest('/api/user/businesses', {
      headers: { 'Cookie': sessionCookie }
    });
    
    console.log('User businesses status:', businessesResult.status);
    console.log('User businesses data:', businessesResult.data);
    
    if (businessesResult.status === 200) {
      console.log('✅ User businesses endpoint working');
      console.log('   Businesses count:', Array.isArray(businessesResult.data) ? businessesResult.data.length : 0);
      if (Array.isArray(businessesResult.data) && businessesResult.data.length > 0) {
        businessesResult.data.forEach((business, index) => {
          console.log(`   Business ${index + 1}: ${business.title} (${business.placeid})`);
        });
      } else {
        console.log('   No businesses found for this user');
      }
    } else {
      console.log('❌ User businesses endpoint failed');
    }
    
    // Step 3: Test ownership claims endpoint
    console.log('\n3. Testing ownership claims...');
    const userId = loginResult.data.id;
    const claimsResult = await makeRequest(`/api/ownership-claims/user/${userId}`, {
      headers: { 'Cookie': sessionCookie }
    });
    
    console.log('Ownership claims status:', claimsResult.status);
    console.log('Ownership claims data:', claimsResult.data);
    
    if (claimsResult.status === 200) {
      console.log('✅ Ownership claims endpoint working');
      console.log('   Claims count:', Array.isArray(claimsResult.data) ? claimsResult.data.length : 0);
      if (Array.isArray(claimsResult.data) && claimsResult.data.length > 0) {
        claimsResult.data.forEach((claim, index) => {
          console.log(`   Claim ${index + 1}: ${claim.businessId} - ${claim.status}`);
        });
      } else {
        console.log('   No ownership claims found for this user');
      }
    } else {
      console.log('❌ Ownership claims endpoint failed');
    }
    
    // Step 4: Check if user exists and has proper data
    console.log('\n4. Checking user profile...');
    const userResult = await makeRequest('/api/user', {
      headers: { 'Cookie': sessionCookie }
    });
    
    console.log('User profile status:', userResult.status);
    if (userResult.status === 200) {
      console.log('✅ User profile accessible');
      console.log('   User ID:', userResult.data.id);
      console.log('   User email:', userResult.data.email);
      console.log('   User role:', userResult.data.role);
    } else {
      console.log('❌ User profile not accessible');
    }
    
    // Step 5: Suggest next steps
    console.log('\n=== DIAGNOSIS SUMMARY ===');
    if (businessesResult.status === 200 && Array.isArray(businessesResult.data) && businessesResult.data.length === 0) {
      console.log('Issue identified: User has no businesses assigned to them');
      console.log('Recommendation: Need to assign businesses to this user or check business ownership data');
    } else if (businessesResult.status !== 200) {
      console.log('Issue identified: API endpoints not working properly');
      console.log('Recommendation: Check authentication and route implementations');
    } else {
      console.log('User dashboard API appears to be working correctly');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

testUserDashboardAPI().then(() => {
  console.log('\nTest completed');
}).catch(error => {
  console.error('Test script error:', error);
});