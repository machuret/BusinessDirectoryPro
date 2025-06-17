#!/usr/bin/env node

/**
 * Build script for Replit deployment
 */
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building for Replit deployment...');

try {
  // Clean previous builds
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  
  // Build frontend
  console.log('Building frontend assets...');
  execSync('npx vite build --outDir dist/public', { stdio: 'inherit' });
  
  // Build backend - output to dist/index.js as expected by package.json
  console.log('Building backend server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  
  // Verify build outputs
  const requiredFiles = ['dist/index.js', 'dist/public/index.html'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file ${file} was not created`);
    }
  }
  
  console.log('Build completed successfully!');
  console.log('Files created:');
  console.log('- dist/index.js (server)');
  console.log('- dist/public/ (frontend assets)');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}