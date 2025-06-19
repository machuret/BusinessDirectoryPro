#!/usr/bin/env node

/**
 * Frontend-only build script for Vercel deployment
 * Builds the React frontend to the public directory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend for Vercel deployment...');

try {
  // Ensure public directory exists
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }
  
  // Build the frontend with Vite, specifying client root and output
  const buildCommand = 'npx vite build --config vite.config.ts --mode production';
  
  console.log('Running:', buildCommand);
  execSync(buildCommand, { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Frontend build completed successfully');
  
  // Verify output
  if (fs.existsSync('public/index.html')) {
    console.log('✅ index.html found in public directory');
  } else {
    console.log('❌ index.html not found - checking build output...');
    const files = fs.readdirSync('public');
    console.log('Files in public:', files);
  }
  
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}