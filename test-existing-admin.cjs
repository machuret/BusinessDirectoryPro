/**
 * Test with existing admin user and complete featured requests workflow
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

async function testExistingAdmin() {
  console.log('Testing with existing admin user');
  
  try {
    // Test login with existing admin
    console.log('\n1. Testing admin login...');
    const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@businesshub.com',
      password: 'admin123'
    });
    
    if (adminLoginResponse.status === 200) {
      const admin = JSON.parse(adminLoginResponse.data);
      const adminCookie = adminLoginResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   Admin login successful, role:', admin.role);
      
      if (admin.role === 'admin') {
        // Test admin featured requests endpoint
        console.log('\n2. Testing admin featured requests endpoint...');
        const adminFeaturedResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
        
        console.log('   Response status:', adminFeaturedResponse.status);
        
        if (adminFeaturedResponse.status === 200) {
          const requests = JSON.parse(adminFeaturedResponse.data);
          console.log('   SUCCESS: Admin featured requests working!');
          console.log('   Found', requests.length, 'featured requests');
          
          // Create a test user and featured request to populate admin view
          console.log('\n3. Creating test data for admin review...');
          const userResponse = await makeRequest('POST', '/api/auth/register', {
            email: `testuser${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'Business Owner'
          });
          
          if (userResponse.status === 201) {
            const userCookie = userResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
            
            // Get available businesses
            const businessesResponse = await makeRequest('GET', '/api/businesses', null, userCookie);
            if (businessesResponse.status === 200) {
              const businesses = JSON.parse(businessesResponse.data);
              if (businesses.length > 0) {
                // Try to use a business for featured request
                const businessId = businesses[0].placeid;
                const featuredResponse = await makeRequest('POST', '/api/featured-requests', {
                  businessId: businessId,
                  message: 'Please feature our amazing business!'
                }, userCookie);
                
                if (featuredResponse.status === 201) {
                  console.log('   Test featured request created');
                  
                  // Check admin view again
                  const updatedAdminResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
                  if (updatedAdminResponse.status === 200) {
                    const updatedRequests = JSON.parse(updatedAdminResponse.data);
                    console.log('   Admin now sees', updatedRequests.length, 'featured requests');
                    
                    if (updatedRequests.length > 0) {
                      console.log('\n4. Testing request approval...');
                      const approvalResponse = await makeRequest('PATCH', `/api/featured-requests/${updatedRequests[0].id}/status`, {
                        status: 'approved',
                        adminMessage: 'Great business! Approved for featuring.'
                      }, adminCookie);
                      
                      if (approvalResponse.status === 200) {
                        console.log('   Request approval successful!');
                        console.log('\n✅ ADMIN FEATURED REQUESTS FULLY WORKING!');
                      } else {
                        console.log('   Approval failed:', approvalResponse.status, approvalResponse.data);
                      }
                    }
                  }
                } else {
                  console.log('   Featured request failed:', featuredResponse.status, featuredResponse.data);
                }
              }
            }
          }
        } else {
          console.log('   Admin endpoint failed:', adminFeaturedResponse.status, adminFeaturedResponse.data);
        }
      } else {
        console.log('   Admin user role issue:', admin.role);
      }
    } else {
      console.log('   Admin login failed:', adminLoginResponse.status, adminLoginResponse.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testExistingAdmin();