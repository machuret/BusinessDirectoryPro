#!/usr/bin/env node
/**
 * Production Start Script
 * Starts the server in production mode with proper environment
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting server in PRODUCTION mode...\n');

// Check if build exists
const fs = require('fs');
const publicPath = path.join(__dirname, 'server/public');
const indexPath = path.join(publicPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ ERROR: Production build not found!');
  console.error('Please run: npm run build');
  console.error('Build output should be in:', publicPath);
  process.exit(1);
}

// Start server with production environment
const server = spawn('node', ['dist/index.js'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000'
  },
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});