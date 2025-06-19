#!/bin/bash

echo "Starting Vercel static build..."

# Clean previous build
rm -rf dist
rm -rf client/dist

# Build frontend with Vite
echo "Building frontend with Vite..."
npm run build:client

# Copy to dist directory for Vercel
echo "Preparing build output..."
mkdir -p dist
cp -r client/dist/* dist/

echo "Build completed successfully"
echo "Static files ready in dist/ directory"