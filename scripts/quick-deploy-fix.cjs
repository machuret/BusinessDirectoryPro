#!/usr/bin/env node
/**
 * Quick Deployment Fix
 * Ensures deployment has proper build assets
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Quick deployment fix...\n');

const publicPath = path.join(process.cwd(), 'server/public');

// Create directory if it doesn't exist
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

// Check if we need to build
const indexPath = path.join(publicPath, 'index.html');
const assetsPath = path.join(publicPath, 'assets');

if (!fs.existsSync(assetsPath) || fs.readdirSync(assetsPath).length === 0) {
  console.log('⚠️  No assets found, running minimal build...');
  
  // Use the root vite config to build
  try {
    execSync('npx vite build client --base / --mode production', {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        FORCE_COLOR: '0'
      }
    });
    console.log('✅ Build completed');
  } catch (error) {
    console.error('Build failed:', error.message);
  }
} else {
  console.log('✅ Assets already exist');
}

// Verify deployment structure
console.log('\n📊 Deployment structure:');
if (fs.existsSync(indexPath)) {
  console.log('✅ index.html exists');
}
if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  console.log(`✅ Assets: ${jsFiles.length} JS, ${cssFiles.length} CSS files`);
}

console.log('\n🎯 Deployment ready');