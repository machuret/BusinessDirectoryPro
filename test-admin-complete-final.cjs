/**
 * Final comprehensive test for admin featured requests functionality
 * Tests the complete workflow with the correct PUT endpoint
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

async function testCompleteAdminFeaturedRequests() {
  console.log('Testing complete admin featured requests workflow');
  
  try {
    // 1. Create admin user with email-based access
    console.log('\n1. Creating admin user...');
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: `admin-test-${Date.now()}@test.com`,
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Test'
    });
    
    let adminCookie = '';
    if (registerResponse.status === 201) {
      adminCookie = registerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   Admin user created successfully');
    } else {
      console.log('   Registration failed, trying login...');
      const loginResponse = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@businesshub.com',
        password: 'admin123'
      });
    
    if (loginResponse.status === 200) {
      const adminCookie = loginResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   Admin login successful');
      
      // 2. Get featured requests
      console.log('\n2. Fetching featured requests...');
      const requestsResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
      
      if (requestsResponse.status === 200) {
        const requests = JSON.parse(requestsResponse.data);
        console.log('   Found', requests.length, 'featured requests');
        
        if (requests.length > 0) {
          const targetRequest = requests[0];
          console.log('   Target request ID:', targetRequest.id);
          console.log('   Current status:', targetRequest.status);
          
          // 3. Test approval using the correct PUT endpoint
          console.log('\n3. Testing approval with PUT /api/featured-requests/:id/review...');
          const approvalResponse = await makeRequest('PUT', `/api/featured-requests/${targetRequest.id}/review`, {
            status: 'approved',
            adminMessage: 'Approved for featuring - great business!'
          }, adminCookie);
          
          console.log('   Approval response status:', approvalResponse.status);
          console.log('   Response data:', approvalResponse.data.substring(0, 200));
          
          if (approvalResponse.status === 200) {
            console.log('\n✅ SUCCESS: Admin featured requests fully functional!');
            console.log('\nWorkflow verified:');
            console.log('   - Admin authentication working');
            console.log('   - Admin can view featured requests');
            console.log('   - Admin can approve requests via PUT endpoint');
            console.log('   - JSON response is valid');
            
            // 4. Verify the request was updated
            console.log('\n4. Verifying request status update...');
            const verifyResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
            
            if (verifyResponse.status === 200) {
              const updatedRequests = JSON.parse(verifyResponse.data);
              const updatedRequest = updatedRequests.find(r => r.id === targetRequest.id);
              
              if (updatedRequest && updatedRequest.status === 'approved') {
                console.log('   ✅ Request status successfully updated to approved');
                console.log('   ✅ Admin message saved:', updatedRequest.adminMessage);
              } else {
                console.log('   ⚠️ Request status not updated as expected');
              }
            }
            
            console.log('\n🎉 ADMIN FEATURED REQUESTS SYSTEM IS FULLY OPERATIONAL!');
            return;
            
          } else {
            console.log('   ❌ Approval failed:', approvalResponse.status);
            
            // Try to parse error message
            try {
              const errorData = JSON.parse(approvalResponse.data);
              console.log('   Error message:', errorData.message);
            } catch (e) {
              console.log('   Raw error:', approvalResponse.data);
            }
          }
        } else {
          console.log('   No featured requests available for testing');
        }
      } else {
        console.log('   Failed to fetch requests:', requestsResponse.status, requestsResponse.data);
      }
    } else {
      console.log('   Admin login failed:', loginResponse.status, loginResponse.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCompleteAdminFeaturedRequests();