# Complete Vercel Deployment Configuration

## Essential Configuration Files

### 1. `vercel.json` - Main Configuration
```json
{
  "version": 2,
  "name": "business-directory",
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/health",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

### 2. `api/index.ts` - Vercel Serverless Function
```typescript
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from '../server/routes';
import { 
  getSessionConfig, 
  getCORSConfig, 
  getSecurityConfig 
} from '../server/config/environment';

const app = express();
app.set('trust proxy', 1);

// Apply security middleware
app.use(helmet(getSecurityConfig()));
app.use(cors(getCORSConfig()));
app.use(session(getSessionConfig()));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Register API routes
await registerRoutes(app);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    message: 'Business Directory API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Serve static files and SPA fallback
app.use(express.static(path.join(process.cwd(), 'server/public')));
app.get('*', (req, res) => {
  // Fallback to embedded HTML if static files missing
});

export default app;
```

### 3. `.vercelignore` - Deployment Exclusions
```
node_modules
.env
.env.local
.git
*.log
.DS_Store
.vscode
```

## Required Environment Variables

### Critical Variables (Set in Vercel Dashboard)
```bash
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### Optional API Keys
```bash
OPENAI_API_KEY=your_openai_api_key
AZURE_STORAGE_CONNECTION_STRING=your_azure_connection
```

## Deployment Process

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Project
```bash
vercel link
```

### Step 4: Set Environment Variables
```bash
vercel env add DATABASE_URL production
vercel env add NODE_ENV production
```

### Step 5: Deploy
```bash
vercel --prod
```

## Architecture Details

### Single Function Approach
- All routes handled by one serverless function at `api/index.ts`
- Includes both API endpoints and static file serving
- Embedded fallback HTML for reliable deployment

### Request Routing
1. `/api/*` routes → Express API handlers
2. `/health` → Health check endpoint
3. Static assets → Served from `server/public/` if available
4. All other routes → SPA fallback with embedded HTML

### Database Integration
- Uses existing Neon PostgreSQL database
- Connection string passed via `DATABASE_URL` environment variable
- All existing storage and business logic preserved

## Pre-Deployment Checklist

### Configuration Files
- [ ] `vercel.json` exists in project root
- [ ] `api/index.ts` exists and exports Express app
- [ ] `.vercelignore` excludes unnecessary files

### Environment Setup
- [ ] DATABASE_URL configured in Vercel dashboard
- [ ] NODE_ENV set to "production"
- [ ] Any required API keys added

### Testing
- [ ] Local server runs without errors
- [ ] API endpoints respond correctly
- [ ] Database connection works

## Post-Deployment Verification

### Health Check
Visit: `https://your-app.vercel.app/health`
Expected response:
```json
{
  "status": "healthy",
  "message": "Business Directory API is healthy",
  "timestamp": "2025-06-20T..."
}
```

### API Testing
- `GET /api/businesses` - List businesses
- `GET /api/categories` - Business categories
- `GET /api/cities` - Available cities
- `POST /api/auth/login` - Admin authentication

### Frontend Access
- Root URL displays Business Directory interface
- Interactive buttons test API connectivity
- Admin login redirects properly

## Troubleshooting

### Common Deployment Issues

**Build Failures**
- Ensure all TypeScript dependencies are in `package.json`
- Check that import paths are correct
- Verify no syntax errors in `api/index.ts`

**Database Connection Errors**
- Verify `DATABASE_URL` format is correct
- Ensure database accepts connections from Vercel IPs
- Check SSL requirements (use `?sslmode=require` for Neon)

**Function Timeout**
- Current limit: 30 seconds (configurable)
- Optimize database queries if needed
- Consider caching for frequently accessed data

### Monitoring and Logs
- View function logs: `vercel logs`
- Monitor performance in Vercel dashboard
- Set up alerts for errors or timeouts

## Production Optimizations

### Performance
- Automatic CDN distribution
- Edge caching for static assets
- Global edge network deployment

### Security
- HTTPS by default
- Environment variable encryption
- Request size limits (10MB)

### Scalability
- Automatic scaling based on traffic
- No server management required
- Pay-per-execution pricing model