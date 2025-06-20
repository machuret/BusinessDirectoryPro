#!/usr/bin/env node

/**
 * Production Start Script
 * Handles missing dist directory gracefully and ensures proper server startup
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting production server...');

// Check if dist/index.js exists
const distPath = path.join(__dirname, 'dist', 'index.js');
const fallbackPath = path.join(__dirname, 'server', 'index.ts');

let serverPath;
let useTypeScript = false;

if (fs.existsSync(distPath)) {
  console.log('✅ Using compiled backend: dist/index.js');
  serverPath = distPath;
} else {
  console.log('⚠️ Compiled backend not found, falling back to TypeScript source');
  if (fs.existsSync(fallbackPath)) {
    console.log('✅ Using TypeScript source: server/index.ts');
    serverPath = fallbackPath;
    useTypeScript = true;
  } else {
    console.error('❌ No server files found. Please run the build script first.');
    process.exit(1);
  }
}

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server with appropriate runtime
const runtime = useTypeScript ? 'tsx' : 'node';
const args = useTypeScript ? ['tsx', serverPath] : [serverPath];

console.log(`🎯 Starting server with ${runtime}...`);

const server = spawn(runtime, useTypeScript ? [serverPath] : [], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000'
  }
});

server.on('error', (error) => {
  console.error('❌ Server start error:', error.message);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code: ${code}`);
  process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
});