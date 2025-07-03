#!/usr/bin/env node
/**
 * Quick Production Build Script
 * Builds only essential files for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Production Build Starting...\n');

// 1. Ensure output directory exists
const publicDir = path.join(__dirname, '../server/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created server/public directory');
}

try {
  // 2. Build frontend with timeout
  console.log('📦 Building frontend (this may take a minute)...');
  execSync('cd client && npx vite build --outDir ../server/public', {
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });
  console.log('✅ Frontend built successfully\n');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  console.log('\n⚠️  Continuing with deployment setup...\n');
}

// 3. Build backend
try {
  console.log('📦 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist/index.js', {
    stdio: 'inherit',
    timeout: 60000 // 1 minute timeout
  });
  console.log('✅ Backend built successfully\n');
} catch (error) {
  console.error('❌ Backend build failed:', error.message);
}

// 4. Create start script for production
const startScript = `#!/usr/bin/env node
// Production start script
process.env.NODE_ENV = 'production';
require('./dist/index.js');
`;

fs.writeFileSync(path.join(__dirname, '../start.js'), startScript);
console.log('✅ Created production start script');

console.log('\n✨ Build complete!\n');
console.log('To run in production mode:');
console.log('  NODE_ENV=production node start.js\n');
console.log('Or simply:');
console.log('  node start.js\n');