/**
 * Test script to verify featured requests functionality after authentication fix
 */

const API_BASE = 'http://localhost:5000';

async function testFeaturedRequestsFixed() {
  console.log('🧪 Testing Featured Requests (Authentication Fixed)\n');
  
  try {
    // 1. Login with existing user
    console.log('1. Logging in with existing user...');
    const loginResult = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'militardataintelligence@gmail.com',
        password: 'yourpassword'
      })
    });
    
    const loginData = await loginResult.json();
    console.log(`   Login: ${loginResult.status} - ${loginData.firstName || 'Success'}`);
    
    if (loginResult.status !== 200) {
      throw new Error('Login failed');
    }
    
    const cookies = loginResult.headers.get('set-cookie');
    const requestHeaders = { 'Cookie': cookies || '' };
    
    // 2. Test get featured requests for user
    console.log('\n2. Testing get featured requests...');
    const getFeaturedResult = await fetch(`${API_BASE}/api/featured-requests/user/${loginData.id}`, {
      headers: requestHeaders
    });
    
    const featuredData = await getFeaturedResult.json();
    console.log(`   Get featured requests: ${getFeaturedResult.status} - Found ${featuredData.length} requests`);
    
    // 3. Get user businesses to find one for featuring
    console.log('\n3. Getting user businesses...');
    const businessesResult = await fetch(`${API_BASE}/api/user/businesses`, {
      headers: requestHeaders
    });
    
    const businessesData = await businessesResult.json();
    console.log(`   User businesses: ${businessesResult.status} - Found ${businessesData.length} businesses`);
    
    // 4. If user has businesses, try to create a featured request
    if (businessesData.length > 0) {
      const business = businessesData[0];
      console.log(`\n4. Creating featured request for business: ${business.title}`);
      
      const createFeaturedResult = await fetch(`${API_BASE}/api/featured-requests`, {
        method: 'POST',
        headers: {
          ...requestHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: business.placeid,
          message: 'Test featured request - please consider featuring my business'
        })
      });
      
      const createData = await createFeaturedResult.json();
      console.log(`   Create featured request: ${createFeaturedResult.status} - ${createData.id || createData.message}`);
      
      // 5. Re-test get featured requests to see the new one
      if (createFeaturedResult.status === 201) {
        console.log('\n5. Re-testing get featured requests...');
        const updatedFeaturedResult = await fetch(`${API_BASE}/api/featured-requests/user/${loginData.id}`, {
          headers: requestHeaders
        });
        
        const updatedData = await updatedFeaturedResult.json();
        console.log(`   Updated featured requests: ${updatedFeaturedResult.status} - Found ${updatedData.length} requests`);
      }
    } else {
      console.log('\n4. No businesses found to create featured request');
    }
    
    console.log('\n✅ Featured requests authentication test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFeaturedRequestsFixed();