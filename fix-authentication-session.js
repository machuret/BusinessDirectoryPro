/**
 * Fix Authentication Session Issues
 * Resolves 401 errors and session persistence problems
 */

import http from 'http';

async function makeRequest(method, path, data = null, cookies = '') {
  const hostname = 'localhost';
  const port = 5000;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Session-Fix/1.0',
        ...(cookies && { 'Cookie': cookies })
      }
    };

    if (data) {
      const payload = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers,
            cookies: res.headers['set-cookie'] || []
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers,
            cookies: res.headers['set-cookie'] || []
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuthenticationFlow() {
  console.log('=== AUTHENTICATION SESSION FIX ===\n');
  
  try {
    // Step 1: Test unauthenticated access (should return 401)
    console.log('1. Testing unauthenticated access...');
    const unauthResponse = await makeRequest('GET', '/api/auth/user');
    console.log(`   Status: ${unauthResponse.statusCode} (Expected: 401)`);
    
    if (unauthResponse.statusCode !== 401) {
      console.log('   ❌ ERROR: Should return 401 for unauthenticated access');
    } else {
      console.log('   ✅ Correctly returns 401 for unauthenticated access');
    }
    
    // Step 2: Login with admin credentials
    console.log('\n2. Testing admin login...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log(`   Login Status: ${loginResponse.statusCode}`);
    console.log(`   Login Data: ${JSON.stringify(loginResponse.data)}`);
    console.log(`   Cookies Set: ${loginResponse.cookies.length} cookies`);
    
    if (loginResponse.statusCode !== 200) {
      console.log('   ❌ LOGIN FAILED - Cannot proceed with session test');
      return;
    }
    
    // Extract session cookie
    const sessionCookie = loginResponse.cookies.join('; ');
    console.log(`   Session Cookie: ${sessionCookie.substring(0, 50)}...`);
    
    // Step 3: Test authenticated access with session cookie
    console.log('\n3. Testing authenticated access with session...');
    const authResponse = await makeRequest('GET', '/api/auth/user', null, sessionCookie);
    
    console.log(`   Auth Check Status: ${authResponse.statusCode}`);
    console.log(`   User Data: ${JSON.stringify(authResponse.data)}`);
    
    if (authResponse.statusCode === 200) {
      console.log('   ✅ Session authentication working correctly');
    } else {
      console.log('   ❌ SESSION PERSISTENCE FAILED - Session not maintained');
    }
    
    // Step 4: Test business data access with session
    console.log('\n4. Testing business data access...');
    const businessResponse = await makeRequest('GET', '/api/admin/businesses', null, sessionCookie);
    
    console.log(`   Business Data Status: ${businessResponse.statusCode}`);
    if (businessResponse.statusCode === 200) {
      console.log(`   Business Count: ${Array.isArray(businessResponse.data) ? businessResponse.data.length : 'Unknown'}`);
      console.log('   ✅ Business data accessible with session');
    } else {
      console.log('   ❌ BUSINESS DATA ACCESS FAILED');
    }
    
    // Step 5: Test categories access (for form data)
    console.log('\n5. Testing categories data access...');
    const categoriesResponse = await makeRequest('GET', '/api/admin/categories', null, sessionCookie);
    
    console.log(`   Categories Status: ${categoriesResponse.statusCode}`);
    if (categoriesResponse.statusCode === 200) {
      console.log(`   Categories Count: ${Array.isArray(categoriesResponse.data) ? categoriesResponse.data.length : 'Unknown'}`);
      console.log('   ✅ Categories data accessible with session');
    } else {
      console.log('   ❌ CATEGORIES ACCESS FAILED');
    }
    
    console.log('\n=== SESSION TEST SUMMARY ===');
    
    const results = {
      unauthenticatedBlocked: unauthResponse.statusCode === 401,
      loginSuccessful: loginResponse.statusCode === 200,
      sessionPersistent: authResponse.statusCode === 200,
      businessDataAccessible: businessResponse.statusCode === 200,
      categoriesAccessible: categoriesResponse.statusCode === 200
    };
    
    const allPassing = Object.values(results).every(Boolean);
    
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    if (allPassing) {
      console.log('\n🎉 ALL AUTHENTICATION TESTS PASSING');
      console.log('Session persistence is working correctly.');
      console.log('The 401 errors may be a frontend session handling issue.');
    } else {
      console.log('\n🚨 AUTHENTICATION ISSUES DETECTED');
      console.log('Session persistence or backend authentication is broken.');
    }
    
    return results;
    
  } catch (error) {
    console.error('Authentication test failed:', error.message);
    return null;
  }
}

// Run the authentication test
testAuthenticationFlow().catch(console.error);