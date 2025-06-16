/**
 * Fix admin user creation with proper role assignment
 */

const http = require('http');
const crypto = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

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

async function fixAdminUserAndTest() {
  console.log('Fixing admin user and testing featured requests...');
  
  try {
    // Step 1: Create a regular user first to have featured requests to review
    console.log('\n1. Creating test user with business...');
    const userResponse = await makeRequest('POST', '/api/auth/register', {
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (userResponse.status === 201) {
      const user = JSON.parse(userResponse.data);
      const userCookie = userResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   User created:', user.email);
      
      // Assign a business to this user by updating an existing business
      const businessesResponse = await makeRequest('GET', '/api/businesses', null, userCookie);
      if (businessesResponse.status === 200) {
        const businesses = JSON.parse(businessesResponse.data);
        if (businesses.length > 0) {
          const businessId = businesses[0].placeid;
          
          // Create featured request
          const featuredResponse = await makeRequest('POST', '/api/featured-requests', {
            businessId: businessId,
            message: 'Please feature our business!'
          }, userCookie);
          
          if (featuredResponse.status === 201) {
            console.log('   Featured request created successfully');
          } else {
            console.log('   Featured request creation failed - user may not own business');
          }
        }
      }
    }

    // Step 2: Register admin user manually with role fix
    console.log('\n2. Creating admin user...');
    const adminResponse = await makeRequest('POST', '/api/auth/register', {
      email: 'admin@businessdirectory.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    if (adminResponse.status === 201) {
      const admin = JSON.parse(adminResponse.data);
      console.log('   Admin user created:', admin.email);
      console.log('   Note: Role is currently "user" - this is the issue');
      
      // Get admin cookie for further testing
      const adminCookie = adminResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      
      // Test admin endpoint with current permissions
      console.log('\n3. Testing admin endpoint with "user" role...');
      const adminTestResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
      console.log('   Response:', adminTestResponse.status, 
                  adminTestResponse.status === 403 ? 'Admin access required (expected)' : adminTestResponse.data);
    }

    // Step 3: Demonstrate the fix needed
    console.log('\n=== SOLUTION IDENTIFIED ===');
    console.log('The admin featured requests functionality fails because:');
    console.log('1. Registration always creates users with "user" role');
    console.log('2. Admin endpoint checks for role === "admin"');
    console.log('3. No mechanism exists to promote users to admin role');
    console.log('');
    console.log('Fix required: Update user role to "admin" in database or');
    console.log('modify registration to allow admin role assignment');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

fixAdminUserAndTest();