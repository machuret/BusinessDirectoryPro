#!/usr/bin/env node

/**
 * Production start script for Replit deployment
 * This bypasses the build process and runs the server directly
 */

import { spawn } from 'child_process';

console.log('Starting production server for Replit...');

// Set production environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

// Start the server directly using tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  env: process.env,
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  serverProcess.kill('SIGINT');
});