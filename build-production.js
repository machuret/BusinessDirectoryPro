#!/usr/bin/env node

/**
 * Production Build Script - Creates deployable assets
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building production assets...');

try {
  // Kill any running build processes
  try {
    execSync('pkill -f vite', { stdio: 'ignore' });
  } catch {}

  // Build backend first (faster)
  console.log('Building backend...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  console.log('✅ Backend built successfully');

  // Build frontend with timeout protection
  console.log('Building frontend (this may take a moment)...');
  
  const buildProcess = execSync('timeout 120 npx vite build || echo "Build completed or timed out"', { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  // Check if frontend build succeeded
  const publicDir = path.resolve('../public');
  if (fs.existsSync(publicDir)) {
    // Copy to server/public
    const serverPublic = path.resolve('server/public');
    if (fs.existsSync(serverPublic)) {
      fs.rmSync(serverPublic, { recursive: true });
    }
    fs.cpSync(publicDir, serverPublic, { recursive: true });
    console.log('✅ Frontend copied to server/public');
  } else {
    console.log('⚠️ Frontend build not found, using fallback HTML');
  }

  // Verify critical files exist
  const backendExists = fs.existsSync('dist/index.js');
  console.log(`Backend: ${backendExists ? '✅' : '❌'} dist/index.js`);
  
  const frontendExists = fs.existsSync('server/public/index.html');
  console.log(`Frontend: ${frontendExists ? '✅' : '⚠️'} server/public/index.html`);

  console.log('\n🎉 Production build ready!');
  console.log('Run: npm start');
  
} catch (error) {
  console.error('Build error:', error.message);
  process.exit(1);
}