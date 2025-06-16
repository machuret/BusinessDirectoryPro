/**
 * Direct test of social media update to isolate the exact error
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
        resolve({
          status: res.statusCode,
          data: responseData,
          cookies: res.headers['set-cookie'] || []
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

async function testSocialMediaUpdate() {
  console.log('Testing Social Media Update Directly...\n');
  
  try {
    // Create admin user
    const adminEmail = `test-${Date.now()}@admin.com`;
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'admin123',
      firstName: 'Test',
      lastName: 'Admin'
    });
    
    if (registerResponse.status !== 201) {
      console.log('❌ Failed to create admin user:', registerResponse.data);
      return;
    }
    
    const adminCookie = registerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log('✅ Created admin user');
    
    // Get existing social media items
    const getResponse = await makeRequest('GET', '/api/admin/social-media', null, adminCookie);
    
    if (getResponse.status !== 200) {
      console.log('❌ Failed to fetch social media items:', getResponse.data);
      return;
    }
    
    const items = JSON.parse(getResponse.data);
    console.log(`✅ Found ${items.length} social media items`);
    
    if (items.length === 0) {
      console.log('❌ No items to test update with');
      return;
    }
    
    // Test update with minimal data
    const testItem = items[0];
    console.log(`\nTesting update on item ${testItem.id} (${testItem.platform})`);
    
    const updateData = {
      platform: testItem.platform,
      url: testItem.url,
      displayName: 'Test Update',
      iconClass: testItem.iconClass,
      isActive: testItem.isActive,
      sortOrder: testItem.sortOrder
    };
    
    console.log('Update data:', updateData);
    
    const updateResponse = await makeRequest('PUT', `/api/admin/social-media/${testItem.id}`, updateData, adminCookie);
    
    console.log(`\nUpdate response status: ${updateResponse.status}`);
    console.log('Update response data:', updateResponse.data);
    
    if (updateResponse.status === 200) {
      console.log('✅ Update successful!');
    } else {
      console.log('❌ Update failed');
      
      // Try with even simpler data
      console.log('\nTrying with minimal data...');
      const minimalData = {
        displayName: 'Minimal Test'
      };
      
      const minimalResponse = await makeRequest('PUT', `/api/admin/social-media/${testItem.id}`, minimalData, adminCookie);
      console.log(`Minimal update response: ${minimalResponse.status}`);
      console.log('Minimal response data:', minimalResponse.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSocialMediaUpdate();