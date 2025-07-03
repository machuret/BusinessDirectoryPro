#!/bin/bash
# Replit Deployment Build Script

echo "🚀 Starting Replit deployment build..."

# Build the React frontend
echo "📦 Building frontend..."
cd client
npm run build

# Create public directory if it doesn't exist
echo "📁 Creating server/public directory..."
mkdir -p ../server/public

# Copy all build files to server/public
echo "📋 Copying build files..."
rm -rf ../server/public/*
cp -r dist/* ../server/public/

echo "✅ Build complete! Your app is ready for deployment."
echo "📍 Files are now in server/public/"

# List what was copied
ls -la ../server/public/