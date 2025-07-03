# Manual Vercel Deployment Instructions

Since the GitHub integration is using old code with the problematic build script, use this manual deployment method:

## Option 1: Vercel CLI (Recommended)

1. Navigate to the `vercel-deploy` folder:
   ```bash
   cd vercel-deploy
   ```

2. Deploy directly:
   ```bash
   vercel --prod
   ```

3. When prompted:
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No (create new)
   - Project name: business-directory-manual
   - Directory: ./ (current directory)

## Option 2: Drag & Drop

1. Go to https://vercel.com/new
2. Click "Import from Git Repository" → Skip
3. Click "Or, start from a template" → Skip  
4. You'll see "Or, deploy an existing project"
5. Drag the `vercel-deploy` folder to the upload area

## What's in the vercel-deploy folder:
- `index.js` - Complete serverless function (12.9KB)
- `package.json` - Minimal dependencies (only @neondatabase/serverless)
- `vercel.json` - Simple configuration

## Environment Variables
Set these in Vercel after deployment:
- `DATABASE_URL` - Your Neon PostgreSQL connection
- `NODE_ENV` - production

This bypasses the GitHub build issues completely.