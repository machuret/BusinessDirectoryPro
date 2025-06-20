#!/usr/bin/env node

/**
 * Complete Deployment Solution
 * Builds the application with correct output structure for all deployment platforms
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building complete deployment package...');

try {
  // Clean previous builds
  ['dist', 'api', 'public'].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // Create directories
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('api', { recursive: true });

  console.log('📦 Building backend for multiple deployment targets...');
  
  // Build 1: For package.json start script (dist/index.js)
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', {
    stdio: 'inherit'
  });
  
  // Build 2: For Vercel serverless (api/index.js)
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=api/index.js', {
    stdio: 'inherit'
  });

  console.log('🌐 Building frontend...');
  execSync('npx vite build --outDir public', {
    stdio: 'inherit'
  });

  // Copy frontend to server directory for static serving
  if (fs.existsSync('public')) {
    const serverPublicDir = path.join('server', 'public');
    if (fs.existsSync(serverPublicDir)) {
      fs.rmSync(serverPublicDir, { recursive: true });
    }
    fs.cpSync('public', serverPublicDir, { recursive: true });
  }

  // Create deployment package.json
  const deployPackage = {
    "name": "business-directory-deploy",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "start": "NODE_ENV=production node index.js"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(deployPackage, null, 2));

  // Verify all builds
  const requiredFiles = [
    'dist/index.js',
    'api/index.js', 
    'public/index.html',
    'server/public/index.html'
  ];

  console.log('✅ Verifying build outputs...');
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✓ ${file}`);
    } else {
      throw new Error(`Missing required file: ${file}`);
    }
  });

  console.log('\n🎉 Deployment package ready!');
  console.log('\nGenerated files:');
  console.log('  dist/index.js      - Main server (for npm start)');
  console.log('  api/index.js       - Serverless function (for Vercel)');
  console.log('  public/            - Frontend static files');
  console.log('  server/public/     - Frontend for Express static serving');
  console.log('  vercel.json        - Vercel configuration');

  console.log('\nDeployment options:');
  console.log('  1. Vercel: Ready with vercel.json');
  console.log('  2. Railway/Render: Use dist/ directory');
  console.log('  3. Replit: Already configured');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}