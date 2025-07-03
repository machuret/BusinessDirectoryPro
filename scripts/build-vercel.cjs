#!/usr/bin/env node
/**
 * Vercel Build Script
 * Builds the application for Vercel deployment
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Vercel build...\n');

// Change to client directory and build
console.log('📦 Building frontend...');
try {
  execSync('cd client && npx vite build --outDir ../server/public', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('✅ Frontend built successfully!\n');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Build backend for Vercel serverless
console.log('📦 Building backend for Vercel...');
try {
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outfile=api/index.js', {
    stdio: 'inherit'
  });
  console.log('✅ Backend built successfully!\n');
} catch (error) {
  console.error('❌ Backend build failed:', error.message);
  process.exit(1);
}

console.log('✨ Vercel build complete!');