# EXACT CHANGES REQUIRED FOR DEPLOYMENT

## Change 1: package.json Build Script
**Current:**
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

**Change to:**
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api"
```

## Change 2: vite.config.ts Build Output
**Current:**
```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist/public"),
  emptyOutDir: true,
},
```

**Change to:**
```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "public"),
  emptyOutDir: true,
},
```

## Result After Changes
- Frontend will build to `/public` directory
- Backend will build to `/api` directory
- Vercel will serve frontend from public and backend as serverless functions
- Your business directory platform will deploy correctly

## Deployment Steps
1. Make both changes above
2. Save and commit to GitHub
3. Redeploy on Vercel
4. Set Output Directory to "public" in Vercel dashboard

The missing export issue is already fixed. These two build configuration changes will complete the deployment.