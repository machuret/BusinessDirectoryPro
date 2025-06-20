#!/usr/bin/env node
// Production start script with deployment fixes

import { spawn } from 'child_process';
import path from 'path';

// Set production environment
process.env.NODE_ENV = 'production';

// Ensure proper port configuration
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

console.log('Starting production server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Start the built server
const serverPath = path.resolve('dist/index.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('Server start error:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log('Server exited with code:', code);
  process.exit(code);
});
