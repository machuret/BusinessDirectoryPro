# 🚀 Deploy to Vercel - Simple Steps

## Step 1: Push Your Code to GitHub

Open a terminal in Replit and run these commands:
```bash
git add .
git commit -m "Add Vercel deployment files"
git push origin main
```

## Step 2: Go to Vercel

1. Open [vercel.com](https://vercel.com) in a new tab
2. Sign up or log in (use GitHub login for easier setup)
3. Click the "Add New..." button → Select "Project"

## Step 3: Import Your Project

1. Click "Import Git Repository"
2. If asked, give Vercel access to your GitHub
3. Find and select: `machuret/BusinessDirectoryPro`
4. Click "Import"

## Step 4: Configure Your Project

When Vercel shows the configuration page:

1. **Framework Preset**: Leave as "Other"
2. **Root Directory**: Leave empty (.)
3. **Build Command**: Already set in vercel.json
4. **Output Directory**: Already set in vercel.json

## Step 5: Add Environment Variables

Click "Environment Variables" and add:

```
NODE_ENV = production
DATABASE_URL = [copy from Replit secrets]
```

To find your DATABASE_URL in Replit:
- Look in the Secrets tab (🔒 icon)
- Copy the DATABASE_URL value

## Step 6: Deploy!

1. Click "Deploy"
2. Wait 2-5 minutes for the build
3. Your app will be live at: `your-project.vercel.app`

## If Something Goes Wrong:

- Check the build logs in Vercel
- Most common issue: missing environment variables
- Click "Redeploy" after fixing

That's it! Your business directory will be live on Vercel in minutes!