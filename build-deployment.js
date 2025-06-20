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

console.log('🚀 Starting deployment build process...');

try {
  // Clean previous build outputs
  const distDir = path.join(__dirname, 'dist');
  const publicDir = path.join(__dirname, 'public');
  
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('✅ Cleaned dist directory');
  }
  
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
    console.log('✅ Cleaned public directory');
  }

  // Step 1: Build the frontend with Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Step 2: Build the backend with esbuild to match start script expectation (dist/index.js)
  console.log('🔧 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Step 3: Verify frontend build location (Vite builds to ../public as per config)
  // The Vite config outputs to ../public, so check if it exists there
  const viteOutputDir = path.join(__dirname, '..', 'public');
  const correctPublicDir = path.join(__dirname, 'server', 'public');
  
  if (fs.existsSync(viteOutputDir)) {
    // Ensure server directory exists
    const serverDir = path.join(__dirname, 'server');
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    
    // Copy frontend build to server/public for static serving
    fs.cpSync(viteOutputDir, correctPublicDir, { recursive: true });
    console.log('✅ Copied frontend build to server/public');
  } else {
    console.log('⚠️ Frontend build not found at expected location, checking alternative paths...');
    
    // Check if build went to ./public instead
    const altPublicDir = path.join(__dirname, 'public');
    if (fs.existsSync(altPublicDir)) {
      fs.cpSync(altPublicDir, correctPublicDir, { recursive: true });
      console.log('✅ Found and copied frontend build from ./public');
    }
  }

  // Step 4: Verify build outputs
  const backendFile = path.join(distDir, 'index.js');
  const frontendFile = path.join(frontendBuildTarget, 'index.html');
  
  if (!fs.existsSync(backendFile)) {
    throw new Error('Backend build failed - dist/index.js not found');
  }
  
  if (!fs.existsSync(frontendFile)) {
    throw new Error('Frontend build failed - server/public/index.html not found');
  }

  console.log('✅ Deployment build completed successfully!');
  console.log('📁 Backend: dist/index.js');
  console.log('📁 Frontend: server/public/index.html');
  console.log('🚀 Ready for deployment with: npm start');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}