# FINAL DEPLOYMENT FIX - MANUAL CONFIGURATION REQUIRED

## Issue Analysis
The build logs show two persistent problems:
1. `vercel.json` file keeps reappearing and overriding dashboard settings
2. `package.json` build script still uses `--outdir=dist` instead of `--outdir=api`

## Solution: Manual File Edits Required

Since the configuration files are protected from automated edits, you need to make these changes manually:

### 1. Delete vercel.json (if it exists)
```bash
rm vercel.json
```

### 2. Edit package.json - Build Script
Find line 8 in package.json and change:
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```
To:
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api"
```

### 3. Edit vite.config.ts - Output Directory
Find line 28 in vite.config.ts and change:
```typescript
outDir: path.resolve(import.meta.dirname, "dist/public"),
```
To:
```typescript
outDir: path.resolve(import.meta.dirname, "public"),
```

### 4. Vercel Dashboard Settings
- Output Directory: `public`
- Build Command: `npm run build`

## What This Fixes
- Frontend builds to `/public` directory
- Backend builds to `/api` directory  
- Removes vercel.json override
- Enables proper serverless deployment

After making these edits, commit and push to GitHub. The deployment will work correctly.