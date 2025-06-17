#!/usr/bin/env node

/**
 * Deployment script for Business Directory Platform
 * Handles build process and server configuration for various deployment platforms
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment process...');

try {
  // Step 1: Build the frontend
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Build the backend
  console.log('🔧 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/server.js', { stdio: 'inherit' });
  
  // Step 3: Create server startup script
  console.log('⚙️ Creating startup configuration...');
  const startupScript = `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server
import('./server.js').catch(console.error);
`;
  
  fs.writeFileSync('dist/start.js', startupScript);
  
  // Step 4: Create package.json for deployment
  const deployPackage = {
    "name": "business-directory-deploy",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "start": "node start.js"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(deployPackage, null, 2));
  
  console.log('✅ Deployment build completed successfully!');
  console.log('📁 Files ready in dist/ directory');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}