#!/bin/bash

# Vercel build script for Business Directory Platform
echo "Building for Vercel deployment..."

# Build the backend API function
echo "Building backend API function..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=api/index.js

# Create server/public directory if it doesn't exist
mkdir -p server/public

# Copy the working HTML file to server/public
cp server/public/index.html server/public/index.html 2>/dev/null || echo "HTML file already in place"

echo "Build completed successfully"
echo "Output: api/index.js"
echo "Static files: server/public/"