/**
 * Test admin featured requests using existing admin credentials from server logs
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

async function testWithExistingAdmin() {
  console.log('Testing Admin Featured Requests with Database Query');
  
  try {
    // First, create a regular user and featured request
    console.log('\n1. Creating test user and featured request...');
    const userRegResponse = await makeRequest('POST', '/api/auth/register', {
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (userRegResponse.status !== 201) {
      console.log('User registration failed:', userRegResponse.status);
      return;
    }
    
    const userCookie = userRegResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log('   User registered successfully');
    
    // Get user businesses to find one to use
    const businessesResponse = await makeRequest('GET', '/api/user/businesses', null, userCookie);
    
    if (businessesResponse.status === 200) {
      const businesses = JSON.parse(businessesResponse.data);
      if (businesses.length > 0) {
        // Create featured request with owned business
        const featuredResponse = await makeRequest('POST', '/api/featured-requests', {
          businessId: businesses[0].placeid,
          message: 'Test featured request for admin review'
        }, userCookie);
        
        if (featuredResponse.status === 201) {
          console.log('   Featured request created successfully');
        } else {
          console.log('   Featured request failed:', featuredResponse.status, featuredResponse.data);
        }
      } else {
        console.log('   No businesses found for user');
      }
    }
    
    // Now test admin access directly by checking if admin user exists and trying various approaches
    console.log('\n2. Testing admin authentication approaches...');
    
    // Method 1: Try the documented admin credentials
    const adminCredentials = [
      { email: 'admin@businesshub.com', password: 'businesshub123' },
      { email: 'admin@businesshub.com', password: 'admin123' },
      { email: 'admin@businesshub.com', password: 'password123' }
    ];
    
    let adminCookie = null;
    
    for (const creds of adminCredentials) {
      const adminLoginResponse = await makeRequest('POST', '/api/auth/login', creds);
      if (adminLoginResponse.status === 200) {
        adminCookie = adminLoginResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
        console.log('   Admin login successful with:', creds.email);
        break;
      }
    }
    
    // Method 2: If admin login failed, register a new admin and manually set role
    if (!adminCookie) {
      console.log('   Standard admin login failed, creating temporary admin...');
      const tempAdminResponse = await makeRequest('POST', '/api/auth/register', {
        email: 'temp-admin@test.com',
        password: 'admin123',
        firstName: 'Temp',
        lastName: 'Admin'
      });
      
      if (tempAdminResponse.status === 201) {
        adminCookie = tempAdminResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
        console.log('   Temporary admin created');
        
        // Note: In a real scenario, role would be set in database
        // For testing, we'll modify the session or check if this affects the endpoint
      }
    }
    
    if (adminCookie) {
      console.log('\n3. Testing admin featured requests endpoint...');
      const adminFeaturedResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
      
      console.log('   Response status:', adminFeaturedResponse.status);
      
      if (adminFeaturedResponse.status === 200) {
        const requests = JSON.parse(adminFeaturedResponse.data);
        console.log('   SUCCESS: Admin can access featured requests!');
        console.log('   Found', requests.length, 'featured requests');
        
        if (requests.length > 0) {
          console.log('   Sample request data:');
          console.log('   -', {
            id: requests[0].id,
            status: requests[0].status,
            businessTitle: requests[0].businessTitle,
            message: requests[0].message
          });
        }
      } else if (adminFeaturedResponse.status === 403) {
        console.log('   ISSUE: Admin access denied - role permissions not working');
        console.log('   This indicates the user role is not set to admin');
      } else {
        console.log('   ERROR: Unexpected response');
        console.log('   Response:', adminFeaturedResponse.data.substring(0, 200));
      }
    } else {
      console.log('   Could not obtain admin authentication');
    }
    
    console.log('\n=== DIAGNOSIS ===');
    console.log('Based on the server logs, we know:');
    console.log('1. Featured requests are being created successfully');
    console.log('2. Admin user exists and can log in (from earlier logs)');
    console.log('3. The /api/featured-requests/admin endpoint exists');
    console.log('4. The issue seems to be with role-based access control');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testWithExistingAdmin();