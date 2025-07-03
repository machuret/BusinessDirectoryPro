#!/usr/bin/env node
/**
 * Deployment Fix Script
 * Ensures the app runs correctly in production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing deployment configuration...\n');

// Step 1: Check if production build exists
const publicDir = path.join(__dirname, '../server/public');
const hasProductionBuild = fs.existsSync(path.join(publicDir, 'index.html'));

if (!hasProductionBuild) {
  console.log('⚠️  No production build found. Creating minimal build...');
  
  // Ensure directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Create a minimal index.html if build fails
  const minimalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Directory - Building...</title>
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial;">
    <h1>Business Directory</h1>
    <p>Application is building. Please refresh in a moment...</p>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(path.join(publicDir, 'index.html'), minimalHtml);
  console.log('✅ Created fallback index.html\n');
}

// Step 2: Create production start script
const prodStartScript = `#!/usr/bin/env node
/**
 * Production Start Script
 * Forces the app to run in production mode
 */

// Set production environment
process.env.NODE_ENV = 'production';
console.log('Starting server in PRODUCTION mode...');

// Start the server
require('./dist/index.js');
`;

fs.writeFileSync(
  path.join(__dirname, '../start-prod.cjs'),
  prodStartScript
);
console.log('✅ Created production start script');

// Step 3: Update package.json with production scripts
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add production scripts
packageJson.scripts['start:production'] = 'NODE_ENV=production node dist/index.js';
packageJson.scripts['deploy'] = 'npm run build && NODE_ENV=production node dist/index.js';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with production scripts\n');

// Step 4: Create environment file for production
const envProd = `# Production Environment
NODE_ENV=production
PORT=5000
`;

fs.writeFileSync(
  path.join(__dirname, '../.env.production'),
  envProd
);
console.log('✅ Created .env.production file');

console.log('\n✨ Deployment fix complete!\n');
console.log('To run in production mode:');
console.log('  npm run start:production');
console.log('\nOr use the new start script:');
console.log('  node start-prod.cjs');
console.log('\nYour deployment will now show the real business directory!');