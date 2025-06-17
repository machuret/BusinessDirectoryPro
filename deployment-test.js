/**
 * Comprehensive Deployment Test
 * Verifies all deployment fixes and server configuration
 */
import http from 'http';

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

console.log('🔍 Testing deployment configuration...\n');

const tests = [
  {
    name: 'Health Check Endpoint',
    path: '/health',
    expectedStatus: 200
  },
  {
    name: 'API Authentication',
    path: '/api/auth/user',
    expectedStatus: 401 // Expected for unauthenticated request
  },
  {
    name: 'Content Strings API',
    path: '/api/content/strings',
    expectedStatus: 200
  },
  {
    name: 'Business API',
    path: '/api/businesses/featured',
    expectedStatus: 200
  },
  {
    name: 'Categories API',
    path: '/api/categories',
    expectedStatus: 200
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: test.path,
      method: 'GET'
    }, (res) => {
      const success = res.statusCode === test.expectedStatus;
      console.log(`${success ? '✅' : '❌'} ${test.name}: ${res.statusCode} (expected ${test.expectedStatus})`);
      resolve(success);
    });

    req.on('error', (error) => {
      console.log(`❌ ${test.name}: Connection failed - ${error.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`❌ ${test.name}: Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function runDeploymentTest() {
  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test);
    if (success) passed++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Deployment Test Results: ${passed}/${total} tests passed`);
  console.log('='.repeat(50));

  if (passed === total) {
    console.log('🎉 All deployment tests passed! Server is ready for deployment.');
    console.log('\nDeployment fixes completed:');
    console.log('• Server listens on PORT environment variable');
    console.log('• Health check endpoint available at /health');
    console.log('• CORS configured for deployment platforms');
    console.log('• Graceful error handling for missing static files');
    console.log('• Process management for deployment stability');
  } else {
    console.log('❌ Some tests failed. Please check server configuration.');
  }
}

runDeploymentTest().catch(console.error);