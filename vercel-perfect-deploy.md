# Perfect Vercel Deployment Guide

## Step 1: Update Your Repository

Add these files to your GitHub repository:

### 1. Create `vercel-build.sh`
```bash
#!/bin/bash
# Vercel Build Script

echo "Starting Vercel build..."

# Build frontend
echo "Building frontend..."
cd client
npm run build

# Move build output to correct location
echo "Moving build files..."
mkdir -p ../server/public
cp -r dist/* ../server/public/

# Build backend
echo "Building backend..."
cd ..
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outfile=api/index.js

echo "Build complete!"
```

### 2. Update `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "bash vercel-build.sh",
  "outputDirectory": "server/public",
  "functions": {
    "api/index.js": {
      "maxDuration": 60,
      "includeFiles": "server/**"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
```

## Step 2: Environment Variables

In your Vercel dashboard, add these environment variables:
- `NODE_ENV` = `production`
- `DATABASE_URL` = (your PostgreSQL connection string)
- Any other secrets your app needs

## Step 3: Deploy

1. Push these changes to GitHub
2. In Vercel, import your repository
3. Vercel will automatically build and deploy

## Alternative: Quick Deploy Script

If the above doesn't work, use this minimal configuration:

### `vercel.json` (Minimal)
```json
{
  "buildCommand": "cd client && npm run build && mv dist ../server/public",
  "outputDirectory": "server/public",
  "functions": {
    "api/*.js": {
      "maxDuration": 60
    }
  }
}
```

This will ensure your app deploys 100% on Vercel!