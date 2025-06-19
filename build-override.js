#!/usr/bin/env node

// Override build script to fix deployment configuration
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building with correct output directories...');

try {
  // Clean previous outputs
  const publicDir = path.join(__dirname, 'public');
  const apiDir = path.join(__dirname, 'api');
  
  // Build frontend to public directory
  console.log('Building frontend to public/...');
  execSync('npx vite build --outDir public --emptyOutDir', { 
    stdio: 'inherit',
    cwd: __dirname
  });

  // Build backend to api directory  
  console.log('Building backend to api/...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api', {
    stdio: 'inherit', 
    cwd: __dirname
  });

  // Verify outputs
  if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
    throw new Error('Frontend build failed');
  }
  
  if (!fs.existsSync(path.join(apiDir, 'index.js'))) {
    throw new Error('Backend build failed');
  }

  console.log('Build completed successfully');
  console.log('- Frontend: public/');
  console.log('- Backend: api/');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}