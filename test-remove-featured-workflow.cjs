/**
 * Test the exact remove featured business workflow
 * Simulates browser behavior step by step
 */

const http = require('http');

async function makeRequest(method, path, data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        resolve({
          status: res.statusCode,
          data: responseData,
          cookies: cookies,
          headers: res.headers
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testRemoveFeaturedWorkflow() {
  console.log('Testing Remove Featured Business Workflow');
  console.log('Simulating exact browser behavior...\n');
  
  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@businesshub.com', 
      password: 'admin123'
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.status, loginResponse.data);
      return;
    }
    
    const adminCookie = loginResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log('✅ Admin logged in successfully');
    
    // Step 2: Get current businesses list
    console.log('\n2. Fetching businesses list...');
    const businessesResponse = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
    
    if (businessesResponse.status !== 200) {
      console.log('❌ Failed to fetch businesses:', businessesResponse.status);
      return;
    }
    
    const businesses = JSON.parse(businessesResponse.data);
    const featuredBusinesses = businesses.filter(b => b.featured);
    console.log(`✅ Found ${businesses.length} total businesses, ${featuredBusinesses.length} featured`);
    
    if (featuredBusinesses.length === 0) {
      // Add a business to featured first
      console.log('\n3. No featured businesses found, adding one for testing...');
      const nonFeatured = businesses.find(b => !b.featured);
      if (nonFeatured) {
        const addResponse = await makeRequest('PATCH', `/api/admin/businesses/${nonFeatured.placeid}`, 
          { featured: true }, adminCookie);
        
        if (addResponse.status === 200) {
          console.log('✅ Added business to featured for testing');
          
          // Refresh the list
          const refreshResponse = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
          const refreshedBusinesses = JSON.parse(refreshResponse.data);
          featuredBusinesses.push(refreshedBusinesses.find(b => b.placeid === nonFeatured.placeid));
        } else {
          console.log('❌ Failed to add featured business:', addResponse.status, addResponse.data);
          return;
        }
      } else {
        console.log('❌ No businesses available for testing');
        return;
      }
    }
    
    // Step 3: Test removing featured business
    const targetBusiness = featuredBusinesses[0];
    console.log(`\n4. Testing removal of featured business: ${targetBusiness.title}`);
    console.log(`   Business ID: ${targetBusiness.placeid}`);
    console.log(`   Current featured status: ${targetBusiness.featured}`);
    
    // Step 4: Attempt to remove featured status
    console.log('\n5. Sending PATCH request to remove featured status...');
    const removeResponse = await makeRequest('PATCH', `/api/admin/businesses/${targetBusiness.placeid}`, 
      { featured: false }, adminCookie);
    
    console.log(`   Response status: ${removeResponse.status}`);
    console.log(`   Response headers: ${JSON.stringify(removeResponse.headers)}`);
    
    if (removeResponse.status === 200) {
      console.log('✅ API request successful');
      
      try {
        const responseData = JSON.parse(removeResponse.data);
        console.log(`   Updated business featured status: ${responseData.featured}`);
        
        if (responseData.featured === false) {
          console.log('✅ Business successfully removed from featured');
          
          // Step 5: Verify the change persisted
          console.log('\n6. Verifying change persisted...');
          const verifyResponse = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
          
          if (verifyResponse.status === 200) {
            const verifiedBusinesses = JSON.parse(verifyResponse.data);
            const verifiedBusiness = verifiedBusinesses.find(b => b.placeid === targetBusiness.placeid);
            
            if (verifiedBusiness && verifiedBusiness.featured === false) {
              console.log('✅ Change persisted in database');
              
              // Step 6: Check frontend data refresh
              console.log('\n7. Testing if frontend would see the change...');
              console.log(`   Featured businesses before: ${featuredBusinesses.length}`);
              const newFeaturedCount = verifiedBusinesses.filter(b => b.featured).length;
              console.log(`   Featured businesses after: ${newFeaturedCount}`);
              
              if (newFeaturedCount < featuredBusinesses.length) {
                console.log('✅ Frontend would correctly see reduced featured count');
                console.log('\n🎉 REMOVE FEATURED FUNCTIONALITY IS WORKING CORRECTLY');
                console.log('\nIf the browser interface shows issues, the problem is likely:');
                console.log('   - Frontend cache not invalidating properly');
                console.log('   - React Query not refetching data');
                console.log('   - UI state not updating after mutation');
                console.log('   - Toast notification not showing');
              } else {
                console.log('❌ Featured count did not decrease as expected');
              }
            } else {
              console.log('❌ Change did not persist - database issue');
            }
          } else {
            console.log('❌ Failed to verify change:', verifyResponse.status);
          }
        } else {
          console.log('❌ Business featured status was not changed to false');
        }
      } catch (parseError) {
        console.log('❌ Failed to parse response:', removeResponse.data);
      }
    } else {
      console.log('❌ API request failed');
      console.log(`   Error: ${removeResponse.data}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testRemoveFeaturedWorkflow();