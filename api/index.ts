// Vercel serverless function entry point
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
  getSecurityConfig,
  getEnvironmentConfig 
} from '../server/config/environment';

const app = express();

// Configure for serverless
app.set('trust proxy', 1);

// Apply environment-aware security middleware
app.use(helmet(getSecurityConfig()));

// Apply environment-aware CORS configuration
app.use(cors(getCORSConfig()));

// Apply environment-aware session configuration
app.use(session(getSessionConfig()));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Register all API routes
await registerRoutes(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    message: 'Business Directory API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Serve static files and handle SPA routing
app.use(express.static(path.join(process.cwd(), 'server/public')));

// Fallback to working frontend for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(process.cwd(), 'server/public/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback to embedded frontend
    res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Directory Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 800px; width: 100%; text-align: center; }
        h1 { color: #333; margin-bottom: 1rem; font-size: 2.5rem; font-weight: 700; }
        .subtitle { color: #666; margin-bottom: 2rem; font-size: 1.1rem; }
        .status { display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #e8f5e8; color: #2d5a2d; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #4CAF50; }
        .status-dot { width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .nav-item { background: #667eea; color: white; padding: 1rem; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.3s ease; border: none; cursor: pointer; font-size: 1rem; }
        .nav-item:hover { background: #5a6fd8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .api-info { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-top: 2rem; border-left: 4px solid #007bff; text-align: left; }
        .endpoint { font-family: monospace; background: #e9ecef; padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Business Directory</h1>
            <p class="subtitle">Your comprehensive business networking platform</p>
            <div class="status">
                <div class="status-dot"></div>
                <strong>System Status: Online & Ready</strong>
            </div>
            <div class="nav-grid">
                <button class="nav-item" onclick="fetch('/api/businesses').then(r=>r.json()).then(console.log)">Browse Businesses</button>
                <button class="nav-item" onclick="fetch('/api/categories').then(r=>r.json()).then(console.log)">Categories</button>
                <button class="nav-item" onclick="fetch('/api/cities').then(r=>r.json()).then(console.log)">Cities</button>
                <button class="nav-item" onclick="window.open('/api/auth/login', '_blank')">Admin Access</button>
            </div>
            <div class="api-info">
                <h3>Available API Endpoints</h3>
                <div class="endpoint">GET /api/businesses - List all businesses</div>
                <div class="endpoint">GET /api/categories - Business categories</div>
                <div class="endpoint">GET /api/cities - Available cities</div>
                <div class="endpoint">POST /api/auth/login - Admin authentication</div>
            </div>
        </div>
    </div>
</body>
</html>
    `);
  }
});

// Export for Vercel
export default app;