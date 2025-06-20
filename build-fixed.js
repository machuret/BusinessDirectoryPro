#!/usr/bin/env node
// Deployment build script - aligns build outputs with start script expectations

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for deployment...');

// Build frontend first
execSync('npx vite build', { stdio: 'inherit' });

// Build backend to dist/index.js to match start script
execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });

// Copy frontend build to server/public for static serving
const publicSrc = path.resolve('../public');
const publicDest = path.resolve('server/public');

if (fs.existsSync(publicSrc)) {
  if (fs.existsSync(publicDest)) {
    fs.rmSync(publicDest, { recursive: true });
  }
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('Frontend copied to server/public');
}

console.log('Deployment build complete');
