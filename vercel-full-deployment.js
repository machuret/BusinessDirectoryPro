import fs from 'fs';

// Create comprehensive Vercel configuration for full app deployment
const fullVercelConfig = {
  "version": 2,
  "env": {
    "NODE_ENV": "production"
  },
  "builds": [
    {
      "src": "client/dist/**/*",
      "use": "@vercel/static"
    },
    {
      "src": "api/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "functions": {
    "api/*.js": {
      "maxDuration": 10
    }
  }
};

// Update vercel.json for full deployment
fs.writeFileSync('vercel.json', JSON.stringify(fullVercelConfig, null, 2));

// Create build script that prepares both frontend and API
const buildScript = `#!/bin/bash
echo "Building frontend..."
npm run build

echo "Preparing API..."
mkdir -p api
cp server/routes/businesses.js api/ 2>/dev/null || echo "No businesses route found"

echo "Build complete!"
`;

fs.writeFileSync('build.sh', buildScript);

// Create package.json script for Vercel build
const packageScripts = {
  "vercel-build": "npm run build && echo 'Vercel build complete'"
};

console.log('Full deployment configuration created:');
console.log('- Frontend will be served as static files');
console.log('- API endpoints will be serverless functions');
console.log('- Both frontend and backend will be available');
console.log('Run "npm run build" first, then redeploy to Vercel');