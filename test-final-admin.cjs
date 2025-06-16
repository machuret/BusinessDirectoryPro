/**
 * Final test of complete admin featured requests functionality
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

async function testCompleteWorkflow() {
  console.log('Testing Complete Admin Featured Requests Workflow');
  
  try {
    // 1. Register admin user with fixed authentication
    console.log('\n1. Creating admin user...');
    const adminResponse = await makeRequest('POST', '/api/auth/register', {
      email: 'admin@businessdirectory.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    if (adminResponse.status === 201) {
      const admin = JSON.parse(adminResponse.data);
      const adminCookie = adminResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   Admin created with role:', admin.role);
      
      if (admin.role === 'admin') {
        console.log('   SUCCESS: Admin role assigned correctly');
        
        // 2. Test admin featured requests endpoint
        console.log('\n2. Testing admin featured requests access...');
        const adminTestResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
        
        if (adminTestResponse.status === 200) {
          const requests = JSON.parse(adminTestResponse.data);
          console.log('   SUCCESS: Admin can access featured requests');
          console.log('   Found', requests.length, 'existing requests');
          
          // 3. Create test user and business for complete workflow
          console.log('\n3. Creating test business owner...');
          const userResponse = await makeRequest('POST', '/api/auth/register', {
            email: `businessowner${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Business',
            lastName: 'Owner'
          });
          
          if (userResponse.status === 201) {
            const userCookie = userResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
            
            // Get existing businesses to use for featured request
            const businessesResponse = await makeRequest('GET', '/api/businesses', null, userCookie);
            if (businessesResponse.status === 200) {
              const businesses = JSON.parse(businessesResponse.data);
              
              if (businesses.length > 0) {
                // Find a business this user could potentially own or use first available
                const businessId = businesses[0].placeid;
                
                // 4. Create featured request
                console.log('\n4. Creating featured request...');
                const featuredResponse = await makeRequest('POST', '/api/featured-requests', {
                  businessId: businessId,
                  message: 'Please feature our excellent business! We provide great service to the community.'
                }, userCookie);
                
                if (featuredResponse.status === 201) {
                  const request = JSON.parse(featuredResponse.data);
                  console.log('   Featured request created:', request.id);
                  
                  // 5. Admin reviews the new request
                  console.log('\n5. Admin reviewing new requests...');
                  const updatedRequestsResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
                  
                  if (updatedRequestsResponse.status === 200) {
                    const updatedRequests = JSON.parse(updatedRequestsResponse.data);
                    console.log('   Admin now sees', updatedRequests.length, 'total requests');
                    
                    // Find the new request
                    const newRequest = updatedRequests.find(r => r.id === request.id);
                    if (newRequest) {
                      console.log('   New request details:', {
                        id: newRequest.id,
                        status: newRequest.status,
                        businessTitle: newRequest.businessTitle || 'No title',
                        message: newRequest.message
                      });
                      
                      // 6. Approve the request
                      console.log('\n6. Admin approving request...');
                      const approvalResponse = await makeRequest('PATCH', `/api/featured-requests/${newRequest.id}/status`, {
                        status: 'approved',
                        adminMessage: 'Excellent business! Approved for featured status.'
                      }, adminCookie);
                      
                      if (approvalResponse.status === 200) {
                        console.log('   SUCCESS: Request approved by admin');
                        
                        // 7. Verify final state
                        console.log('\n7. Verifying final state...');
                        const finalResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
                        if (finalResponse.status === 200) {
                          const finalRequests = JSON.parse(finalResponse.data);
                          const approvedRequest = finalRequests.find(r => r.id === request.id);
                          
                          if (approvedRequest && approvedRequest.status === 'approved') {
                            console.log('   SUCCESS: Request status updated to approved');
                            console.log('   Admin message:', approvedRequest.adminMessage);
                            
                            console.log('\n✅ COMPLETE ADMIN FEATURED REQUESTS WORKFLOW SUCCESSFUL!');
                            console.log('   - Admin user creation: Working');
                            console.log('   - Role-based access control: Working');
                            console.log('   - Featured requests display: Working');
                            console.log('   - Request submission: Working');
                            console.log('   - Admin review interface: Working');
                            console.log('   - Request approval workflow: Working');
                            
                            return;
                          }
                        }
                      } else {
                        console.log('   Approval failed:', approvalResponse.status, approvalResponse.data);
                      }
                    }
                  }
                } else {
                  console.log('   Featured request failed:', featuredResponse.status, featuredResponse.data);
                }
              } else {
                console.log('   No businesses available for testing');
              }
            }
          }
        } else {
          console.log('   Admin access failed:', adminTestResponse.status, adminTestResponse.data);
        }
      } else {
        console.log('   Role assignment failed, got role:', admin.role);
      }
    } else if (adminResponse.status === 400) {
      console.log('   Admin user already exists, testing login...');
      
      const loginResponse = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@businessdirectory.com',
        password: 'admin123'
      });
      
      if (loginResponse.status === 200) {
        const admin = JSON.parse(loginResponse.data);
        console.log('   Existing admin login successful, role:', admin.role);
      }
    } else {
      console.log('   Admin creation failed:', adminResponse.status, adminResponse.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCompleteWorkflow();