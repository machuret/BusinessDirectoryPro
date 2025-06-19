#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting production build for Vercel...');

try {
  // Clean previous builds
  const publicDir = path.join(__dirname, 'public');
  const apiDir = path.join(__dirname, 'api');
  
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  if (fs.existsSync(apiDir)) {
    fs.rmSync(apiDir, { recursive: true, force: true });
  }

  console.log('Building frontend with Vite...');
  // Build frontend to public directory
  execSync('npx vite build --outDir public', { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('Building backend with esbuild...');
  // Build backend to api directory
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api', {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Verify outputs
  if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
    throw new Error('Frontend build failed - no index.html found');
  }
  
  if (!fs.existsSync(path.join(apiDir, 'index.js'))) {
    throw new Error('Backend build failed - no index.js found');
  }

  console.log('✅ Production build completed successfully');
  console.log('Frontend: /public/index.html');
  console.log('Backend: /api/index.js');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}