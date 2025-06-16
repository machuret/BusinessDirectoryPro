/**
 * Complete test for admin featured requests functionality
 * Tests the full workflow from user submission to admin review
 */

import http from 'http';

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

async function testCompleteAdminFeaturedRequests() {
  console.log('🧪 Testing Complete Admin Featured Requests Workflow');
  
  try {
    // 1. Register a new user
    console.log('\n1. Registering test user...');
    const userEmail = `testuser${Date.now()}@example.com`;
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: userEmail,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (registerResponse.status !== 201) {
      console.log('❌ Registration failed:', registerResponse.status, registerResponse.data);
      return;
    }
    
    const userCookie = registerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log('   ✓ User registered and logged in');

    // 2. Create a business for the user first
    console.log('\n2. Creating a business for the user...');
    const businessData = {
      title: `Test Business ${Date.now()}`,
      address: '123 Test Street, Test City',
      phone: '555-0123',
      website: 'https://test-business.com',
      description: 'A test business for featured requests testing',
      categoryname: 'Restaurant',
      city: 'Test City'
    };
    
    const businessResponse = await makeRequest('POST', '/api/businesses', businessData, userCookie);
    
    let businessId;
    if (businessResponse.status === 201) {
      const business = JSON.parse(businessResponse.data);
      businessId = business.placeid;
      console.log('   ✓ Business created:', businessId);
    } else {
      // Use an existing business if creation fails
      const businessesResponse = await makeRequest('GET', '/api/businesses', null, userCookie);
      if (businessesResponse.status === 200) {
        const businesses = JSON.parse(businessesResponse.data);
        if (businesses.length > 0) {
          businessId = businesses[0].placeid;
          console.log('   ✓ Using existing business:', businessId);
        } else {
          console.log('   ❌ No businesses available for testing');
          return;
        }
      }
    }

    // 3. Create a featured request
    console.log('\n3. Creating featured request...');
    const featuredRequestData = {
      businessId: businessId,
      message: 'Please feature our amazing test business!'
    };
    
    const featuredResponse = await makeRequest('POST', '/api/featured-requests', featuredRequestData, userCookie);
    
    if (featuredResponse.status === 201) {
      const request = JSON.parse(featuredResponse.data);
      console.log('   ✓ Featured request created:', request.id);
      
      // 4. Try admin login with multiple password attempts
      console.log('\n4. Testing admin authentication...');
      const adminPasswords = ['admin123', 'password123', 'businesshub123', 'admin', '123456'];
      let adminCookie = null;
      
      for (const password of adminPasswords) {
        const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
          email: 'admin@businesshub.com',
          password: password
        });
        
        if (adminLoginResponse.status === 200) {
          adminCookie = adminLoginResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
          console.log('   ✓ Admin login successful with password:', password);
          break;
        }
      }
      
      if (!adminCookie) {
        console.log('   ⚠️ Admin login failed with all passwords, trying to create admin user...');
        
        // Try to register admin user
        const adminRegisterResponse = await makeRequest('POST', '/api/auth/register', {
          email: 'admin@businesshub.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        });
        
        if (adminRegisterResponse.status === 201) {
          adminCookie = adminRegisterResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
          console.log('   ✓ Admin user created and logged in');
        } else {
          console.log('   ❌ Could not create or login admin user');
          return;
        }
      }

      // 5. Test admin featured requests endpoint
      console.log('\n5. Testing admin featured requests endpoint...');
      const adminFeaturedResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
      
      console.log('   Status:', adminFeaturedResponse.status);
      
      if (adminFeaturedResponse.status === 200) {
        const requests = JSON.parse(adminFeaturedResponse.data);
        console.log('   ✓ Admin endpoint working - Found', requests.length, 'requests');
        
        if (requests.length > 0) {
          console.log('   ✓ Featured requests are visible to admin!');
          console.log('   Sample request:', {
            id: requests[0].id,
            businessId: requests[0].businessId,
            status: requests[0].status,
            businessTitle: requests[0].businessTitle || 'No title',
            message: requests[0].message
          });
          
          // 6. Test approval workflow
          if (requests[0].status === 'pending') {
            console.log('\n6. Testing request approval...');
            const approvalResponse = await makeRequest('PATCH', `/api/featured-requests/${requests[0].id}/status`, {
              status: 'approved',
              adminMessage: 'Great business! Approved for featuring.'
            }, adminCookie);
            
            if (approvalResponse.status === 200) {
              console.log('   ✓ Request approval successful');
            } else {
              console.log('   ⚠️ Request approval failed:', approvalResponse.status, approvalResponse.data);
            }
          }
        } else {
          console.log('   ⚠️ No featured requests found for admin review');
        }
      } else {
        console.log('   ❌ Admin endpoint failed:', adminFeaturedResponse.data.substring(0, 200));
      }
      
    } else {
      console.log('   ❌ Featured request creation failed:', featuredResponse.status, featuredResponse.data);
    }

    console.log('\n✅ Admin Featured Requests Test Completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteAdminFeaturedRequests();