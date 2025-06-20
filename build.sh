#!/bin/bash

# Vercel Build Script
# Override npm build to create correct output structure

echo "Vercel custom build starting..."

# Clean previous builds
rm -rf public dist api 2>/dev/null || true

# Build frontend to public directory (Vercel expects this)
echo "Building frontend with Vite..."
npx vite build --outDir public --emptyOutDir

# Create API directory and build serverless function
echo "Building API serverless function..."
mkdir -p api
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=api/index.js \
  --define:process.env.NODE_ENV=\"production\"

# Create package.json for API function
cat > api/package.json << 'EOF'
{
  "type": "module"
}
EOF

# Verify critical files exist
if [ ! -f "public/index.html" ]; then
  echo "❌ Frontend build failed - no index.html"
  exit 1
fi

if [ ! -f "api/index.js" ]; then
  echo "❌ API build failed - no index.js"
  exit 1
fi

echo "✅ Vercel build completed"
echo "📁 Frontend: public/index.html ($(du -h public/index.html | cut -f1))"
echo "📁 API: api/index.js ($(du -h api/index.js | cut -f1))"
echo "🚀 Ready for Vercel deployment"