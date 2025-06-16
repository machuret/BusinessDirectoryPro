/**
 * Simple test to verify admin featured requests functionality with existing data
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

async function testAdminFeaturedRequests() {
  console.log('🧪 Testing Admin Featured Requests with Existing Data');
  
  try {
    // 1. Login as existing user who owns businesses
    console.log('\n1. Logging in as existing user...');
    const userLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'militardataintelligence@gmail.com',
      password: 'password123'
    });
    
    if (userLoginResponse.status === 200) {
      const userCookie = userLoginResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   ✓ User logged in successfully');
      
      // Get user's businesses
      const businessesResponse = await makeRequest('GET', '/api/user/businesses', null, userCookie);
      if (businessesResponse.status === 200) {
        const businesses = JSON.parse(businessesResponse.data);
        console.log('   Found', businesses.length, 'user businesses');
        
        if (businesses.length > 0) {
          // Create a featured request
          console.log('\n2. Creating featured request...');
          const featuredResponse = await makeRequest('POST', '/api/featured-requests', {
            businessId: businesses[0].placeid,
            message: 'Please feature our business for testing admin functionality!'
          }, userCookie);
          
          if (featuredResponse.status === 201) {
            const request = JSON.parse(featuredResponse.data);
            console.log('   ✓ Featured request created:', request.id);
          } else {
            console.log('   Featured request response:', featuredResponse.status, featuredResponse.data);
          }
        }
      }
    }

    // 2. Login as admin
    console.log('\n3. Testing admin login...');
    const adminPasswords = ['admin123', 'password123', 'businesshub123'];
    let adminCookie = null;
    
    for (const password of adminPasswords) {
      const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@businesshub.com',
        password: password
      });
      
      if (adminLoginResponse.status === 200) {
        adminCookie = adminLoginResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
        console.log('   ✓ Admin login successful');
        break;
      }
    }
    
    if (!adminCookie) {
      console.log('   ⚠️ Admin login failed, creating admin user...');
      const adminRegResponse = await makeRequest('POST', '/api/auth/register', {
        email: 'testadmin@example.com',
        password: 'admin123',
        firstName: 'Test',
        lastName: 'Admin'
      });
      
      if (adminRegResponse.status === 201) {
        adminCookie = adminRegResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
        
        // Update user role to admin manually (this would normally be done in database)
        console.log('   ✓ Test admin user created');
      }
    }

    // 3. Test admin featured requests endpoint
    if (adminCookie) {
      console.log('\n4. Testing admin featured requests endpoint...');
      const adminFeaturedResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
      
      console.log('   Admin endpoint status:', adminFeaturedResponse.status);
      
      if (adminFeaturedResponse.status === 200) {
        try {
          const requests = JSON.parse(adminFeaturedResponse.data);
          console.log('   ✓ Admin endpoint working - Found', requests.length, 'requests');
          
          if (requests.length > 0) {
            console.log('   ✓ Featured requests visible to admin!');
            requests.forEach((req, index) => {
              console.log(`   Request ${index + 1}:`, {
                id: req.id,
                status: req.status,
                businessTitle: req.businessTitle || 'No title',
                businessId: req.businessId,
                message: req.message ? req.message.substring(0, 50) + '...' : 'No message'
              });
            });
          } else {
            console.log('   ⚠️ No featured requests found');
          }
        } catch (e) {
          console.log('   Response is not JSON:', adminFeaturedResponse.data.substring(0, 200));
        }
      } else {
        console.log('   ❌ Admin endpoint failed:', adminFeaturedResponse.data.substring(0, 200));
      }
    }
    
    console.log('\n✅ Admin Featured Requests Test Completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminFeaturedRequests();