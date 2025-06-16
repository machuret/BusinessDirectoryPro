/**
 * Comprehensive diagnosis of remove featured business functionality
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
          cookies: cookies
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

async function diagnoseRemoveFeaturedIssue() {
  console.log('Diagnosing Remove Featured Business Issue');
  
  try {
    // Create admin user
    const adminEmail = `admin-diagnose-${Date.now()}@test.com`;
    console.log('1. Creating admin user for testing...');
    
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Diagnose'
    });
    
    if (registerResponse.status !== 201) {
      console.log('Failed to create admin user:', registerResponse.status, registerResponse.data);
      return;
    }
    
    const adminCookie = registerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log('Admin user created successfully');
    
    // Test complete workflow multiple times
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`\n=== ATTEMPT ${attempt}/3 ===`);
      
      // Get businesses
      const businessesResponse = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
      if (businessesResponse.status !== 200) {
        console.log(`Attempt ${attempt}: Failed to get businesses - ${businessesResponse.status}`);
        continue;
      }
      
      const businesses = JSON.parse(businessesResponse.data);
      let featuredBusinesses = businesses.filter(b => b.featured);
      let nonFeaturedBusinesses = businesses.filter(b => !b.featured);
      
      console.log(`Attempt ${attempt}: Found ${businesses.length} businesses (${featuredBusinesses.length} featured)`);
      
      // If no featured businesses, create one
      if (featuredBusinesses.length === 0 && nonFeaturedBusinesses.length > 0) {
        console.log(`Attempt ${attempt}: Adding business to featured for testing...`);
        const targetBusiness = nonFeaturedBusinesses[0];
        
        const addResponse = await makeRequest('PATCH', `/api/admin/businesses/${targetBusiness.placeid}`, 
          { featured: true }, adminCookie);
        
        if (addResponse.status === 200) {
          console.log(`Attempt ${attempt}: Successfully added business to featured`);
          
          // Refresh businesses list
          const refreshResponse = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
          if (refreshResponse.status === 200) {
            const refreshedBusinesses = JSON.parse(refreshResponse.data);
            featuredBusinesses = refreshedBusinesses.filter(b => b.featured);
          }
        } else {
          console.log(`Attempt ${attempt}: Failed to add business to featured - ${addResponse.status}`);
          console.log(`Attempt ${attempt}: Error: ${addResponse.data}`);
          continue;
        }
      }
      
      if (featuredBusinesses.length === 0) {
        console.log(`Attempt ${attempt}: No featured businesses available for testing`);
        continue;
      }
      
      // Test removing featured status
      const targetBusiness = featuredBusinesses[0];
      console.log(`Attempt ${attempt}: Testing removal of ${targetBusiness.title}`);
      console.log(`Attempt ${attempt}: Business ID: ${targetBusiness.placeid}`);
      
      const removeResponse = await makeRequest('PATCH', `/api/admin/businesses/${targetBusiness.placeid}`, 
        { featured: false }, adminCookie);
      
      console.log(`Attempt ${attempt}: Remove response status: ${removeResponse.status}`);
      
      if (removeResponse.status === 200) {
        try {
          const removedBusiness = JSON.parse(removeResponse.data);
          console.log(`Attempt ${attempt}: API returned featured=${removedBusiness.featured}`);
          
          if (removedBusiness.featured === false) {
            console.log(`Attempt ${attempt}: SUCCESS - Business removed from featured`);
            
            // Verify persistence
            const verifyResponse = await makeRequest('GET', `/api/admin/businesses`, null, adminCookie);
            if (verifyResponse.status === 200) {
              const verifiedBusinesses = JSON.parse(verifyResponse.data);
              const verifiedBusiness = verifiedBusinesses.find(b => b.placeid === targetBusiness.placeid);
              
              if (verifiedBusiness && verifiedBusiness.featured === false) {
                console.log(`Attempt ${attempt}: VERIFIED - Change persisted in database`);
              } else {
                console.log(`Attempt ${attempt}: ERROR - Change not persisted`);
              }
              
              const newFeaturedCount = verifiedBusinesses.filter(b => b.featured).length;
              console.log(`Attempt ${attempt}: Featured count after removal: ${newFeaturedCount}`);
            }
          } else {
            console.log(`Attempt ${attempt}: ERROR - Featured status not changed`);
          }
        } catch (parseError) {
          console.log(`Attempt ${attempt}: ERROR - Cannot parse response: ${removeResponse.data}`);
        }
      } else {
        console.log(`Attempt ${attempt}: ERROR - Remove request failed`);
        console.log(`Attempt ${attempt}: Error details: ${removeResponse.data}`);
      }
    }
    
    // Test specific API endpoints that frontend uses
    console.log('\n=== TESTING FRONTEND API COMPATIBILITY ===');
    
    // Test businesses endpoint structure
    const businessesResponse = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
    if (businessesResponse.status === 200) {
      const businesses = JSON.parse(businessesResponse.data);
      if (businesses.length > 0) {
        const sampleBusiness = businesses[0];
        console.log('Sample business structure:');
        console.log(`  placeid: ${sampleBusiness.placeid}`);
        console.log(`  title: ${sampleBusiness.title}`);
        console.log(`  featured: ${sampleBusiness.featured}`);
        console.log(`  categoryname: ${sampleBusiness.categoryname}`);
        console.log(`  city: ${sampleBusiness.city}`);
        console.log(`  createdat: ${sampleBusiness.createdat}`);
      }
    }
    
    // Test React Query cache invalidation scenario
    console.log('\n=== TESTING CACHE INVALIDATION SCENARIO ===');
    
    const businessesResponse1 = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
    if (businessesResponse1.status === 200) {
      const businesses1 = JSON.parse(businessesResponse1.data);
      const featuredCount1 = businesses1.filter(b => b.featured).length;
      console.log(`Initial featured count: ${featuredCount1}`);
      
      // Find a business to toggle
      const toggleBusiness = businesses1.find(b => !b.featured);
      if (toggleBusiness) {
        // Add to featured
        const addResponse = await makeRequest('PATCH', `/api/admin/businesses/${toggleBusiness.placeid}`, 
          { featured: true }, adminCookie);
        
        if (addResponse.status === 200) {
          // Check count after add
          const businessesResponse2 = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
          const businesses2 = JSON.parse(businessesResponse2.data);
          const featuredCount2 = businesses2.filter(b => b.featured).length;
          console.log(`Featured count after add: ${featuredCount2}`);
          
          // Remove from featured
          const removeResponse = await makeRequest('PATCH', `/api/admin/businesses/${toggleBusiness.placeid}`, 
            { featured: false }, adminCookie);
          
          if (removeResponse.status === 200) {
            // Check count after remove
            const businessesResponse3 = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
            const businesses3 = JSON.parse(businessesResponse3.data);
            const featuredCount3 = businesses3.filter(b => b.featured).length;
            console.log(`Featured count after remove: ${featuredCount3}`);
            
            if (featuredCount3 === featuredCount1) {
              console.log('SUCCESS: Add/Remove cycle worked perfectly');
            } else {
              console.log('ERROR: Add/Remove cycle did not return to original state');
            }
          }
        }
      }
    }
    
    console.log('\n=== DIAGNOSIS COMPLETE ===');
    console.log('If API tests pass but browser fails, check:');
    console.log('1. Frontend queryClient.invalidateQueries execution');
    console.log('2. React component state updates');
    console.log('3. Dialog state management');
    console.log('4. Toast notifications');
    console.log('5. Network tab for actual requests sent');
    
  } catch (error) {
    console.error('Diagnosis failed:', error.message);
  }
}

diagnoseRemoveFeaturedIssue();