/**
 * Test production mode server behavior
 */
import { spawn } from 'child_process';
import http from 'http';

console.log('Testing production mode server...');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = '3001';

// Start server in production mode
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: '3001' },
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverReady = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Server output:', output);
  
  if (output.includes('serving on port') && !serverReady) {
    serverReady = true;
    setTimeout(testEndpoints, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

async function testEndpoints() {
  const tests = [
    { path: '/', name: 'Root endpoint' },
    { path: '/health', name: 'Health check' },
    { path: '/api/auth/user', name: 'API endpoint' },
    { path: '/nonexistent', name: 'Fallback route' }
  ];
  
  console.log('\nTesting production endpoints...');
  
  for (const test of tests) {
    try {
      const response = await makeRequest(test.path);
      console.log(`✅ ${test.name}: ${response.statusCode}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
  
  console.log('\nProduction mode test completed');
  serverProcess.kill();
  process.exit(0);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// Cleanup
process.on('SIGINT', () => {
  if (serverProcess) serverProcess.kill();
  process.exit(0);
});

setTimeout(() => {
  console.log('Test timeout - server may not have started');
  if (serverProcess) serverProcess.kill();
  process.exit(1);
}, 30000);