# Vercel Deployment Configuration

## Configuration Files Created

### 1. `vercel.json` - Main Configuration
```json
{
  "version": 2,
  "name": "business-directory",
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["server/**", "shared/**"]
      }
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "../server/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/health",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/server/public/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/server/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "server/index.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

### 2. `api/index.ts` - Serverless Entry Point
- Created for Vercel's serverless function format
- Exports your Express app as a Vercel function

### 3. `client/package.json` - Frontend Build Config
- Configures frontend build to output to correct directory
- Required for Vercel's static build process

### 4. `.vercelignore` - Deployment Exclusions
- Excludes unnecessary files from deployment
- Reduces deployment size and time

## Required Environment Variables

Set these in your Vercel project dashboard:

### Essential Variables
```
DATABASE_URL=your_neon_postgresql_connection_string
NODE_ENV=production
```

### Optional API Keys (if used)
```
OPENAI_API_KEY=your_openai_key
AZURE_STORAGE_CONNECTION_STRING=your_azure_connection
```

## Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NODE_ENV production
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Key Configuration Details

### Build Process
- **Frontend**: Built using Vite, outputs to `server/public/`
- **Backend**: TypeScript compiled to serverless function
- **Static Assets**: Served directly by Vercel CDN

### Routing Strategy
1. API routes (`/api/*`) → Backend serverless function
2. Static files → Vercel's static file serving
3. SPA fallback → Backend serves HTML for client-side routing

### Performance Optimizations
- **Regions**: Configured for US East (iad1) - adjust as needed
- **Function Duration**: 30 seconds max (suitable for most operations)
- **Static Caching**: Automatic via Vercel CDN

## Troubleshooting

### Common Issues
1. **Build Failures**: Ensure all dependencies are in package.json
2. **Database Connection**: Verify DATABASE_URL environment variable
3. **Static Assets**: Check that frontend builds to `server/public/`

### Verification
Run `node build-vercel.js` to verify configuration before deployment.

## Production Considerations

### Security
- Environment variables are automatically encrypted
- HTTPS is enabled by default
- CORS is configured for production

### Monitoring
- Built-in analytics available in Vercel dashboard
- Function logs accessible via Vercel CLI

### Scaling
- Automatic scaling based on traffic
- No server management required