/**
 * Complete test of admin featured requests with unique admin email
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

async function testCompleteAdminWorkflow() {
  console.log('Testing Complete Admin Featured Requests Workflow');
  
  try {
    // 1. Create admin with unique timestamp email
    const timestamp = Date.now();
    const adminEmail = `admin${timestamp}@test.com`;
    
    console.log('\n1. Creating admin user with email:', adminEmail);
    const adminResponse = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    if (adminResponse.status === 201) {
      const admin = JSON.parse(adminResponse.data);
      const adminCookie = adminResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
      console.log('   Admin created with role:', admin.role);
      
      if (admin.role === 'admin') {
        console.log('   SUCCESS: Admin role correctly assigned');
        
        // 2. Test admin endpoint access
        console.log('\n2. Testing admin featured requests endpoint...');
        const adminTestResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
        
        if (adminTestResponse.status === 200) {
          const requests = JSON.parse(adminTestResponse.data);
          console.log('   SUCCESS: Admin can access featured requests');
          console.log('   Current requests in system:', requests.length);
          
          // 3. Create business owner and featured request
          console.log('\n3. Setting up test business scenario...');
          const ownerEmail = `owner${timestamp}@example.com`;
          const ownerResponse = await makeRequest('POST', '/api/auth/register', {
            email: ownerEmail,
            password: 'password123',
            firstName: 'Business',
            lastName: 'Owner'
          });
          
          if (ownerResponse.status === 201) {
            const ownerCookie = ownerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
            
            // Get user's businesses
            const businessesResponse = await makeRequest('GET', '/api/user/businesses', null, ownerCookie);
            if (businessesResponse.status === 200) {
              const businesses = JSON.parse(businessesResponse.data);
              
              if (businesses.length > 0) {
                // Create featured request
                console.log('   Creating featured request for business:', businesses[0].title || businesses[0].placeid);
                const featuredResponse = await makeRequest('POST', '/api/featured-requests', {
                  businessId: businesses[0].placeid,
                  message: 'We would love to be featured! Our business provides excellent service to the community.'
                }, ownerCookie);
                
                if (featuredResponse.status === 201) {
                  const newRequest = JSON.parse(featuredResponse.data);
                  console.log('   Featured request created with ID:', newRequest.id);
                  
                  // 4. Admin reviews new request
                  console.log('\n4. Admin reviewing featured requests...');
                  const updatedResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
                  
                  if (updatedResponse.status === 200) {
                    const updatedRequests = JSON.parse(updatedResponse.data);
                    console.log('   Admin now sees', updatedRequests.length, 'total requests');
                    
                    const targetRequest = updatedRequests.find(r => r.id === newRequest.id);
                    if (targetRequest) {
                      console.log('   Request details:', {
                        id: targetRequest.id,
                        status: targetRequest.status,
                        businessTitle: targetRequest.businessTitle || 'No title',
                        message: targetRequest.message.substring(0, 50) + '...'
                      });
                      
                      // 5. Admin approves the request
                      console.log('\n5. Admin approving featured request...');
                      const approvalResponse = await makeRequest('PATCH', `/api/featured-requests/${targetRequest.id}/status`, {
                        status: 'approved',
                        adminMessage: 'Excellent business! We are happy to feature you on our platform.'
                      }, adminCookie);
                      
                      if (approvalResponse.status === 200) {
                        const approvedRequest = JSON.parse(approvalResponse.data);
                        console.log('   SUCCESS: Request approved');
                        console.log('   Status:', approvedRequest.status);
                        console.log('   Admin message:', approvedRequest.adminMessage);
                        
                        // 6. Verify user can see the approval
                        console.log('\n6. Verifying user sees approval...');
                        const userViewResponse = await makeRequest('GET', `/api/featured-requests/user/${ownerResponse.data.match(/"id":"([^"]+)"/)[1]}`, null, ownerCookie);
                        
                        if (userViewResponse.status === 200) {
                          const userRequests = JSON.parse(userViewResponse.data);
                          const userRequest = userRequests.find(r => r.id === newRequest.id);
                          
                          if (userRequest && userRequest.status === 'approved') {
                            console.log('   SUCCESS: User can see approved status');
                            
                            console.log('\n✅ COMPLETE ADMIN FEATURED REQUESTS WORKFLOW SUCCESSFUL!');
                            console.log('\nFunctionality verified:');
                            console.log('   ✓ Admin user creation with proper role');
                            console.log('   ✓ Admin authentication and access control');
                            console.log('   ✓ Featured requests submission by business owners');
                            console.log('   ✓ Admin review interface displaying all requests');
                            console.log('   ✓ Request approval workflow with admin messages');
                            console.log('   ✓ Status updates visible to users');
                            
                            console.log('\nAdmin credentials for future use:');
                            console.log('   Email:', adminEmail);
                            console.log('   Password: admin123');
                            
                            return;
                          }
                        }
                      } else {
                        console.log('   Approval failed:', approvalResponse.status, approvalResponse.data);
                      }
                    } else {
                      console.log('   Could not find the new request in admin view');
                    }
                  }
                } else {
                  console.log('   Featured request creation failed:', featuredResponse.status, featuredResponse.data);
                }
              } else {
                console.log('   No businesses available for user - this is expected for new users');
                console.log('   Featured requests require business ownership verification');
              }
            }
          }
        } else {
          console.log('   Admin endpoint access failed:', adminTestResponse.status, adminTestResponse.data);
        }
      } else {
        console.log('   ERROR: Admin role not assigned correctly, got:', admin.role);
      }
    } else {
      console.log('   Admin creation failed:', adminResponse.status, adminResponse.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCompleteAdminWorkflow();