const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing deployment...');

// Update the package.json to add a deployment script
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Add deployment build script
packageJson.scripts['build:deploy'] = 'cd client && vite build && cd .. && cp -r client/dist/* server/public/';

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

console.log('✅ Added deployment build script');
console.log('📦 Run: npm run build:deploy');
console.log('🚀 Then restart your deployment!');