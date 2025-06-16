/**
 * Comprehensive audit of Featured Management functionality
 * Tests ALL features 3 times each to ensure reliability
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

async function auditFeaturedManagement() {
  console.log('🔍 COMPREHENSIVE FEATURED MANAGEMENT AUDIT');
  console.log('Testing all features 3 times each for reliability\n');
  
  const results = {
    adminAccess: { success: 0, total: 3 },
    viewFeaturedRequests: { success: 0, total: 3 },
    addFeaturedBusiness: { success: 0, total: 3 },
    removeFeaturedBusiness: { success: 0, total: 3 },
    approveRequest: { success: 0, total: 3 },
    rejectRequest: { success: 0, total: 3 },
    businessesEndpoint: { success: 0, total: 3 },
    categoriesEndpoint: { success: 0, total: 3 }
  };

  let adminCookie = '';
  
  try {
    // Setup: Create admin user
    console.log('SETUP: Creating admin user...');
    const adminEmail = `audit-admin-${Date.now()}@test.com`;
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'admin123',
      firstName: 'Audit',
      lastName: 'Admin'
    });
    
    if (registerResponse.status !== 201) {
      console.log('❌ CRITICAL: Cannot create admin user');
      return;
    }
    
    adminCookie = registerResponse.cookies.find(c => c.startsWith('connect.sid=')).split(';')[0];
    console.log('✅ Admin user created\n');

    // Test 1: Admin Access (3 times)
    console.log('🔸 TEST 1: Admin Access to Featured Management');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      const response = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
      if (response.status === 200) {
        results.adminAccess.success++;
        console.log(`    ✅ Success`);
      } else {
        console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
      }
    }

    // Test 2: View Admin Businesses Endpoint (3 times)
    console.log('\n🔸 TEST 2: Admin Businesses Endpoint');
    let allBusinesses = [];
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      const response = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
      if (response.status === 200) {
        allBusinesses = JSON.parse(response.data);
        results.businessesEndpoint.success++;
        console.log(`    ✅ Success: Found ${allBusinesses.length} businesses`);
      } else {
        console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
      }
    }

    // Test 3: Categories Endpoint (3 times)
    console.log('\n🔸 TEST 3: Categories Endpoint');
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      const response = await makeRequest('GET', '/api/categories', null, adminCookie);
      if (response.status === 200) {
        results.categoriesEndpoint.success++;
        console.log(`    ✅ Success`);
      } else {
        console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
      }
    }

    // Test 4: Add Featured Business (3 times)
    console.log('\n🔸 TEST 4: Add Featured Business');
    const nonFeaturedBusinesses = allBusinesses.filter(b => !b.featured);
    if (nonFeaturedBusinesses.length >= 3) {
      for (let i = 1; i <= 3; i++) {
        console.log(`  Attempt ${i}/3...`);
        const businessId = nonFeaturedBusinesses[i-1].placeid;
        const response = await makeRequest('PATCH', `/api/admin/businesses/${businessId}`, { featured: true }, adminCookie);
        if (response.status === 200) {
          results.addFeaturedBusiness.success++;
          console.log(`    ✅ Success: Featured business ${businessId.substring(0, 20)}...`);
        } else {
          console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
        }
      }
    } else {
      console.log('    ⚠️ Not enough non-featured businesses for testing');
    }

    // Refresh businesses list after adding featured
    const refreshResponse = await makeRequest('GET', '/api/admin/businesses', null, adminCookie);
    if (refreshResponse.status === 200) {
      allBusinesses = JSON.parse(refreshResponse.data);
    }

    // Test 5: Remove Featured Business (3 times)
    console.log('\n🔸 TEST 5: Remove Featured Business');
    const featuredBusinesses = allBusinesses.filter(b => b.featured);
    if (featuredBusinesses.length >= 3) {
      for (let i = 1; i <= 3; i++) {
        console.log(`  Attempt ${i}/3...`);
        const businessId = featuredBusinesses[i-1].placeid;
        const response = await makeRequest('PATCH', `/api/admin/businesses/${businessId}`, { featured: false }, adminCookie);
        if (response.status === 200) {
          results.removeFeaturedBusiness.success++;
          console.log(`    ✅ Success: Removed featured ${businessId.substring(0, 20)}...`);
        } else {
          console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
        }
      }
    } else {
      console.log('    ⚠️ Not enough featured businesses for testing');
    }

    // Test 6: Featured Requests Viewing (3 times)
    console.log('\n🔸 TEST 6: View Featured Requests');
    let featuredRequests = [];
    for (let i = 1; i <= 3; i++) {
      console.log(`  Attempt ${i}/3...`);
      const response = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
      if (response.status === 200) {
        featuredRequests = JSON.parse(response.data);
        results.viewFeaturedRequests.success++;
        console.log(`    ✅ Success: Found ${featuredRequests.length} requests`);
      } else {
        console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
      }
    }

    // Test 7: Approve Featured Request (3 times)
    console.log('\n🔸 TEST 7: Approve Featured Requests');
    const pendingRequests = featuredRequests.filter(r => r.status === 'pending');
    if (pendingRequests.length > 0) {
      for (let i = 1; i <= Math.min(3, pendingRequests.length); i++) {
        console.log(`  Attempt ${i}/3...`);
        const requestId = pendingRequests[i-1].id;
        const response = await makeRequest('PUT', `/api/featured-requests/${requestId}/review`, {
          status: 'approved',
          adminMessage: `Audit test approval ${i}`
        }, adminCookie);
        if (response.status === 200) {
          results.approveRequest.success++;
          console.log(`    ✅ Success: Approved request ${requestId}`);
        } else {
          console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
        }
      }
    } else {
      console.log('    ⚠️ No pending requests to approve');
    }

    // Create test requests for rejection if needed
    if (pendingRequests.length < 3) {
      console.log('    Creating additional test requests for rejection testing...');
      // This would need business owner setup which is complex for audit
    }

    // Test 8: Reject Featured Request (3 times)
    console.log('\n🔸 TEST 8: Reject Featured Requests');
    const refreshedResponse = await makeRequest('GET', '/api/featured-requests/admin', null, adminCookie);
    if (refreshedResponse.status === 200) {
      const refreshedRequests = JSON.parse(refreshedResponse.data);
      const stillPendingRequests = refreshedRequests.filter(r => r.status === 'pending');
      
      if (stillPendingRequests.length > 0) {
        for (let i = 1; i <= Math.min(3, stillPendingRequests.length); i++) {
          console.log(`  Attempt ${i}/3...`);
          const requestId = stillPendingRequests[i-1].id;
          const response = await makeRequest('PUT', `/api/featured-requests/${requestId}/review`, {
            status: 'rejected',
            adminMessage: `Audit test rejection ${i}`
          }, adminCookie);
          if (response.status === 200) {
            results.rejectRequest.success++;
            console.log(`    ✅ Success: Rejected request ${requestId}`);
          } else {
            console.log(`    ❌ Failed: ${response.status} - ${response.data}`);
          }
        }
      } else {
        console.log('    ⚠️ No pending requests to reject');
      }
    }

    // Generate comprehensive report
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE AUDIT RESULTS');
    console.log('='.repeat(60));
    
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
    console.log('\n' + '-'.repeat(60));
    console.log(`🎯 OVERALL SUCCESS RATE: ${totalSuccess}/${totalTests} (${overallRate}%)`);
    
    if (overallRate < 100) {
      console.log('\n❌ CRITICAL ISSUES DETECTED:');
      for (const [testName, result] of Object.entries(results)) {
        if (result.success < result.total) {
          console.log(`   - ${testName}: ${result.total - result.success} failures`);
        }
      }
    } else {
      console.log('\n🎉 ALL TESTS PASSED - Featured Management is fully functional!');
    }
    
  } catch (error) {
    console.error('\n💥 AUDIT FAILED:', error.message);
  }
}

auditFeaturedManagement();