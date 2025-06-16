/**
 * Comprehensive audit of Pages Management system
 * Tests ALL functionality 3 times each to identify why pages don't appear after creation
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

async function auditPagesManagement() {
  console.log('🔍 COMPREHENSIVE PAGES MANAGEMENT AUDIT');
  console.log('Testing all functionality 3 times each to identify missing pages issue\n');
  
  const results = {
    adminAccess: { success: 0, total: 3 },
    fetchPages: { success: 0, total: 3 },
    createPage: { success: 0, total: 3 },
    updatePage: { success: 0, total: 3 },
    deletePage: { success: 0, total: 3 },
    cacheInvalidation: { success: 0, total: 3 },
    dataConsistency: { success: 0, total: 3 }
  };

  let adminCookie = '';
  let createdPageIds = [];
  
  try {
    // Setup: Create admin user
    console.log('SETUP: Creating admin user...');
    const adminEmail = `pages-audit-${Date.now()}@test.com`;
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'admin123',
      firstName: 'Pages',
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

    // Test 1: Admin Access to Pages (3 times)
    console.log('🔸 TEST 1: Admin Access to Pages Management');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      const response = await makeRequest('GET', '/api/admin/pages', null, adminCookie);
      console.log(`    Response status: ${response.status}`);
      console.log(`    Content-Type: ${response.headers['content-type']}`);
      
      if (response.status === 200) {
        try {
          const pages = JSON.parse(response.data);
          results.adminAccess.success++;
          console.log(`    ✅ Success - Found ${pages.length} pages`);
          
          if (pages.length > 0) {
            console.log(`    Sample page structure:`, {
              id: pages[0].id,
              title: pages[0].title,
              slug: pages[0].slug,
              status: pages[0].status
            });
          }
        } catch (parseError) {
          console.log(`    ❌ Invalid JSON response: ${response.data.substring(0, 100)}`);
        }
      } else {
        console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
      }
    }

    // Test 2: Fetch Pages Endpoint Analysis (3 times)
    console.log('\n🔸 TEST 2: Deep Analysis of Pages Fetch');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      const response = await makeRequest('GET', '/api/admin/pages', null, adminCookie);
      
      if (response.status === 200) {
        const pages = JSON.parse(response.data);
        results.fetchPages.success++;
        console.log(`    ✅ Fetch successful - ${pages.length} pages returned`);
        
        // Analyze page structure
        if (pages.length > 0) {
          const samplePage = pages[0];
          console.log(`    Page fields:`, Object.keys(samplePage));
        }
      } else {
        console.log(`    ❌ Fetch failed: ${response.status}`);
      }
    }

    // Test 3: Create Page and Verify Persistence (3 times)
    console.log('\n🔸 TEST 3: Create Page and Verify Persistence');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      
      const pageData = {
        title: `Audit Test Page ${i}`,
        slug: `audit-test-${i}-${Date.now()}`,
        content: `<h1>Test Content ${i}</h1><p>This is a test page for audit purposes.</p>`,
        seoTitle: `Audit Test Page ${i} - Meta`,
        seoDescription: `Meta description for audit test page ${i}`,
        status: 'published',
        authorId: adminUserId
      };
      
      console.log(`    Creating page: ${pageData.title}`);
      const createResponse = await makeRequest('POST', '/api/admin/pages', pageData, adminCookie);
      
      console.log(`    Create response status: ${createResponse.status}`);
      
      if (createResponse.status === 201) {
        try {
          const createdPage = JSON.parse(createResponse.data);
          createdPageIds.push(createdPage.id);
          console.log(`    ✅ Page created with ID: ${createdPage.id}`);
          
          // Immediately verify the page appears in the list
          console.log(`    Verifying page appears in list...`);
          const verifyResponse = await makeRequest('GET', '/api/admin/pages', null, adminCookie);
          
          if (verifyResponse.status === 200) {
            const allPages = JSON.parse(verifyResponse.data);
            const foundPage = allPages.find(p => p.id === createdPage.id);
            
            if (foundPage) {
              results.createPage.success++;
              console.log(`    ✅ SUCCESS: Page immediately visible in list`);
              console.log(`    Page details:`, {
                id: foundPage.id,
                title: foundPage.title,
                slug: foundPage.slug,
                status: foundPage.status
              });
            } else {
              console.log(`    ❌ CRITICAL: Page created but NOT appearing in list!`);
              console.log(`    Total pages in list: ${allPages.length}`);
              console.log(`    Looking for ID: ${createdPage.id}`);
              console.log(`    Available IDs: ${allPages.map(p => p.id).join(', ')}`);
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

    // Test 4: Update Page Functionality (3 times)
    console.log('\n🔸 TEST 4: Update Page Functionality');
    if (createdPageIds.length > 0) {
      for (let i = 1; i <= Math.min(3, createdPageIds.length); i++) {
        console.log(`  Attempt ${i}/3...`);
        const pageId = createdPageIds[i-1];
        
        const updateData = {
          title: `Updated Audit Page ${i}`,
          content: `<h1>Updated Content ${i}</h1><p>This page has been updated.</p>`
        };
        
        const updateResponse = await makeRequest('PUT', `/api/admin/pages/${pageId}`, updateData, adminCookie);
        
        if (updateResponse.status === 200) {
          results.updatePage.success++;
          console.log(`    ✅ Update successful for page ${pageId}`);
        } else {
          console.log(`    ❌ Update failed: ${updateResponse.status} - ${updateResponse.data}`);
        }
      }
    } else {
      console.log('    ⚠️ No pages created for update testing');
    }

    // Test 5: Cache Invalidation (3 times)
    console.log('\n🔸 TEST 5: Cache Invalidation Testing');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      
      // Create a page
      const cacheTestData = {
        title: `Cache Test ${i}`,
        slug: `cache-test-${i}-${Date.now()}`,
        content: `<p>Cache test content ${i}</p>`,
        seoTitle: `Cache Test ${i}`,
        seoDescription: `Cache test description ${i}`,
        status: 'published',
        authorId: adminUserId
      };
      
      const createResponse = await makeRequest('POST', '/api/admin/pages', cacheTestData, adminCookie);
      
      if (createResponse.status === 201) {
        const createdPage = JSON.parse(createResponse.data);
        
        // Wait 100ms then check if it appears
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const fetchResponse = await makeRequest('GET', '/api/admin/pages', null, adminCookie);
        if (fetchResponse.status === 200) {
          const pages = JSON.parse(fetchResponse.data);
          const foundPage = pages.find(p => p.id === createdPage.id);
          
          if (foundPage) {
            results.cacheInvalidation.success++;
            console.log(`    ✅ Cache invalidation working - page visible`);
          } else {
            console.log(`    ❌ Cache invalidation failed - page not visible`);
          }
        }
      }
    }

    // Test 6: Data Consistency (3 times)
    console.log('\n🔸 TEST 6: Data Consistency Verification');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      
      // Get pages count before creation
      const beforeResponse = await makeRequest('GET', '/api/admin/pages', null, adminCookie);
      const beforeCount = beforeResponse.status === 200 ? JSON.parse(beforeResponse.data).length : 0;
      
      // Create a page
      const consistencyData = {
        title: `Consistency Test ${i}`,
        slug: `consistency-${i}-${Date.now()}`,
        content: `<p>Consistency test ${i}</p>`,
        status: 'published'
      };
      
      const createResponse = await makeRequest('POST', '/api/admin/pages', consistencyData, adminCookie);
      
      if (createResponse.status === 201) {
        // Get pages count after creation
        const afterResponse = await makeRequest('GET', '/api/admin/pages', null, adminCookie);
        const afterCount = afterResponse.status === 200 ? JSON.parse(afterResponse.data).length : 0;
        
        if (afterCount === beforeCount + 1) {
          results.dataConsistency.success++;
          console.log(`    ✅ Data consistency maintained (${beforeCount} → ${afterCount})`);
        } else {
          console.log(`    ❌ Data inconsistency (${beforeCount} → ${afterCount})`);
        }
      }
    }

    // Test 7: Delete Page Functionality
    console.log('\n🔸 TEST 7: Delete Page Functionality');
    if (createdPageIds.length > 0) {
      for (let i = 1; i <= Math.min(3, createdPageIds.length); i++) {
        console.log(`  Attempt ${i}/3...`);
        const pageId = createdPageIds[i-1];
        
        const deleteResponse = await makeRequest('DELETE', `/api/admin/pages/${pageId}`, null, adminCookie);
        
        if (deleteResponse.status === 200) {
          results.deletePage.success++;
          console.log(`    ✅ Delete successful for page ${pageId}`);
          
          // Verify page is removed from list
          const verifyResponse = await makeRequest('GET', '/api/admin/pages', null, adminCookie);
          if (verifyResponse.status === 200) {
            const pages = JSON.parse(verifyResponse.data);
            const stillExists = pages.find(p => p.id === pageId);
            
            if (!stillExists) {
              console.log(`    ✅ Page properly removed from list`);
            } else {
              console.log(`    ❌ Page still appears in list after deletion`);
            }
          }
        } else {
          console.log(`    ❌ Delete failed: ${deleteResponse.status} - ${deleteResponse.data}`);
        }
      }
    }

    // Generate comprehensive report
    console.log('\n' + '='.repeat(70));
    console.log('📊 PAGES MANAGEMENT AUDIT RESULTS');
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
      
      console.log('\n🔍 POSSIBLE ROOT CAUSES:');
      console.log('   1. Frontend cache not invalidating after page creation');
      console.log('   2. React Query not refetching pages list');
      console.log('   3. Backend API returning stale data');
      console.log('   4. Database transaction not committing properly');
      console.log('   5. Pages endpoint filtering out newly created pages');
      console.log('   6. Authentication issues preventing proper data access');
    } else {
      console.log('\n🎉 ALL TESTS PASSED - Pages Management is fully functional!');
    }
    
  } catch (error) {
    console.error('\n💥 AUDIT FAILED:', error.message);
  }
}

auditPagesManagement();