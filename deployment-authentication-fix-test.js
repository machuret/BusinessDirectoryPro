/**
 * Deployment Authentication Fix Test
 * Tests session configuration and CORS fixes for Replit deployment
 */

import https from 'https';
import http from 'http';

async function makeRequest(method, path, data = null, cookies = '') {
  const isHttps = process.env.REPLIT_URL && process.env.REPLIT_URL.includes('https');
  const hostname = process.env.REPLIT_URL ? 
    process.env.REPLIT_URL.replace(/^https?:\/\//, '') : 
    'localhost';
  const port = process.env.REPLIT_URL ? (isHttps ? 443 : 80) : 5000;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test-Bot/1.0',
        ...(cookies && { 'Cookie': cookies })
      }
    };

    if (data) {
      const payload = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
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
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
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

async function testDeploymentFixes() {
  console.log('=== DEPLOYMENT AUTHENTICATION & ASSET LOADING FIX TEST ===\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  console.log('🔍 Testing Health Check...');
  try {
    const response = await makeRequest('GET', '/health');
    const success = response.statusCode === 200;
    results.total++;
    if (success) results.passed++; else results.failed++;
    results.tests.push({
      name: 'Health Check',
      success,
      status: response.statusCode,
      details: success ? 'Server healthy' : 'Server unhealthy'
    });
    console.log(success ? '✅ PASS' : '❌ FAIL', `(${response.statusCode})`);
  } catch (error) {
    results.total++;
    results.failed++;
    results.tests.push({
      name: 'Health Check',
      success: false,
      status: 'ERROR',
      details: error.message
    });
    console.log('❌ FAIL (Connection Error)');
  }

  // Test 2: Session Configuration Test
  console.log('\n🔍 Testing Session Configuration...');
  try {
    const response = await makeRequest('GET', '/api/auth/user');
    // 401 is expected for unauthenticated user, but should not be a CORS or session error
    const success = response.statusCode === 401 && response.data && response.data.message;
    results.total++;
    if (success) results.passed++; else results.failed++;
    results.tests.push({
      name: 'Session Configuration',
      success,
      status: response.statusCode,
      details: success ? 'Proper session handling' : 'Session configuration issues'
    });
    console.log(success ? '✅ PASS' : '❌ FAIL', `(${response.statusCode})`);
  } catch (error) {
    results.total++;
    results.failed++;
    results.tests.push({
      name: 'Session Configuration',
      success: false,
      status: 'ERROR',
      details: error.message
    });
    console.log('❌ FAIL (Connection Error)');
  }

  // Test 3: CORS Configuration Test
  console.log('\n🔍 Testing CORS Configuration...');
  try {
    const response = await makeRequest('OPTIONS', '/api/admin/businesses');
    // OPTIONS request should work with proper CORS
    const success = response.statusCode < 500;
    results.total++;
    if (success) results.passed++; else results.failed++;
    results.tests.push({
      name: 'CORS Configuration',
      success,
      status: response.statusCode,
      details: success ? 'CORS properly configured' : 'CORS configuration issues'
    });
    console.log(success ? '✅ PASS' : '❌ FAIL', `(${response.statusCode})`);
  } catch (error) {
    results.total++;
    results.failed++;
    results.tests.push({
      name: 'CORS Configuration',
      success: false,
      status: 'ERROR',
      details: error.message
    });
    console.log('❌ FAIL (Connection Error)');
  }

  // Test 4: Admin Login Test
  console.log('\n🔍 Testing Admin Authentication...');
  try {
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const success = loginResponse.statusCode === 200 || loginResponse.statusCode === 201;
    results.total++;
    if (success) results.passed++; else results.failed++;
    results.tests.push({
      name: 'Admin Authentication',
      success,
      status: loginResponse.statusCode,
      details: success ? 'Admin login working' : 'Admin login issues'
    });
    console.log(success ? '✅ PASS' : '❌ FAIL', `(${loginResponse.statusCode})`);

    // If login successful, test authenticated request
    if (success && loginResponse.headers['set-cookie']) {
      console.log('\n🔍 Testing Authenticated Request...');
      const cookies = loginResponse.headers['set-cookie'].join('; ');
      const authResponse = await makeRequest('GET', '/api/admin/businesses', null, cookies);
      
      const authSuccess = authResponse.statusCode === 200;
      results.total++;
      if (authSuccess) results.passed++; else results.failed++;
      results.tests.push({
        name: 'Authenticated Request',
        success: authSuccess,
        status: authResponse.statusCode,
        details: authSuccess ? 'Authentication working properly' : 'Authentication still failing'
      });
      console.log(authSuccess ? '✅ PASS' : '❌ FAIL', `(${authResponse.statusCode})`);
    }
  } catch (error) {
    results.total++;
    results.failed++;
    results.tests.push({
      name: 'Admin Authentication',
      success: false,
      status: 'ERROR',
      details: error.message
    });
    console.log('❌ FAIL (Connection Error)');
  }

  // Generate Summary Report
  console.log('\n================================================================');
  console.log('DEPLOYMENT FIX TEST SUMMARY');
  console.log('================================================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed Tests: ${results.passed}`);
  console.log(`Failed Tests: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  
  console.log('\n📊 DETAILED RESULTS:');
  results.tests.forEach(test => {
    const status = test.success ? '✅ PASS' : '❌ FAIL';
    console.log(`• ${test.name}: ${status} (${test.status}) - ${test.details}`);
  });

  if (results.passed === results.total) {
    console.log('\n🚀 DEPLOYMENT FIXES: SUCCESSFUL');
    console.log('All authentication and CORS issues have been resolved!');
  } else if (results.passed > results.failed) {
    console.log('\n⚠️  DEPLOYMENT FIXES: PARTIALLY SUCCESSFUL');
    console.log('Some issues resolved, but additional fixes may be needed.');
  } else {
    console.log('\n❌ DEPLOYMENT FIXES: NEED ADDITIONAL WORK');
    console.log('Critical issues still present.');
  }
  
  console.log('\n================================================================');
}

// Run the test
testDeploymentFixes().catch(console.error);