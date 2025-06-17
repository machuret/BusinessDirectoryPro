#!/usr/bin/env node

/**
 * Vercel Build Script
 * Creates the correct build output for Vercel deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for Vercel deployment...');

try {
  // Step 1: Build the frontend
  console.log('Building frontend assets...');
  execSync('npx vite build --outDir dist', { stdio: 'inherit' });
  
  // Step 2: Ensure build output exists
  if (!fs.existsSync('dist/index.html')) {
    console.error('Frontend build failed - no index.html generated');
    process.exit(1);
  }
  
  // Step 3: Create a simple test endpoint for verification
  const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Business Directory</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <div id="root">
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1>Business Directory Platform</h1>
            <p>Application is starting up...</p>
            <p>API Health: <span id="health">Checking...</span></p>
            <script>
                fetch('/health')
                    .then(r => r.json())
                    .then(data => {
                        document.getElementById('health').textContent = data.status;
                        document.getElementById('health').style.color = 'green';
                    })
                    .catch(() => {
                        document.getElementById('health').textContent = 'Error';
                        document.getElementById('health').style.color = 'red';
                    });
            </script>
        </div>
    </div>
</body>
</html>`;

  // Backup and ensure we have a working index.html
  if (!fs.existsSync('dist/index.html') || fs.readFileSync('dist/index.html', 'utf8').length < 100) {
    console.log('Creating fallback index.html...');
    fs.writeFileSync('dist/index.html', testHtml);
  }
  
  console.log('Vercel build completed successfully!');
  console.log('Files created:');
  
  const distFiles = fs.readdirSync('dist');
  distFiles.forEach(file => {
    const stat = fs.statSync(path.join('dist', file));
    console.log(`  ${file} (${Math.round(stat.size / 1024)}kb)`);
  });
  
} catch (error) {
  console.error('Vercel build failed:', error.message);
  process.exit(1);
}