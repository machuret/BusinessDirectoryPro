#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests all deployment fixes and validates the build process
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying deployment configuration...');

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function runTest(name, testFn) {
  try {
    const result = testFn();
    if (result) {
      tests.passed++;
      tests.results.push(`✅ ${name}`);
      console.log(`✅ ${name}`);
    } else {
      tests.failed++;
      tests.results.push(`❌ ${name}`);
      console.log(`❌ ${name}`);
    }
  } catch (error) {
    tests.failed++;
    tests.results.push(`❌ ${name}: ${error.message}`);
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// Test 1: Verify server configuration
runTest('Server binds to 0.0.0.0', () => {
  const serverContent = fs.readFileSync('server/index.ts', 'utf8');
  return serverContent.includes('0.0.0.0');
});

// Test 2: Verify PORT environment variable usage
runTest('Server uses PORT environment variable', () => {
  const serverContent = fs.readFileSync('server/index.ts', 'utf8');
  return serverContent.includes('process.env.PORT');
});

// Test 3: Check TypeScript configuration
runTest('TypeScript configuration has output directory', () => {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  return tsconfig.compilerOptions.outDir === './dist';
});

// Test 4: Verify deployment build script exists
runTest('Deployment build script exists', () => {
  return fs.existsSync('build-deployment.js');
});

// Test 5: Verify production start script exists
runTest('Production start script exists', () => {
  return fs.existsSync('start-production.js');
});

// Test 6: Test the actual build process
runTest('Build process creates dist/index.js', () => {
  console.log('  Running build process...');
  execSync('node build-deployment.js', { stdio: 'pipe' });
  return fs.existsSync('dist/index.js');
});

// Test 7: Verify dist package.json is created
runTest('Production package.json created', () => {
  const exists = fs.existsSync('dist/package.json');
  if (exists) {
    const pkg = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
    return pkg.main === 'index.js' && pkg.scripts.start === 'node index.js';
  }
  return false;
});

// Test 8: Verify static assets handling
runTest('Static assets configuration present', () => {
  const serverContent = fs.readFileSync('server/index.ts', 'utf8');
  return serverContent.includes('serveStatic') && serverContent.includes('server/public');
});

console.log('\n📊 Deployment Verification Results:');
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);

if (tests.failed === 0) {
  console.log('\n🎉 All deployment fixes verified successfully!');
  console.log('\n📋 Deployment Instructions:');
  console.log('1. Build for deployment: node build-deployment.js');
  console.log('2. Start in production: node start-production.js');
  console.log('3. Or from dist directory: cd dist && npm start');
  console.log('\n🚀 Ready for deployment to any platform!');
} else {
  console.log('\n⚠️ Some tests failed. Please review the issues above.');
  process.exit(1);
}