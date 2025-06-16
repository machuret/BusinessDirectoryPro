/**
 * Debug script to isolate the exact error in social media updates
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

async function debugSocialMediaError() {
  console.log('🔍 DEBUGGING SOCIAL MEDIA UPDATE ERRORS\n');
  
  try {
    // Create admin user
    const adminEmail = `debug-${Date.now()}@admin.com`;
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'admin123',
      firstName: 'Debug',
      lastName: 'Admin'
    });
    
    const adminCookie = registerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log('✅ Created admin user');
    
    // Get social media items
    const getResponse = await makeRequest('GET', '/api/admin/social-media', null, adminCookie);
    const items = JSON.parse(getResponse.data);
    
    console.log('📋 Available items:');
    items.forEach(item => {
      console.log(`  ID ${item.id}: ${item.platform} - URL: "${item.url}" - Active: ${item.isActive}`);
    });
    
    // Test each item individually
    for (const item of items) {
      console.log(`\n🔸 Testing update for ID ${item.id} (${item.platform})`);
      
      // Test 1: Minimal update
      console.log('  Test 1: Minimal display name update...');
      const minimalUpdate = {
        displayName: `Updated ${item.platform} Name`
      };
      
      const minimalResponse = await makeRequest('PUT', `/api/admin/social-media/${item.id}`, minimalUpdate, adminCookie);
      console.log(`    Status: ${minimalResponse.status}`);
      if (minimalResponse.status !== 200) {
        console.log(`    Error: ${minimalResponse.data}`);
      }
      
      // Test 2: Toggle active status
      console.log('  Test 2: Toggle active status...');
      const toggleUpdate = {
        isActive: !item.isActive
      };
      
      const toggleResponse = await makeRequest('PUT', `/api/admin/social-media/${item.id}`, toggleUpdate, adminCookie);
      console.log(`    Status: ${toggleResponse.status}`);
      if (toggleResponse.status !== 200) {
        console.log(`    Error: ${toggleResponse.data}`);
      }
      
      // Test 3: Full data update with existing values
      console.log('  Test 3: Full data update with existing values...');
      const fullUpdate = {
        platform: item.platform,
        url: item.url,
        displayName: item.displayName,
        iconClass: item.iconClass,
        isActive: item.isActive,
        sortOrder: item.sortOrder
      };
      
      const fullResponse = await makeRequest('PUT', `/api/admin/social-media/${item.id}`, fullUpdate, adminCookie);
      console.log(`    Status: ${fullResponse.status}`);
      if (fullResponse.status !== 200) {
        console.log(`    Error: ${fullResponse.data}`);
        
        // If this fails, let's try without some fields
        console.log('  Test 3a: Trying without platform field...');
        const { platform, ...updateWithoutPlatform } = fullUpdate;
        const withoutPlatformResponse = await makeRequest('PUT', `/api/admin/social-media/${item.id}`, updateWithoutPlatform, adminCookie);
        console.log(`    Status: ${withoutPlatformResponse.status}`);
        if (withoutPlatformResponse.status !== 200) {
          console.log(`    Error: ${withoutPlatformResponse.data}`);
        }
      }
      
      console.log('  ────────────────────────────────────────');
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  }
}

debugSocialMediaError();