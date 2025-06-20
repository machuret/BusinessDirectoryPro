#!/usr/bin/env node

/**
 * Deployment Build Script
 * Creates the correct build output structure for deployment platforms
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Building for deployment...');

try {
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Step 1: Build the frontend with Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Build the backend to the correct location (dist/index.js)
  console.log('🔧 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  
  // Step 3: Copy static files if they exist
  console.log('📁 Copying static assets...');
  if (fs.existsSync('public')) {
    if (!fs.existsSync('server/public')) {
      fs.mkdirSync('server/public', { recursive: true });
    }
    execSync('cp -r public/* server/public/', { stdio: 'inherit' });
    console.log('✅ Static assets copied to server/public');
  }
  
  // Step 4: Create a production package.json in dist
  const prodPackageJson = {
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
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
  console.log('✅ Created production package.json');
  
  // Step 5: Verify build outputs
  console.log('🔍 Verifying build outputs...');
  
  const requiredFiles = ['dist/index.js', 'dist/package.json'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:', missingFiles);
    process.exit(1);
  }
  
  console.log('✅ All required files present');
  console.log('📊 Build summary:');
  console.log('  - Frontend built and ready');
  console.log('  - Backend compiled to dist/index.js');
  console.log('  - Static assets prepared');
  console.log('  - Production package.json created');
  
  console.log('\n🎉 Deployment build completed successfully!');
  console.log('💡 To start in production: cd dist && npm start');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}