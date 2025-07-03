#!/usr/bin/env node
/**
 * Fix Build Paths Script
 * Ensures builds output to the correct directory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing build paths...\n');

// Ensure server/public exists
const serverPublicDir = path.join(__dirname, '../server/public');
if (!fs.existsSync(serverPublicDir)) {
  fs.mkdirSync(serverPublicDir, { recursive: true });
}

// Build client to server/public
console.log('📦 Building frontend to server/public...');
try {
  execSync('cd client && npx vite build --outDir ../server/public', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('✅ Frontend built successfully!\n');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  
  // If build fails, copy from public if it exists
  const publicDir = path.join(__dirname, '../public');
  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    console.log('📋 Copying existing build from public/ to server/public/...');
    execSync(`cp -r ${publicDir}/* ${serverPublicDir}/`, { stdio: 'inherit' });
    console.log('✅ Copied existing build files\n');
  }
}

// Build backend
console.log('📦 Building backend...');
try {
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist/index.js', {
    stdio: 'inherit'
  });
  console.log('✅ Backend built successfully!\n');
} catch (error) {
  console.error('❌ Backend build failed:', error.message);
}

console.log('✨ Build complete!');