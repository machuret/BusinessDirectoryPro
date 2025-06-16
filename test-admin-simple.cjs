/**
 * Simple test to isolate the featured business update issue
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
          cookies: cookies,
          headers: res.headers
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

async function testSimple() {
  console.log('Testing Featured Business Update Issue');
  
  try {
    // Create admin user
    const adminEmail = `admin-simple-${Date.now()}@test.com`;
    console.log('\n1. Creating admin user...');
    
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Simple'
    });
    
    if (registerResponse.status !== 201) {
      console.log('Registration failed:', registerResponse.status, registerResponse.data);
      return;
    }
    
    const adminCookie = registerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log('Admin user created');
    
    // Test admin businesses endpoint
    console.log('\n2. Testing admin businesses endpoint...');
    const businessesResponse = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
    
    console.log('Response status:', businessesResponse.status);
    console.log('Response content-type:', businessesResponse.headers['content-type']);
    
    if (businessesResponse.status === 200) {
      try {
        const businesses = JSON.parse(businessesResponse.data);
        console.log(`Found ${businesses.length} businesses`);
        
        if (businesses.length > 0) {
          const testBusiness = businesses[0];
          console.log(`Test business: ${testBusiness.title} (featured: ${testBusiness.featured})`);
          
          // Test update with simple featured toggle
          console.log('\n3. Testing business update...');
          const updateData = { featured: !testBusiness.featured };
          console.log('Update data:', updateData);
          
          const updateResponse = await makeRequest('PATCH', `/api/admin/businesses/${testBusiness.placeid}`, 
            updateData, adminCookie);
          
          console.log('Update response status:', updateResponse.status);
          console.log('Update response content-type:', updateResponse.headers['content-type']);
          console.log('Update response length:', updateResponse.data.length);
          console.log('First 200 chars:', updateResponse.data.substring(0, 200));
          
          if (updateResponse.status === 200) {
            try {
              const updatedBusiness = JSON.parse(updateResponse.data);
              console.log('SUCCESS: Business updated');
              console.log(`New featured status: ${updatedBusiness.featured}`);
            } catch (parseError) {
              console.log('ERROR: Response is not valid JSON');
              console.log('Raw response:', updateResponse.data.substring(0, 500));
            }
          } else {
            console.log('ERROR: Update failed');
            console.log('Error response:', updateResponse.data);
          }
        }
      } catch (parseError) {
        console.log('ERROR: Cannot parse businesses response');
        console.log('Raw response:', businessesResponse.data.substring(0, 500));
      }
    } else {
      console.log('ERROR: Admin businesses endpoint failed');
      console.log('Error response:', businessesResponse.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSimple();