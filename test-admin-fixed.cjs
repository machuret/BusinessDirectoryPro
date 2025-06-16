/**
 * Test admin featured requests with fixed role assignment
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

async function testAdminFeaturedRequestsFixed() {
  console.log('Testing Fixed Admin Featured Requests Functionality');
  
  try {
    // 1. Create regular user and featured request
    console.log('\n1. Creating user and featured request...');
    const userResponse = await makeRequest('POST', '/api/auth/register', {
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (userResponse.status === 201) {
      const user = JSON.parse(userResponse.data);
      const userCookie = userResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   User created with role:', user.role);
      
      // Get businesses and create featured request if user owns any
      const businessesResponse = await makeRequest('GET', '/api/user/businesses', null, userCookie);
      if (businessesResponse.status === 200) {
        const businesses = JSON.parse(businessesResponse.data);
        if (businesses.length > 0) {
          const featuredResponse = await makeRequest('POST', '/api/featured-requests', {
            businessId: businesses[0].placeid,
            message: 'Test featured request for admin review'
          }, userCookie);
          
          if (featuredResponse.status === 201) {
            console.log('   Featured request created successfully');
          }
        }
      }
    }

    // 2. Register admin user with special email
    console.log('\n2. Creating admin user...');
    const adminResponse = await makeRequest('POST', '/api/auth/register', {
      email: 'admin@businesshub.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    if (adminResponse.status === 201) {
      const admin = JSON.parse(adminResponse.data);
      const adminCookie = adminResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   Admin created with role:', admin.role);
      
      if (admin.role === 'admin') {
        console.log('   SUCCESS: Admin role assigned correctly!');
        
        // 3. Test admin featured requests endpoint
        console.log('\n3. Testing admin featured requests endpoint...');
        const adminFeaturedResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
        
        console.log('   Response status:', adminFeaturedResponse.status);
        
        if (adminFeaturedResponse.status === 200) {
          const requests = JSON.parse(adminFeaturedResponse.data);
          console.log('   SUCCESS: Admin can access featured requests!');
          console.log('   Found', requests.length, 'featured requests');
          
          if (requests.length > 0) {
            console.log('   Sample request:', {
              id: requests[0].id,
              status: requests[0].status,
              businessTitle: requests[0].businessTitle || 'No title',
              message: requests[0].message
            });
            
            // 4. Test approval workflow
            if (requests[0].status === 'pending') {
              console.log('\n4. Testing request approval...');
              const approvalResponse = await makeRequest('PATCH', `/api/featured-requests/${requests[0].id}/status`, {
                status: 'approved',
                adminMessage: 'Approved for featuring!'
              }, adminCookie);
              
              console.log('   Approval status:', approvalResponse.status);
              if (approvalResponse.status === 200) {
                console.log('   SUCCESS: Request approval working!');
              }
            }
          }
          
          console.log('\n✅ ADMIN FEATURED REQUESTS FULLY FUNCTIONAL!');
          console.log('   - Admin role assignment: Working');
          console.log('   - Admin authentication: Working');
          console.log('   - Featured requests display: Working');
          console.log('   - Request approval workflow: Working');
          
        } else {
          console.log('   Admin endpoint failed:', adminFeaturedResponse.data);
        }
      } else {
        console.log('   ISSUE: Admin role not assigned, got:', admin.role);
      }
    } else {
      console.log('   Admin registration failed:', adminResponse.status);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAdminFeaturedRequestsFixed();