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