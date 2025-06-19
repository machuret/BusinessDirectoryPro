#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting Vercel static build...');

try {
  // Clean any existing build
  const distDir = path.join(process.cwd(), 'client/dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('Cleaned existing build directory');
  }

  // Run Vite build
  console.log('Building React app with Vite...');
  execSync('npm run build:client', { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Verify build output
  if (!fs.existsSync(distDir)) {
    throw new Error('Build failed: client/dist directory not created');
  }

  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Build failed: index.html not found');
  }

  // Copy build to Vercel's expected location
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  
  // Copy dist contents to public (Vercel's static output)
  execSync(`cp -r ${distDir}/* ${publicDir}/`, { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully');
  console.log('Static assets ready for deployment');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}