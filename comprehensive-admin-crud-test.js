/**
 * Comprehensive Admin CRUD Operations Test
 * Tests all restored admin functionality with real API calls
 */

import fs from 'fs';
const BASE_URL = 'http://localhost:5000';

// Read admin cookies for authentication
let adminCookies = '';
try {
  adminCookies = fs.readFileSync('admin_cookies.txt', 'utf8').trim();
} catch (error) {
  console.error('Admin cookies file not found. Please authenticate first.');
  process.exit(1);
}

const makeRequest = async (method, path, data = null) => {
  const fetch = (await import('node-fetch')).default;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookies
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${path}`, options);
  const result = await response.text();
  
  try {
    return {
      status: response.status,
      data: JSON.parse(result),
      success: response.ok
    };
  } catch {
    return {
      status: response.status,
      data: result,
      success: response.ok
    };
  }
};

const testResults = {
  businesses: { create: false, read: false, update: false, delete: false },
  users: { create: false, read: false, update: false, delete: false },
  categories: { create: false, read: false, update: false, delete: false },
  socialMedia: { create: false, read: false, update: false, delete: false },
  cities: { read: false },
  reviews: { create: false, read: false, update: false, delete: false }
};

let testBusinessId = null;
let testUserId = null;
let testCategoryId = null;

async function testBusinessManagement() {
  console.log('\n=== TESTING BUSINESS MANAGEMENT ===');
  
  // Test READ
  const readResponse = await makeRequest('GET', '/api/admin/businesses');
  testResults.businesses.read = readResponse.success;
  console.log(`📋 Business READ: ${readResponse.success ? '✅ PASS' : '❌ FAIL'} (${readResponse.status})`);
  
  // Test CREATE
  const createData = {
    title: 'Test Admin Business CRUD',
    city: 'Admin Test City',
    state: 'Admin State',
    phone: '555-0199',
    email: 'admin-test@crud.com',
    website: 'https://admin-crud-test.com',
    description: 'Test business for CRUD verification',
    categoryname: 'Admin Test Category'
  };
  
  const createResponse = await makeRequest('POST', '/api/admin/businesses', createData);
  testResults.businesses.create = createResponse.success;
  if (createResponse.success) {
    testBusinessId = createResponse.data.placeid;
  }
  console.log(`➕ Business CREATE: ${createResponse.success ? '✅ PASS' : '❌ FAIL'} (${createResponse.status})`);
  
  if (testBusinessId) {
    // Test UPDATE
    const updateData = { title: 'Updated Admin Business CRUD' };
    const updateResponse = await makeRequest('PUT', `/api/admin/businesses/${testBusinessId}`, updateData);
    testResults.businesses.update = updateResponse.success;
    console.log(`✏️ Business UPDATE: ${updateResponse.success ? '✅ PASS' : '❌ FAIL'} (${updateResponse.status})`);
    
    // Test DELETE
    const deleteResponse = await makeRequest('DELETE', `/api/admin/businesses/${testBusinessId}`);
    testResults.businesses.delete = deleteResponse.success;
    console.log(`🗑️ Business DELETE: ${deleteResponse.success ? '✅ PASS' : '❌ FAIL'} (${deleteResponse.status})`);
  }
}

async function testUserManagement() {
  console.log('\n=== TESTING USER MANAGEMENT ===');
  
  // Test READ
  const readResponse = await makeRequest('GET', '/api/admin/users');
  testResults.users.read = readResponse.success;
  console.log(`📋 User READ: ${readResponse.success ? '✅ PASS' : '❌ FAIL'} (${readResponse.status})`);
  
  // Test CREATE
  const createData = {
    email: 'admin-crud-test@user.com',
    firstName: 'Admin',
    lastName: 'CRUD Test',
    role: 'user',
    password: 'testpassword123'
  };
  
  const createResponse = await makeRequest('POST', '/api/admin/users', createData);
  testResults.users.create = createResponse.success;
  if (createResponse.success) {
    testUserId = createResponse.data.id;
  }
  console.log(`➕ User CREATE: ${createResponse.success ? '✅ PASS' : '❌ FAIL'} (${createResponse.status})`);
  
  if (testUserId) {
    // Test UPDATE
    const updateData = { firstName: 'Updated Admin' };
    const updateResponse = await makeRequest('PUT', `/api/admin/users/${testUserId}`, updateData);
    testResults.users.update = updateResponse.success;
    console.log(`✏️ User UPDATE: ${updateResponse.success ? '✅ PASS' : '❌ FAIL'} (${updateResponse.status})`);
    
    // Test DELETE
    const deleteResponse = await makeRequest('DELETE', `/api/admin/users/${testUserId}`);
    testResults.users.delete = deleteResponse.success;
    console.log(`🗑️ User DELETE: ${deleteResponse.success ? '✅ PASS' : '❌ FAIL'} (${deleteResponse.status})`);
  }
}

async function testCategoryManagement() {
  console.log('\n=== TESTING CATEGORY MANAGEMENT ===');
  
  // Test READ
  const readResponse = await makeRequest('GET', '/api/admin/categories');
  testResults.categories.read = readResponse.success;
  console.log(`📋 Category READ: ${readResponse.success ? '✅ PASS' : '❌ FAIL'} (${readResponse.status})`);
  
  // Test CREATE
  const createData = {
    name: 'Admin CRUD Test Category',
    description: 'Test category for CRUD verification',
    icon: 'fas fa-test',
    color: '#FF5733'
  };
  
  const createResponse = await makeRequest('POST', '/api/admin/categories', createData);
  testResults.categories.create = createResponse.success;
  if (createResponse.success) {
    testCategoryId = createResponse.data.id;
  }
  console.log(`➕ Category CREATE: ${createResponse.success ? '✅ PASS' : '❌ FAIL'} (${createResponse.status})`);
  
  if (testCategoryId) {
    // Test UPDATE
    const updateData = { name: 'Updated Admin CRUD Test Category' };
    const updateResponse = await makeRequest('PUT', `/api/admin/categories/${testCategoryId}`, updateData);
    testResults.categories.update = updateResponse.success;
    console.log(`✏️ Category UPDATE: ${updateResponse.success ? '✅ PASS' : '❌ FAIL'} (${updateResponse.status})`);
    
    // Test DELETE
    const deleteResponse = await makeRequest('DELETE', `/api/admin/categories/${testCategoryId}`);
    testResults.categories.delete = deleteResponse.success;
    console.log(`🗑️ Category DELETE: ${deleteResponse.success ? '✅ PASS' : '❌ FAIL'} (${deleteResponse.status})`);
  }
}

async function testSocialMediaManagement() {
  console.log('\n=== TESTING SOCIAL MEDIA MANAGEMENT ===');
  
  // Test READ
  const readResponse = await makeRequest('GET', '/api/admin/social-media');
  testResults.socialMedia.read = readResponse.success;
  console.log(`📋 Social Media READ: ${readResponse.success ? '✅ PASS' : '❌ FAIL'} (${readResponse.status})`);
  
  // Test UPDATE (using existing platform)
  const updateData = { displayName: 'Updated Test Platform' };
  const updateResponse = await makeRequest('PUT', '/api/admin/social-media/5', updateData);
  testResults.socialMedia.update = updateResponse.success;
  console.log(`✏️ Social Media UPDATE: ${updateResponse.success ? '✅ PASS' : '❌ FAIL'} (${updateResponse.status})`);
}

async function testCitiesManagement() {
  console.log('\n=== TESTING CITIES MANAGEMENT ===');
  
  // Test READ
  const readResponse = await makeRequest('GET', '/api/admin/cities');
  testResults.cities.read = readResponse.success;
  console.log(`📋 Cities READ: ${readResponse.success ? '✅ PASS' : '❌ FAIL'} (${readResponse.status})`);
}

async function generateSummaryReport() {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 COMPREHENSIVE ADMIN CRUD RESTORATION SUMMARY');
  console.log('='.repeat(60));
  
  const totalOperations = Object.values(testResults).reduce((total, module) => {
    return total + Object.keys(module).length;
  }, 0);
  
  const successfulOperations = Object.values(testResults).reduce((total, module) => {
    return total + Object.values(module).filter(result => result === true).length;
  }, 0);
  
  const successRate = Math.round((successfulOperations / totalOperations) * 100);
  
  console.log(`\n📊 OVERALL SUCCESS RATE: ${successRate}% (${successfulOperations}/${totalOperations})`);
  
  console.log('\n📋 DETAILED RESULTS BY MODULE:');
  console.log('┌─────────────────┬──────┬──────┬────────┬────────┐');
  console.log('│ Module          │ READ │ CREATE│ UPDATE │ DELETE │');
  console.log('├─────────────────┼──────┼──────┼────────┼────────┤');
  
  const formatResult = (result) => result === true ? '✅' : result === false ? '❌' : '➖';
  
  Object.entries(testResults).forEach(([module, results]) => {
    const read = formatResult(results.read);
    const create = formatResult(results.create);
    const update = formatResult(results.update);
    const del = formatResult(results.delete);
    
    console.log(`│ ${module.padEnd(15)} │  ${read}  │  ${create}  │   ${update}   │   ${del}   │`);
  });
  
  console.log('└─────────────────┴──────┴──────┴────────┴────────┘');
  
  console.log('\n🎉 SUCCESSFULLY RESTORED ADMIN TOOLS:');
  const workingModules = Object.entries(testResults).filter(([_, results]) => 
    Object.values(results).some(result => result === true)
  );
  
  workingModules.forEach(([module, results]) => {
    const workingOps = Object.entries(results).filter(([_, result]) => result === true);
    if (workingOps.length > 0) {
      console.log(`   • ${module.toUpperCase()}: ${workingOps.map(([op]) => op.toUpperCase()).join(', ')}`);
    }
  });
  
  if (successRate >= 75) {
    console.log('\n🚀 ADMIN PANEL RESTORATION: HIGHLY SUCCESSFUL');
    console.log('   The majority of admin CRUD operations are working correctly.');
  } else if (successRate >= 50) {
    console.log('\n⚡ ADMIN PANEL RESTORATION: PARTIALLY SUCCESSFUL');
    console.log('   Core admin functionality has been restored.');
  } else {
    console.log('\n🔧 ADMIN PANEL RESTORATION: NEEDS ADDITIONAL WORK');
    console.log('   Some admin tools require further debugging.');
  }
  
  console.log('\n' + '='.repeat(60));
}

async function runComprehensiveTest() {
  console.log('🔧 COMPREHENSIVE ADMIN CRUD OPERATIONS TEST');
  console.log('Testing all restored admin panel functionality...\n');
  
  try {
    await testBusinessManagement();
    await testUserManagement();
    await testCategoryManagement();
    await testSocialMediaManagement();
    await testCitiesManagement();
    
    await generateSummaryReport();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);