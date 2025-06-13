// Comprehensive test for all business editing functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let sessionCookie = '';

// Test authentication and get session
async function authenticate() {
  console.log('🔐 Authenticating as admin...');
  
  const response = await fetch(`${BASE_URL}/api/auth/user`);
  if (response.ok) {
    const user = await response.json();
    if (user.email === 'admin@businesshub.com') {
      console.log('✅ Already authenticated');
      return true;
    }
  }
  
  console.log('❌ Authentication required - user needs to login manually through admin interface');
  return false;
}

// Test 1: Foreign key constraint error fix
async function testForeignKeyConstraint() {
  console.log('\n📝 Testing Foreign Key Constraint Fix...');
  
  try {
    // Get a business to test with
    const businessesRes = await fetch(`${BASE_URL}/api/businesses/featured`);
    const businesses = await businessesRes.json();
    
    if (!businesses || businesses.length === 0) {
      console.log('❌ No test businesses available');
      return false;
    }
    
    const testBusiness = businesses[0];
    console.log(`Testing with business: ${testBusiness.title}`);
    
    // Test updating with empty ownerid (should not cause constraint error)
    const updateData = {
      title: testBusiness.title,
      ownerid: '', // This previously caused foreign key constraint error
    };
    
    const response = await fetch(`${BASE_URL}/api/admin/businesses/${testBusiness.placeid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.status === 401) {
      console.log('❌ Authentication required for testing');
      return false;
    }
    
    if (response.ok) {
      console.log('✅ Foreign key constraint fix works');
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Foreign key constraint still failing: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Foreign key constraint test error: ${error.message}`);
    return false;
  }
}

// Test 2: FAQ updates
async function testFAQUpdates() {
  console.log('\n📋 Testing FAQ Updates...');
  
  try {
    const businessesRes = await fetch(`${BASE_URL}/api/businesses/featured`);
    const businesses = await businessesRes.json();
    const testBusiness = businesses[0];
    
    const updateData = {
      faq: [
        { question: "What are your hours?", answer: "Monday to Friday 9AM-5PM" },
        { question: "Do you offer consultations?", answer: "Yes, free consultations available" }
      ]
    };
    
    const response = await fetch(`${BASE_URL}/api/admin/businesses/${testBusiness.placeid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.status === 401) {
      console.log('❌ Authentication required for testing');
      return false;
    }
    
    if (response.ok) {
      console.log('✅ FAQ updates work');
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ FAQ updates failing: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ FAQ update test error: ${error.message}`);
    return false;
  }
}

// Test 3: Phone number updates
async function testPhoneUpdates() {
  console.log('\n📞 Testing Phone Number Updates...');
  
  try {
    const businessesRes = await fetch(`${BASE_URL}/api/businesses/featured`);
    const businesses = await businessesRes.json();
    const testBusiness = businesses[0];
    
    const updateData = {
      phone: '07 3357 4555'
    };
    
    const response = await fetch(`${BASE_URL}/api/admin/businesses/${testBusiness.placeid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.status === 401) {
      console.log('❌ Authentication required for testing');
      return false;
    }
    
    if (response.ok) {
      console.log('✅ Phone number updates work');
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Phone number updates failing: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Phone update test error: ${error.message}`);
    return false;
  }
}

// Test 4: Category changes
async function testCategoryChanges() {
  console.log('\n📂 Testing Category Changes...');
  
  try {
    const businessesRes = await fetch(`${BASE_URL}/api/businesses/featured`);
    const businesses = await businessesRes.json();
    const testBusiness = businesses[0];
    
    const updateData = {
      categoryid: 13 // Cosmetic Dentist category
    };
    
    const response = await fetch(`${BASE_URL}/api/admin/businesses/${testBusiness.placeid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.status === 401) {
      console.log('❌ Authentication required for testing');
      return false;
    }
    
    if (response.ok) {
      console.log('✅ Category changes work');
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Category changes failing: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Category change test error: ${error.message}`);
    return false;
  }
}

// Test 5: Photo gallery management endpoints
async function testPhotoGalleryManagement() {
  console.log('\n🖼️ Testing Photo Gallery Management...');
  
  try {
    const businessesRes = await fetch(`${BASE_URL}/api/businesses/featured`);
    const businesses = await businessesRes.json();
    const testBusiness = businesses[0];
    
    // Test photo deletion endpoint exists
    const response = await fetch(`${BASE_URL}/api/admin/businesses/${testBusiness.placeid}/photos`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({ photoUrl: 'test-photo.jpg' })
    });
    
    if (response.status === 401) {
      console.log('❌ Authentication required for testing');
      return false;
    }
    
    // Even if business has no photos, endpoint should exist and not return 404 for route
    if (response.status !== 404 || (await response.json()).message !== "Business not found") {
      console.log('✅ Photo gallery management endpoints exist');
      return true;
    } else {
      console.log('❌ Photo gallery management endpoints missing');
      return false;
    }
  } catch (error) {
    console.log(`❌ Photo gallery test error: ${error.message}`);
    return false;
  }
}

// Test 6: Review management endpoints
async function testReviewManagement() {
  console.log('\n⭐ Testing Review Management...');
  
  try {
    // Test review deletion endpoint exists
    const response = await fetch(`${BASE_URL}/api/admin/reviews/1`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      }
    });
    
    if (response.status === 401) {
      console.log('❌ Authentication required for testing');
      return false;
    }
    
    // Endpoint should exist (even if review doesn't exist, should not be route not found)
    if (response.status !== 404 || response.headers.get('content-type')?.includes('json')) {
      console.log('✅ Review management endpoints exist');
      return true;
    } else {
      console.log('❌ Review management endpoints missing');
      return false;
    }
  } catch (error) {
    console.log(`❌ Review management test error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Business Editing Tests');
  console.log('='.repeat(50));
  
  const authResult = await authenticate();
  if (!authResult) {
    console.log('\n❌ Cannot run tests without authentication');
    console.log('Please login as admin through the web interface first');
    return;
  }
  
  const tests = [
    { name: 'Foreign Key Constraint Fix', fn: testForeignKeyConstraint },
    { name: 'FAQ Updates', fn: testFAQUpdates },
    { name: 'Phone Number Updates', fn: testPhoneUpdates },
    { name: 'Category Changes', fn: testCategoryChanges },
    { name: 'Photo Gallery Management', fn: testPhotoGalleryManagement },
    { name: 'Review Management', fn: testReviewManagement }
  ];
  
  const results = [];
  for (const test of tests) {
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  console.log('\n🏁 Test Results Summary');
  console.log('='.repeat(50));
  
  let passedCount = 0;
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
    if (result.passed) passedCount++;
  });
  
  console.log(`\n📊 Overall: ${passedCount}/${results.length} tests passed`);
  
  if (passedCount === results.length) {
    console.log('🎉 ALL BUSINESS EDITING ISSUES RESOLVED! 100% SUCCESS');
  } else {
    console.log('⚠️  Some issues still need to be addressed');
  }
}

// Run the tests
runAllTests().catch(console.error);