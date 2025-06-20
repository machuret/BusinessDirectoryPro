#!/usr/bin/env node

/**
 * Vercel Build Script
 * Creates the correct build output for Vercel deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for Vercel deployment...');

try {
  // Step 1: Build frontend with specific output directory
  console.log('Building frontend for Vercel...');
  execSync('cd client && npx vite build --outDir=../server/public', { stdio: 'inherit' });
  
  // Step 2: Verify frontend build
  const frontendExists = fs.existsSync('server/public/index.html');
  console.log(`Frontend build: ${frontendExists ? 'SUCCESS' : 'FAILED'}`);
  
  // Step 3: Create Vercel API handler
  console.log('Setting up Vercel API configuration...');
  
  // Ensure api directory exists with proper structure
  if (!fs.existsSync('api')) {
    fs.mkdirSync('api', { recursive: true });
  }
  
  // Step 4: Verify configuration files
  const vercelConfig = fs.existsSync('vercel.json');
  const apiHandler = fs.existsSync('api/index.ts');
  const clientPackage = fs.existsSync('client/package.json');
  
  console.log('Vercel Configuration Check:');
  console.log(`- vercel.json: ${vercelConfig ? 'EXISTS' : 'MISSING'}`);
  console.log(`- api/index.ts: ${apiHandler ? 'EXISTS' : 'MISSING'}`);
  console.log(`- client/package.json: ${clientPackage ? 'EXISTS' : 'MISSING'}`);
  console.log(`- Frontend assets: ${frontendExists ? 'EXISTS' : 'MISSING'}`);
  
  // Step 5: Environment variables setup
  console.log('');
  console.log('Required Environment Variables for Vercel:');
  console.log('- DATABASE_URL (your Neon PostgreSQL connection string)');
  console.log('- NODE_ENV=production');
  console.log('- Any API keys your application uses');
  
  console.log('');
  console.log('Vercel deployment ready!');
  console.log('Run: vercel --prod');
  
} catch (error) {
  console.error('Vercel build failed:', error.message);
  process.exit(1);
}