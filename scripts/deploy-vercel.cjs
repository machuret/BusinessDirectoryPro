/**
 * Vercel Deployment Configuration
 * Ensures proper build output for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Creating Vercel deployment configuration...\n');

// Create vercel.json configuration
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node",
      "config": {
        "outputDirectory": "dist"
      }
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "server/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/server/public/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/server/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
};

// Write vercel.json
fs.writeFileSync(
  path.join(process.cwd(), 'vercel.json'),
  JSON.stringify(vercelConfig, null, 2)
);

console.log('✅ Created vercel.json');

// Create .vercelignore
const vercelIgnore = `
node_modules
.git
.env
*.log
coverage
.nyc_output
.cache
dist
client/dist
scripts
test-*
*.test.*
`;

fs.writeFileSync(
  path.join(process.cwd(), '.vercelignore'),
  vercelIgnore.trim()
);

console.log('✅ Created .vercelignore');

// Instructions
console.log('\n📋 Deployment Instructions:');
console.log('1. First build the app: npm run build');
console.log('2. Deploy to Vercel: vercel --prod');
console.log('3. Set environment variables in Vercel dashboard');
console.log('\nThe app will run in production mode on Vercel automatically.');