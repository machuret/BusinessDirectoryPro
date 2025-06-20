#!/usr/bin/env node

/**
 * Fix Deployment Configuration
 * Addresses all deployment issues without modifying restricted files
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Fixing deployment configuration...');

try {
  // Step 1: Create corrected build script that aligns outputs
  console.log('Creating deployment-compatible build script...');
  
  const deployBuildScript = `#!/usr/bin/env node
// Deployment build script - aligns build outputs with start script expectations

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for deployment...');

// Build frontend first
execSync('npx vite build', { stdio: 'inherit' });

// Build backend to dist/index.js to match start script
execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });

// Copy frontend build to server/public for static serving
const publicSrc = path.resolve('../public');
const publicDest = path.resolve('server/public');

if (fs.existsSync(publicSrc)) {
  if (fs.existsSync(publicDest)) {
    fs.rmSync(publicDest, { recursive: true });
  }
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('Frontend copied to server/public');
}

console.log('Deployment build complete');
`;

  fs.writeFileSync('build-fixed.js', deployBuildScript);
  console.log('✅ Created deployment build script');

  // Step 2: Create production start script that ensures proper configuration
  const startScript = `#!/usr/bin/env node
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
`;

  fs.writeFileSync('start-production.js', startScript);
  console.log('✅ Created production start script');

  // Step 3: Create Vercel configuration for proper deployment
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "server/index.ts",
        "use": "@vercel/node",
        "config": {
          "includeFiles": ["server/**", "shared/**"]
        }
      },
      {
        "src": "client/**",
        "use": "@vercel/static-build",
        "config": {
          "distDir": "../public"
        }
      }
    ],
    "routes": [
      {
        "src": "/api/(.*)",
        "dest": "/server/index.ts"
      },
      {
        "src": "/(.*)",
        "dest": "/public/$1"
      }
    ],
    "env": {
      "NODE_ENV": "production"
    }
  };

  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Created Vercel configuration');

  // Step 4: Test server configuration
  console.log('Testing server configuration...');
  
  // Verify server binds to 0.0.0.0 (already correct in server/index.ts)
  const serverContent = fs.readFileSync('server/index.ts', 'utf8');
  if (serverContent.includes('0.0.0.0')) {
    console.log('✅ Server correctly configured to bind to 0.0.0.0');
  } else {
    console.log('⚠️ Server may need host configuration update');
  }

  console.log('\n🚀 Deployment fixes completed!');
  console.log('\nTo build for deployment:');
  console.log('  node build-fixed.js');
  console.log('\nTo start in production:');
  console.log('  node start-production.js');
  console.log('\nVercel deployment ready with vercel.json configuration');

} catch (error) {
  console.error('❌ Fix failed:', error.message);
  process.exit(1);
}