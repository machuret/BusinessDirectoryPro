/**
 * Quick deployment fix verification
 * Tests server startup and health check endpoints
 */
import http from 'http';
import { spawn } from 'child_process';

console.log('Testing server startup and health checks...');

// Start server process
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverOutput = '';
serverProcess.stdout.on('data', (data) => {
  serverOutput += data.toString();
  if (data.toString().includes('serving on port')) {
    console.log('✅ Server started successfully');
    testHealthChecks();
  }
});

serverProcess.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

async function testHealthChecks() {
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const tests = [
    { path: '/', name: 'Root endpoint' },
    { path: '/health', name: 'Health check' },
    { path: '/api/content/strings', name: 'API endpoint' }
  ];
  
  for (const test of tests) {
    try {
      const result = await makeRequest(test.path);
      console.log(`✅ ${test.name}: ${result.statusCode}`);
    } catch (error) {
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
    }
  }
  
  console.log('Deployment fix verification completed');
  serverProcess.kill();
  process.exit(0);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    }, (res) => {
      resolve({ statusCode: res.statusCode });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// Cleanup on exit
process.on('SIGINT', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

setTimeout(() => {
  console.log('Test timeout - killing server');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(1);
}, 30000);