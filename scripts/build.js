#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend for Vercel deployment...');

try {
  // Build frontend with Vite
  execSync('vite build', { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Verify build output
  const distPath = path.join(process.cwd(), 'client/dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build failed: client/dist directory not found');
  }

  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Build failed: index.html not found');
  }

  console.log('Frontend build completed successfully');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}