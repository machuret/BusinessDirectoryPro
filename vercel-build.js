#!/usr/bin/env node

/**
 * Fast Vercel Build Script
 * Optimized for quick deployment builds
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Vercel fast build starting...');

try {
  // Clean previous builds quickly
  ['public', 'api'].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // Build backend first (faster)
  console.log('Building API...');
  fs.mkdirSync('api', { recursive: true });
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=api/index.js', {
    stdio: 'pipe' // Suppress verbose output
  });

  // Create package.json for API
  fs.writeFileSync('api/package.json', JSON.stringify({ type: 'module' }, null, 2));

  // Build frontend with minimal output
  console.log('Building frontend...');
  execSync('npx vite build --outDir public --emptyOutDir', {
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Verify builds
  if (!fs.existsSync('public/index.html')) {
    throw new Error('Frontend build failed');
  }
  
  if (!fs.existsSync('api/index.js')) {
    throw new Error('API build failed');
  }

  console.log('Vercel build completed successfully');
  console.log('Frontend ready:', fs.existsSync('public/index.html') ? '✓' : '✗');
  console.log('API ready:', fs.existsSync('api/index.js') ? '✓' : '✗');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}