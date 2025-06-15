/**
 * E2E Test Runner Script
 * Runs comprehensive end-to-end tests for the business directory platform
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
const sleep = promisify(setTimeout);

async function waitForServer(url = 'http://localhost:5000', timeout = 30000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✓ Server is ready');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await sleep(1000);
  }
  
  throw new Error('Server failed to start within timeout');
}

async function runE2ETests() {
  console.log('🚀 Starting End-to-End Test Suite...');
  
  try {
    // Step 1: Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    await waitForServer();
    
    // Step 2: Run Cypress tests
    console.log('🧪 Running Cypress E2E tests...');
    
    const cypressProcess = spawn('npx', ['cypress', 'run', '--spec', 'cypress/e2e/full-lifecycle.cy.ts'], {
      stdio: 'inherit',
      shell: true
    });
    
    return new Promise((resolve, reject) => {
      cypressProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ All E2E tests passed!');
          console.log('\n📊 Test Summary:');
          console.log('- User registration and authentication');
          console.log('- Business creation and management');
          console.log('- Featured request submission');
          console.log('- Admin approval workflow');
          console.log('- Public visibility verification');
          resolve();
        } else {
          console.log(`❌ Tests failed with exit code ${code}`);
          reject(new Error(`Cypress tests failed`));
        }
      });
      
      cypressProcess.on('error', (error) => {
        console.error('Failed to run Cypress:', error);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('❌ E2E Test Suite failed:', error.message);
    process.exit(1);
  }
}

// Add fallback for older Node.js versions without fetch
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

// Run the tests
runE2ETests().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});