#!/usr/bin/env node

/**
 * Complete Deployment Solution
 * Builds the application with correct output structure for all deployment platforms
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building application for deployment...');

try {
  // Clean previous builds
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  fs.mkdirSync('dist', { recursive: true });

  // Build frontend (outputs to public/)
  console.log('Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build backend to dist/index.js (matches start script expectation)
  console.log('Building backend...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  
  // Copy static files to server/public for production serving
  if (fs.existsSync('public')) {
    if (!fs.existsSync('server/public')) {
      fs.mkdirSync('server/public', { recursive: true });
    }
    execSync('cp -r public/* server/public/ 2>/dev/null || true', { stdio: 'inherit' });
  }
  
  // Create package.json for dist directory
  const packageJson = {
    "name": "business-directory",
    "version": "1.0.0",
    "type": "module",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
  
  // Verify build output
  if (!fs.existsSync('dist/index.js')) {
    throw new Error('Backend compilation failed - dist/index.js not created');
  }
  
  console.log('Build completed successfully!');
  console.log('Files created:');
  console.log('- dist/index.js (compiled backend)');
  console.log('- dist/package.json (production dependencies)');
  console.log('- server/public/ (static assets)');
  
  console.log('\nDeployment ready!');
  console.log('To start: NODE_ENV=production node dist/index.js');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}