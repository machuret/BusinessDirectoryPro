#!/usr/bin/env node
/**
 * Deployment Build Script
 * Creates a complete production build with all assets
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment build...\n');

try {
  // Step 1: Clean previous builds
  console.log('📦 Cleaning previous builds...');
  const publicPath = path.join(process.cwd(), 'server/public');
  const apiPath = path.join(process.cwd(), 'api');
  
  if (fs.existsSync(publicPath)) {
    fs.rmSync(publicPath, { recursive: true, force: true });
  }
  fs.mkdirSync(publicPath, { recursive: true });
  
  if (fs.existsSync(apiPath)) {
    fs.rmSync(apiPath, { recursive: true, force: true });
  }

  // Step 2: Build frontend from root using correct vite config
  console.log('\n🔨 Building frontend with Vite...');
  execSync('npx vite build client --outDir server/public', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production'
    }
  });

  // Step 3: Verify CSS was built
  const cssFiles = fs.readdirSync(path.join(publicPath, 'assets')).filter(f => f.endsWith('.css'));
  if (cssFiles.length === 0) {
    throw new Error('No CSS files generated - Tailwind may not be configured correctly');
  }
  console.log(`✅ CSS generated: ${cssFiles.join(', ')}`);

  // Step 4: Build backend
  console.log('\n🔧 Building backend API...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production'
    }
  });

  // Step 5: Verify complete build
  console.log('\n✅ Verifying build outputs...');
  
  const indexHtml = path.join(publicPath, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    throw new Error('index.html not found in build output');
  }
  
  const assetsDir = path.join(publicPath, 'assets');
  if (!fs.existsSync(assetsDir)) {
    throw new Error('assets directory not found in build output');
  }
  
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  if (jsFiles.length === 0) {
    throw new Error('No JS files in assets directory');
  }

  // Display build summary
  console.log('\n📊 Build Summary:');
  console.log(`- Frontend: ${publicPath}`);
  console.log(`- Assets: ${jsFiles.length} JS files, ${cssFiles.length} CSS files`);
  console.log(`- Backend: api/index.js`);
  
  console.log('\n🎉 Deployment build completed successfully!');
  console.log('Your app is ready for deployment.');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  if (error.stdout) {
    console.error('Output:', error.stdout.toString());
  }
  if (error.stderr) {
    console.error('Error:', error.stderr.toString());
  }
  process.exit(1);
}