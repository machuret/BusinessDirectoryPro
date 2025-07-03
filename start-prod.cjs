#!/usr/bin/env node
/**
 * Production Start Script
 * Forces the app to run in production mode
 */

// Set production environment
process.env.NODE_ENV = 'production';
console.log('Starting server in PRODUCTION mode...');

// Start the server
require('./dist/index.js');
