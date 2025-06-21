#!/usr/bin/env node

/**
 * Vercel Deployment Verification Script
 * Validates that all required files and configurations are ready for deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Vercel deployment configuration...\n');

const checks = [];

// Check 1: vercel.json exists and is valid
if (fs.existsSync('vercel.json')) {
  try {
    const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    checks.push({ name: 'vercel.json', status: 'PASS', details: 'Configuration file exists and is valid JSON' });
  } catch (error) {
    checks.push({ name: 'vercel.json', status: 'FAIL', details: 'Invalid JSON format' });
  }
} else {
  checks.push({ name: 'vercel.json', status: 'FAIL', details: 'Configuration file missing' });
}

// Check 2: build.sh exists and is executable
if (fs.existsSync('build.sh')) {
  const stats = fs.statSync('build.sh');
  const isExecutable = !!(stats.mode & parseInt('111', 8));
  checks.push({ 
    name: 'build.sh', 
    status: isExecutable ? 'PASS' : 'WARN', 
    details: isExecutable ? 'Build script exists and is executable' : 'Build script exists but may need chmod +x' 
  });
} else {
  checks.push({ name: 'build.sh', status: 'FAIL', details: 'Build script missing' });
}

// Check 3: API function exists
if (fs.existsSync('api/index.js')) {
  const stats = fs.statSync('api/index.js');
  const sizeKB = Math.round(stats.size / 1024);
  checks.push({ 
    name: 'api/index.js', 
    status: 'PASS', 
    details: `Serverless function built (${sizeKB}KB)` 
  });
} else {
  checks.push({ name: 'api/index.js', status: 'FAIL', details: 'Serverless function not built - run ./build.sh' });
}

// Check 4: TypeScript source exists
if (fs.existsSync('api/index.ts')) {
  checks.push({ name: 'api/index.ts', status: 'PASS', details: 'TypeScript source file exists' });
} else {
  checks.push({ name: 'api/index.ts', status: 'FAIL', details: 'TypeScript source file missing' });
}

// Check 5: Frontend files exist
if (fs.existsSync('server/public/index.html')) {
  const stats = fs.statSync('server/public/index.html');
  const sizeKB = Math.round(stats.size / 1024);
  checks.push({ 
    name: 'Frontend Assets', 
    status: 'PASS', 
    details: `HTML file exists (${sizeKB}KB)` 
  });
} else {
  checks.push({ name: 'Frontend Assets', status: 'WARN', details: 'HTML file missing - will use embedded fallback' });
}

// Check 6: Package.json has required fields
if (fs.existsSync('package.json')) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasName = !!pkg.name;
    const hasType = pkg.type === 'module';
    const hasDeps = !!pkg.dependencies;
    
    if (hasName && hasType && hasDeps) {
      checks.push({ name: 'package.json', status: 'PASS', details: 'Valid package configuration' });
    } else {
      checks.push({ name: 'package.json', status: 'WARN', details: 'Missing some fields (name, type, dependencies)' });
    }
  } catch (error) {
    checks.push({ name: 'package.json', status: 'FAIL', details: 'Invalid JSON or missing file' });
  }
} else {
  checks.push({ name: 'package.json', status: 'FAIL', details: 'Package file missing' });
}

// Check 7: .vercelignore exists
if (fs.existsSync('.vercelignore')) {
  checks.push({ name: '.vercelignore', status: 'PASS', details: 'Deployment exclusions configured' });
} else {
  checks.push({ name: '.vercelignore', status: 'WARN', details: 'No deployment exclusions (optional)' });
}

// Display results
console.log('Verification Results:');
console.log('====================');

checks.forEach(check => {
  const icon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} ${check.name.padEnd(20)} ${check.status.padEnd(6)} ${check.details}`);
});

// Summary
const passed = checks.filter(c => c.status === 'PASS').length;
const warned = checks.filter(c => c.status === 'WARN').length;
const failed = checks.filter(c => c.status === 'FAIL').length;

console.log('\nSummary:');
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️ Warnings: ${warned}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 Ready for Vercel deployment!');
  console.log('\nNext steps:');
  console.log('1. Commit and push your changes to GitHub');
  console.log('2. Set environment variables in Vercel dashboard:');
  console.log('   - DATABASE_URL');
  console.log('   - NODE_ENV=production');
  console.log('3. Deploy with: vercel --prod');
} else {
  console.log('\n⚠️ Fix the failed checks before deploying.');
}

console.log('\nFor detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md');