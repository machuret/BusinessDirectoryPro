#!/usr/bin/env node

/**
 * Deployment Build Script
 * Creates the correct build output structure for deployment platforms
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for deployment...');

try {
  // Step 1: Build the frontend using Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Copy frontend build from ../public to server/public where server expects it
  console.log('📁 Moving frontend files to server/public...');
  const frontendSource = path.resolve('../public');
  const frontendDest = path.resolve('server/public');
  
  // Create server directory if it doesn't exist
  if (!fs.existsSync('server')) {
    fs.mkdirSync('server', { recursive: true });
  }
  
  // Remove existing public directory
  if (fs.existsSync(frontendDest)) {
    fs.rmSync(frontendDest, { recursive: true });
  }
  
  // Copy frontend build to server/public
  if (fs.existsSync(frontendSource)) {
    fs.cpSync(frontendSource, frontendDest, { recursive: true });
    console.log('✅ Frontend files copied to server/public');
  } else {
    console.error('❌ Frontend build not found at:', frontendSource);
    process.exit(1);
  }
  
  // Step 3: Build the backend to dist/index.js (matching start script expectation)
  console.log('🔧 Building backend...');
  
  // Create dist directory
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  
  console.log('✅ Backend built to dist/index.js');
  
  // Step 4: Verify build outputs
  console.log('🔍 Verifying build outputs...');
  
  const distIndexExists = fs.existsSync('dist/index.js');
  const publicIndexExists = fs.existsSync('server/public/index.html');
  
  if (distIndexExists) {
    console.log('✅ Backend: dist/index.js exists');
  } else {
    console.error('❌ Backend: dist/index.js missing');
    process.exit(1);
  }
  
  if (publicIndexExists) {
    console.log('✅ Frontend: server/public/index.html exists');
  } else {
    console.error('❌ Frontend: server/public/index.html missing');
    process.exit(1);
  }
  
  console.log('🎉 Deployment build completed successfully!');
  console.log('');
  console.log('Build outputs:');
  console.log('  - Backend: dist/index.js');
  console.log('  - Frontend: server/public/');
  console.log('');
  console.log('Ready for deployment! Run: npm start');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}