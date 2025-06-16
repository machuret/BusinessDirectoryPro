/**
 * Direct fix for admin user role in database
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

async function fixAdminRole() {
  console.log('Fixing admin user role and testing functionality');
  
  try {
    // 1. Create new admin with working email pattern
    console.log('\n1. Creating new admin with fixed email pattern...');
    const adminResponse = await makeRequest('POST', '/api/auth/register', {
      email: 'admin@test.com',
      password: 'admin123',
      firstName: 'Test',
      lastName: 'Admin'
    });
    
    if (adminResponse.status === 201) {
      const admin = JSON.parse(adminResponse.data);
      const adminCookie = adminResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   New admin created with role:', admin.role);
      
      if (admin.role === 'admin') {
        console.log('   SUCCESS: Admin role assigned correctly!');
        
        // 2. Test admin featured requests endpoint
        console.log('\n2. Testing admin featured requests access...');
        const adminTestResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
        
        console.log('   Response status:', adminTestResponse.status);
        
        if (adminTestResponse.status === 200) {
          const requests = JSON.parse(adminTestResponse.data);
          console.log('   SUCCESS: Admin featured requests working!');
          console.log('   Found', requests.length, 'featured requests');
          
          // 3. Create test user and featured request for demo
          console.log('\n3. Creating test scenario...');
          const userResponse = await makeRequest('POST', '/api/auth/register', {
            email: `testowner${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Business',
            lastName: 'Owner'
          });
          
          if (userResponse.status === 201) {
            const userCookie = userResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
            
            // Get user's businesses
            const businessesResponse = await makeRequest('GET', '/api/user/businesses', null, userCookie);
            if (businessesResponse.status === 200) {
              const businesses = JSON.parse(businessesResponse.data);
              
              if (businesses.length > 0) {
                // Create featured request
                const featuredResponse = await makeRequest('POST', '/api/featured-requests', {
                  businessId: businesses[0].placeid,
                  message: 'Please consider featuring our business!'
                }, userCookie);
                
                if (featuredResponse.status === 201) {
                  console.log('   Featured request created');
                  
                  // 4. Admin reviews and approves
                  const reviewResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
                  if (reviewResponse.status === 200) {
                    const reviewRequests = JSON.parse(reviewResponse.data);
                    console.log('   Admin sees', reviewRequests.length, 'total requests');
                    
                    if (reviewRequests.length > 0) {
                      const latestRequest = reviewRequests[reviewRequests.length - 1];
                      
                      // Approve the request
                      const approvalResponse = await makeRequest('PATCH', `/api/featured-requests/${latestRequest.id}/status`, {
                        status: 'approved',
                        adminMessage: 'Great business! Approved for featuring.'
                      }, adminCookie);
                      
                      if (approvalResponse.status === 200) {
                        console.log('   Request approved successfully!');
                        
                        console.log('\n✅ ADMIN FEATURED REQUESTS FULLY FUNCTIONAL!');
                        console.log('\nCredentials for admin access:');
                        console.log('Email: admin@test.com');
                        console.log('Password: admin123');
                        console.log('\nThe admin can now:');
                        console.log('- View all featured requests');
                        console.log('- Approve/reject requests');
                        console.log('- Add admin messages');
                        
                        return;
                      }
                    }
                  }
                }
              } else {
                console.log('   No businesses available - creating featured requests requires business ownership');
              }
            }
          }
        } else {
          console.log('   Admin access still failing:', adminTestResponse.status, adminTestResponse.data);
        }
      } else {
        console.log('   Role assignment still not working, got:', admin.role);
      }
    } else {
      console.log('   Admin creation failed:', adminResponse.status, adminResponse.data);
    }
    
  } catch (error) {
    console.error('Fix failed:', error.message);
  }
}

fixAdminRole();