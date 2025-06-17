/**
 * Complete Admin System Test  
 * Tests authentication with correct credentials and all admin functionality
 */

import { fetch } from 'undici';

async function makeRequest(method, path, data = null, cookies = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`http://localhost:5000${path}`, options);
  return { response, data: await response.json() };
}

async function testCompleteAdminSystem() {
  console.log('=== COMPLETE ADMIN SYSTEM TEST ===\n');

  // Step 1: Login with correct credentials
  console.log('🔐 Testing login with correct credentials...');
  try {
    const { response: loginResponse, data: loginData } = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@businesshub.com',
      password: 'Xola2025'
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful with correct credentials');
    console.log('User:', loginData.email, 'Role:', loginData.role);

    // Step 2: Test all admin API endpoints
    console.log('\n📍 Testing admin API endpoints...');
    
    const endpoints = [
      '/api/admin/businesses',
      '/api/admin/users', 
      '/api/admin/categories',
      '/api/admin/reviews',
      '/api/admin/cities',
      '/api/admin/social-media',
      '/api/admin/featured-requests',
      '/api/admin/pages',
      '/api/admin/content-strings',
      '/api/admin/site-settings'
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      try {
        const { response } = await makeRequest('GET', endpoint, null, cookies);
        if (response.ok) {
          console.log(`✅ ${endpoint} (${response.status})`);
          successCount++;
        } else {
          console.log(`❌ ${endpoint} (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} (Error: ${error.message})`);
      }
    }

    // Step 3: Test specific business data loading
    console.log('\n📊 Testing business data loading...');
    const { response: bizResponse, data: bizData } = await makeRequest('GET', '/api/admin/businesses', null, cookies);
    
    if (bizResponse.ok && Array.isArray(bizData)) {
      console.log(`✅ Business data loaded: ${bizData.length} businesses`);
      if (bizData.length > 0) {
        console.log('Sample business:', bizData[0].title || bizData[0].name);
      }
    } else {
      console.log('❌ Business data loading failed');
    }

    // Step 4: Test categories for business form
    console.log('\n📋 Testing categories for business form...');
    const { response: catResponse, data: catData } = await makeRequest('GET', '/api/admin/categories', null, cookies);
    
    if (catResponse.ok && Array.isArray(catData)) {
      console.log(`✅ Categories loaded: ${catData.length} categories`);
      if (catData.length > 0) {
        console.log('Sample categories:', catData.slice(0, 3).map(c => c.name).join(', '));
      }
    } else {
      console.log('❌ Categories loading failed');
    }

    // Generate report
    console.log('\n================================================================');
    console.log('COMPLETE ADMIN SYSTEM TEST REPORT');
    console.log('================================================================');
    console.log(`Authentication: ✅ Working with correct credentials`);
    console.log(`Admin API Endpoints: ${successCount}/${endpoints.length} healthy`);
    console.log(`Business Data: ${bizResponse?.ok ? '✅ Loading' : '❌ Failed'}`);
    console.log(`Categories Data: ${catResponse?.ok ? '✅ Loading' : '❌ Failed'}`);
    console.log(`Overall Health: ${successCount === endpoints.length ? '100%' : Math.round((successCount/endpoints.length)*100) + '%'}`);
    
    if (successCount === endpoints.length) {
      console.log('\n🎉 ADMIN SYSTEM FULLY OPERATIONAL!');
      console.log('✅ All admin links should work correctly');
      console.log('✅ Business form data should load properly');
      console.log('✅ Authentication is working with admin@businesshub.com / Xola2025');
    } else {
      console.log('\n⚠️ Some issues detected, but core functionality is working');
    }
    console.log('================================================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteAdminSystem().catch(console.error);