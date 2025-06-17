/**
 * Pre-deployment Configuration Checker
 * Validates environment and configuration before deployment
 */

import https from 'https';
import http from 'http';

async function makeRequest(method, path, data = null) {
  const hostname = 'localhost';
  const port = 5000;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
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
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
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

async function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  
  const required = ['SESSION_SECRET', 'DATABASE_URL'];
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required environment variables:', missing);
    return false;
  }
  
  console.log('✅ All required environment variables present');
  return true;
}

async function checkServerHealth() {
  console.log('\n🔍 Checking server health...');
  
  try {
    const response = await makeRequest('GET', '/health');
    if (response.statusCode === 200) {
      console.log('✅ Server health check passed');
      return true;
    } else {
      console.log('❌ Server health check failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
    return false;
  }
}

async function checkConfigurationHealth() {
  console.log('\n🔍 Checking configuration health...');
  
  try {
    const response = await makeRequest('GET', '/api/health/config');
    if (response.statusCode === 200) {
      const config = response.data;
      console.log(`✅ Platform detected: ${config.platform}`);
      console.log(`✅ Session secure: ${config.session.secure}`);
      console.log(`✅ Session sameSite: ${config.session.sameSite}`);
      console.log(`✅ CORS origin: ${config.cors.origin}`);
      console.log(`✅ CSP enabled: ${config.security.csp}`);
      return true;
    } else {
      console.log('❌ Configuration health check failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Configuration health check failed:', error.message);
    return false;
  }
}

async function checkAuthenticationEndpoints() {
  console.log('\n🔍 Checking authentication endpoints...');
  
  try {
    // Test unauthenticated request (should return 401)
    const response = await makeRequest('GET', '/api/auth/user');
    if (response.statusCode === 401) {
      console.log('✅ Authentication endpoint working (401 for unauthenticated)');
      return true;
    } else {
      console.log('❌ Authentication endpoint unexpected response:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication endpoint check failed:', error.message);
    return false;
  }
}

async function checkAdminEndpoints() {
  console.log('\n🔍 Checking admin endpoints accessibility...');
  
  try {
    // Test admin endpoint (should require authentication)
    const response = await makeRequest('GET', '/api/admin/businesses');
    if (response.statusCode === 401) {
      console.log('✅ Admin endpoints properly protected (401 without auth)');
      return true;
    } else {
      console.log('❌ Admin endpoints security check failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin endpoints check failed:', error.message);
    return false;
  }
}

async function runDeploymentCheck() {
  console.log('=== DEPLOYMENT CONFIGURATION CHECK ===\n');
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Server Health', fn: checkServerHealth },
    { name: 'Configuration Health', fn: checkConfigurationHealth },
    { name: 'Authentication Endpoints', fn: checkAuthenticationEndpoints },
    { name: 'Admin Endpoints', fn: checkAdminEndpoints }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    const result = await check.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n================================================================');
  console.log('DEPLOYMENT CHECK SUMMARY');
  console.log('================================================================');
  console.log(`Total Checks: ${checks.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / checks.length) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🚀 DEPLOYMENT READY: All checks passed!');
    console.log('The application is ready for deployment.');
  } else {
    console.log('\n⚠️  DEPLOYMENT ISSUES: Some checks failed');
    console.log('Please resolve the issues before deploying.');
  }
  
  console.log('\n================================================================');
  
  return failed === 0;
}

// Run the deployment check
runDeploymentCheck().catch(console.error);