# Simple Vercel Deployment

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Business directory ready for deployment"
git push origin main
```

## Step 2: Deploy on Vercel
1. Go to vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository
5. Click "Deploy"

## That's it.

Your API is ready in `api/index.js` with all endpoints.
Your frontend is ready in `client/dist/index.html`.
Your configuration is ready in `vercel.json`.

The 404 error happens because no deployment exists yet. Once you push to GitHub and deploy through Vercel, it will work.