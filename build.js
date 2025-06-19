#!/usr/bin/env node

// Vercel build script for static-build preset
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

try {
  // Build the frontend with Vite
  console.log('Building frontend with Vite...');
  execSync('vite build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Ensure the dist directory exists and has the right structure
  const distDir = path.join(process.cwd(), 'client/dist');
  
  if (!fs.existsSync(distDir)) {
    throw new Error('Build failed: client/dist directory not found');
  }

  const indexFile = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexFile)) {
    throw new Error('Build failed: index.html not found in client/dist');
  }

  console.log('Frontend build completed successfully');
  console.log('Build artifacts ready for deployment');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}