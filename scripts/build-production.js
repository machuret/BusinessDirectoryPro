#!/usr/bin/env node
/**
 * Production Build Script - Creates deployable assets
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build...');

try {
  // Clean existing builds
  console.log('📦 Cleaning previous builds...');
  const clientDistPath = path.join(process.cwd(), 'client/dist');
  const serverPublicPath = path.join(process.cwd(), 'server/public');
  const apiPath = path.join(process.cwd(), 'api');
  
  if (fs.existsSync(clientDistPath)) {
    fs.rmSync(clientDistPath, { recursive: true, force: true });
  }
  if (fs.existsSync(serverPublicPath)) {
    fs.rmSync(serverPublicPath, { recursive: true, force: true });
  }
  if (fs.existsSync(apiPath)) {
    fs.rmSync(apiPath, { recursive: true, force: true });
  }

  // Build frontend using client's vite config
  console.log('🔨 Building frontend with proper path aliases...');
  execSync('cd client && npx vite build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production'
    }
  });

  // Build backend
  console.log('🔧 Building backend API...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production'
    }
  });

  // Verify builds
  console.log('✅ Verifying build outputs...');
  
  const frontendBuild = path.join(process.cwd(), 'server/public/index.html');
  if (!fs.existsSync(frontendBuild)) {
    throw new Error('Frontend build failed: index.html not found');
  }
  
  const backendBuild = path.join(process.cwd(), 'api/index.js');
  if (!fs.existsSync(backendBuild)) {
    throw new Error('Backend build failed: index.js not found');
  }

  console.log('🎉 Production build completed successfully!');
  console.log('📁 Frontend built to: server/public/');
  console.log('📁 Backend built to: api/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}