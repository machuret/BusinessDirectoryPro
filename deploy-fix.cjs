#!/usr/bin/env node
/**
 * Deployment Fix Script
 * Ensures the app runs in production mode on deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing deployment configuration...\n');

// Create a production package.json for deployment
const deployPackageJson = {
  "name": "business-directory-production",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "NODE_ENV=production node dist/index.js",
    "start:prod": "NODE_ENV=production node dist/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

// Write deployment package.json
fs.writeFileSync(
  path.join(__dirname, 'deploy-package.json'),
  JSON.stringify(deployPackageJson, null, 2)
);

// Create .replit configuration for production
const replitConfig = `
run = "NODE_ENV=production npm start"
modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "NODE_ENV=production npm start"]

[[ports]]
localPort = 5000
externalPort = 80
`;

fs.writeFileSync(
  path.join(__dirname, '.replit'),
  replitConfig.trim()
);

console.log('✅ Created deployment configuration files\n');

// Create deployment instructions
const instructions = `
DEPLOYMENT INSTRUCTIONS:
========================

For Replit Deployment:
1. The app will now run in production mode automatically
2. Make sure environment variables are set in Secrets
3. Deploy using the Replit Deploy button

The key fix: NODE_ENV=production is now set automatically

Your app should now show the real business directory
instead of the fallback page!
`;

console.log(instructions);

// Check if static files exist
const publicPath = path.join(__dirname, 'server/public');
if (!fs.existsSync(path.join(publicPath, 'index.html'))) {
  console.log('\n⚠️  Note: Production build files are missing.');
  console.log('The app may need to build on first deployment.\n');
}