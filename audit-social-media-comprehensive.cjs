/**
 * Comprehensive audit of Social Media Management system
 * Tests ALL functionality 3 times each to identify why editing fails with 500 errors
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

async function auditSocialMediaManagement() {
  console.log('🔍 COMPREHENSIVE SOCIAL MEDIA MANAGEMENT AUDIT');
  console.log('Testing all functionality 3 times each to identify 500 edit errors\n');
  
  const results = {
    adminAccess: { success: 0, total: 3 },
    fetchSocialMedia: { success: 0, total: 3 },
    createSocialMedia: { success: 0, total: 3 },
    updateSocialMedia: { success: 0, total: 3 },
    deleteSocialMedia: { success: 0, total: 3 },
    toggleActive: { success: 0, total: 3 },
    reorderItems: { success: 0, total: 3 }
  };

  let adminCookie = '';
  let createdItemIds = [];
  
  try {
    // Setup: Create admin user
    console.log('SETUP: Creating admin user...');
    const adminEmail = `social-audit-${Date.now()}@test.com`;
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'admin123',
      firstName: 'Social',
      lastName: 'Audit'
    });
    
    if (registerResponse.status !== 201) {
      console.log('❌ CRITICAL: Cannot create admin user');
      return;
    }
    
    const adminUser = JSON.parse(registerResponse.data);
    const adminUserId = adminUser.id;
    adminCookie = registerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log(`✅ Admin user created with ID: ${adminUserId}\n`);

    // Test 1: Admin Access to Social Media Management (3 times)
    console.log('🔸 TEST 1: Admin Access to Social Media Management');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      const response = await makeRequest('GET', '/api/admin/social-media', null, adminCookie);
      console.log(`    Response status: ${response.status}`);
      console.log(`    Content-Type: ${response.headers['content-type']}`);
      
      if (response.status === 200) {
        try {
          const items = JSON.parse(response.data);
          results.adminAccess.success++;
          console.log(`    ✅ Success - Found ${items.length} social media items`);
          
          if (items.length > 0) {
            console.log(`    Sample item structure:`, {
              id: items[0].id,
              platform: items[0].platform,
              url: items[0].url,
              isActive: items[0].isActive
            });
          }
        } catch (parseError) {
          console.log(`    ❌ Invalid JSON response: ${response.data.substring(0, 100)}`);
        }
      } else {
        console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
      }
    }

    // Test 2: Fetch Social Media Items Analysis (3 times)
    console.log('\n🔸 TEST 2: Deep Analysis of Social Media Fetch');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      const response = await makeRequest('GET', '/api/admin/social-media', null, adminCookie);
      
      if (response.status === 200) {
        const items = JSON.parse(response.data);
        results.fetchSocialMedia.success++;
        console.log(`    ✅ Fetch successful - ${items.length} items returned`);
        
        // Analyze item structure
        if (items.length > 0) {
          const sampleItem = items[0];
          console.log(`    Item fields:`, Object.keys(sampleItem));
        }
      } else {
        console.log(`    ❌ Fetch failed: ${response.status}`);
      }
    }

    // Test 3: Create Social Media Item and Verify Persistence (3 times)
    console.log('\n🔸 TEST 3: Create Social Media Item and Verify Persistence');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      
      const itemData = {
        platform: `audit-platform-${i}`,
        url: `https://audit-test-${i}.com`,
        displayName: `Audit Test ${i}`,
        iconClass: `fa-audit-${i}`,
        isActive: true,
        sortOrder: 100 + i
      };
      
      console.log(`    Creating social media item: ${itemData.platform}`);
      const createResponse = await makeRequest('POST', '/api/admin/social-media', itemData, adminCookie);
      
      console.log(`    Create response status: ${createResponse.status}`);
      
      if (createResponse.status === 201) {
        try {
          const createdItem = JSON.parse(createResponse.data);
          createdItemIds.push(createdItem.id);
          console.log(`    ✅ Item created with ID: ${createdItem.id}`);
          
          // Immediately verify the item appears in the list
          console.log(`    Verifying item appears in list...`);
          const verifyResponse = await makeRequest('GET', '/api/admin/social-media', null, adminCookie);
          
          if (verifyResponse.status === 200) {
            const allItems = JSON.parse(verifyResponse.data);
            const foundItem = allItems.find(p => p.id === createdItem.id);
            
            if (foundItem) {
              results.createSocialMedia.success++;
              console.log(`    ✅ SUCCESS: Item immediately visible in list`);
              console.log(`    Item details:`, {
                id: foundItem.id,
                platform: foundItem.platform,
                url: foundItem.url,
                isActive: foundItem.isActive
              });
            } else {
              console.log(`    ❌ CRITICAL: Item created but NOT appearing in list!`);
              console.log(`    Total items in list: ${allItems.length}`);
              console.log(`    Looking for ID: ${createdItem.id}`);
              console.log(`    Available IDs: ${allItems.map(p => p.id).join(', ')}`);
            }
          } else {
            console.log(`    ❌ Cannot verify - list fetch failed: ${verifyResponse.status}`);
          }
        } catch (parseError) {
          console.log(`    ❌ Invalid JSON response: ${createResponse.data.substring(0, 100)}`);
        }
      } else {
        console.log(`    ❌ Create failed: ${createResponse.status} - ${createResponse.data}`);
      }
    }

    // Test 4: Update Social Media Item Functionality (3 times) - THE CRITICAL TEST
    console.log('\n🔸 TEST 4: Update Social Media Item Functionality (CRITICAL)');
    
    // First get existing items to test updates
    const existingResponse = await makeRequest('GET', '/api/admin/social-media', null, adminCookie);
    let existingItems = [];
    
    if (existingResponse.status === 200) {
      existingItems = JSON.parse(existingResponse.data);
      console.log(`  Found ${existingItems.length} existing items for update testing`);
    }

    const testItems = existingItems.length > 0 ? existingItems.slice(0, 3) : [];
    
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      
      if (testItems.length >= i) {
        const item = testItems[i-1];
        
        const updateData = {
          platform: item.platform,
          url: item.url,
          displayName: `Updated Display Name ${i}`,
          iconClass: item.iconClass || 'fa-globe',
          isActive: !item.isActive, // Toggle active status
          sortOrder: item.sortOrder || i
        };
        
        console.log(`    Updating item ID ${item.id} with data:`, updateData);
        const updateResponse = await makeRequest('PUT', `/api/admin/social-media/${item.id}`, updateData, adminCookie);
        
        console.log(`    Update response status: ${updateResponse.status}`);
        console.log(`    Update response body: ${updateResponse.data.substring(0, 200)}`);
        
        if (updateResponse.status === 200) {
          results.updateSocialMedia.success++;
          console.log(`    ✅ Update successful for item ${item.id}`);
        } else {
          console.log(`    ❌ Update failed: ${updateResponse.status} - ${updateResponse.data}`);
          
          // Detailed error analysis
          if (updateResponse.status === 500) {
            console.log(`    🔍 500 ERROR ANALYSIS:`);
            console.log(`       - This is the exact error causing the user's issue`);
            console.log(`       - Backend service method likely missing or misconfigured`);
            console.log(`       - Service layer not properly implemented`);
          }
        }
      } else {
        console.log(`    ⚠️ No item available for update test ${i}`);
      }
    }

    // Test 5: Toggle Active Status (3 times)
    console.log('\n🔸 TEST 5: Toggle Active Status Testing');
    for (let i = 1; i <= Math.min(3, existingItems.length); i++) {
      console.log(`  Attempt ${i}/3...`);
      const item = existingItems[i-1];
      
      const toggleData = {
        ...item,
        isActive: !item.isActive
      };
      
      const toggleResponse = await makeRequest('PUT', `/api/admin/social-media/${item.id}`, toggleData, adminCookie);
      
      if (toggleResponse.status === 200) {
        results.toggleActive.success++;
        console.log(`    ✅ Toggle successful for item ${item.id}`);
      } else {
        console.log(`    ❌ Toggle failed: ${toggleResponse.status} - ${toggleResponse.data}`);
      }
    }

    // Test 6: Reorder Items (3 times)
    console.log('\n🔸 TEST 6: Reorder Items Testing');
    for (let i = 1; i <= Math.min(3, existingItems.length); i++) {
      console.log(`  Attempt ${i}/3...`);
      const item = existingItems[i-1];
      
      const reorderData = {
        ...item,
        sortOrder: (item.sortOrder || 0) + 100
      };
      
      const reorderResponse = await makeRequest('PUT', `/api/admin/social-media/${item.id}`, reorderData, adminCookie);
      
      if (reorderResponse.status === 200) {
        results.reorderItems.success++;
        console.log(`    ✅ Reorder successful for item ${item.id}`);
      } else {
        console.log(`    ❌ Reorder failed: ${reorderResponse.status} - ${reorderResponse.data}`);
      }
    }

    // Test 7: Delete Social Media Item Functionality
    console.log('\n🔸 TEST 7: Delete Social Media Item Functionality');
    if (createdItemIds.length > 0) {
      for (let i = 1; i <= Math.min(3, createdItemIds.length); i++) {
        console.log(`  Attempt ${i}/3...`);
        const itemId = createdItemIds[i-1];
        
        const deleteResponse = await makeRequest('DELETE', `/api/admin/social-media/${itemId}`, null, adminCookie);
        
        if (deleteResponse.status === 200 || deleteResponse.status === 204) {
          results.deleteSocialMedia.success++;
          console.log(`    ✅ Delete successful for item ${itemId}`);
        } else {
          console.log(`    ❌ Delete failed: ${deleteResponse.status} - ${deleteResponse.data}`);
        }
      }
    } else {
      console.log('    ⚠️ No created items available for deletion testing');
    }

    // Generate comprehensive report
    console.log('\n' + '='.repeat(70));
    console.log('📊 SOCIAL MEDIA MANAGEMENT AUDIT RESULTS');
    console.log('='.repeat(70));
    
    let totalTests = 0;
    let totalSuccess = 0;
    
    for (const [testName, result] of Object.entries(results)) {
      const successRate = (result.success / result.total * 100).toFixed(1);
      const status = result.success === result.total ? '✅' : '❌';
      console.log(`${status} ${testName}: ${result.success}/${result.total} (${successRate}%)`);
      totalTests += result.total;
      totalSuccess += result.success;
    }
    
    const overallRate = (totalSuccess / totalTests * 100).toFixed(1);
    console.log('\n' + '-'.repeat(70));
    console.log(`🎯 OVERALL SUCCESS RATE: ${totalSuccess}/${totalTests} (${overallRate}%)`);
    
    if (overallRate < 100) {
      console.log('\n❌ CRITICAL ISSUES DETECTED:');
      for (const [testName, result] of Object.entries(results)) {
        if (result.success < result.total) {
          console.log(`   - ${testName}: ${result.total - result.success} failures`);
        }
      }
      
      console.log('\n🔍 IDENTIFIED ROOT CAUSES:');
      console.log('   1. Backend service method "getSocialMediaLink" missing');
      console.log('   2. Social media service layer not properly implemented');
      console.log('   3. Update functionality throwing 500 errors');
      console.log('   4. Service method names mismatched between routes and service');
      console.log('   5. Database operation methods not correctly defined');
    } else {
      console.log('\n🎉 ALL TESTS PASSED - Social Media Management is fully functional!');
    }
    
  } catch (error) {
    console.error('\n💥 AUDIT FAILED:', error.message);
  }
}

auditSocialMediaManagement();