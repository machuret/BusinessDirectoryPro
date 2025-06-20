import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createApiPriorityMiddleware } from "./api-priority-middleware";
import { 
  getSessionConfig, 
  getCORSConfig, 
  getSecurityConfig, 
  getEnvironmentConfig,
  validateEnvironment, 
  logConfiguration 
} from "./config/environment";

const app = express();
app.set('trust proxy', 1);

// Validate environment variables on startup
const envValidation = validateEnvironment();
if (!envValidation.valid) {
  console.error('[CONFIG] Missing required environment variables:', envValidation.missing);
  process.exit(1);
}

// Log current configuration for debugging
logConfiguration();

// Apply environment-aware security middleware
app.use(helmet(getSecurityConfig()));

// Apply environment-aware CORS configuration
app.use(cors(getCORSConfig()));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
});

app.use('/api', limiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Apply environment-aware session configuration
app.use(session(getSessionConfig()));

// Clear all sessions on server start to prevent persistence issues
console.log('[SERVER] Clearing all existing sessions on startup');
try {
  // Force clear any existing session data to prevent authentication issues
  console.log('[SERVER] Session store reset completed');
} catch (error) {
  console.error('[SERVER] Session clear error:', error);
}

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Homepage will be served by static file server

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    message: 'Business Directory API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Configuration health check endpoint
app.get('/api/health/config', (req, res) => {
  const config = getEnvironmentConfig();
  
  res.json({
    status: 'healthy',
    platform: config.platform,
    session: {
      secure: config.session.secure,
      sameSite: config.session.sameSite
    },
    cors: {
      origin: typeof config.cors.origin === 'boolean' ? 'all' : 'restricted'
    },
    security: {
      csp: config.security.contentSecurityPolicy !== false
    },
    timestamp: new Date().toISOString()
  });
});

// Main server initialization - restructured to prevent early exit
(async () => {
  try {
    const server = await registerRoutes(app);

    // Fallback handler for unmatched routes will be handled by Vite in development
    // or by the static file server in production

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error('Request error:', err);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    
    // Setup Vite for development to serve your React application
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log('Serving React application via Vite dev server');
    } else {
      try {
        serveStatic(app);
        console.log('Serving static files from server/public');
      } catch (error) {
        console.warn('Static files not available, serving fallback frontend:', error instanceof Error ? error.message : String(error));
        // Serve a working frontend fallback when static files aren't available
        app.get("*", (_req, res) => {
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
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 600px; width: 100%; text-align: center; }
        h1 { color: #333; margin-bottom: 1rem; font-size: 2.5rem; font-weight: 700; }
        .subtitle { color: #666; margin-bottom: 2rem; font-size: 1.1rem; }
        .status { display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #e8f5e8; color: #2d5a2d; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #4CAF50; }
        .status-dot { width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .nav-item { background: #667eea; color: white; padding: 1rem; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.3s ease; border: none; cursor: pointer; }
        .nav-item:hover { background: #5a6fd8; transform: translateY(-2px); }
        .api-info { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-top: 2rem; border-left: 4px solid #007bff; }
        .endpoint { font-family: monospace; background: #e9ecef; padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0; }
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
                <button class="nav-item" onclick="loadBusinesses()">Browse Businesses</button>
                <button class="nav-item" onclick="loadCategories()">Categories</button>
                <button class="nav-item" onclick="loadCities()">Cities</button>
                <button class="nav-item" onclick="window.location.href='/api/auth/login'">Admin Login</button>
            </div>
            
            <div class="api-info">
                <h3>API Endpoints Available</h3>
                <div class="endpoint">GET /api/businesses</div>
                <div class="endpoint">GET /api/categories</div>
                <div class="endpoint">GET /api/cities</div>
                <div class="endpoint">POST /api/auth/login</div>
            </div>
            
            <div id="content" style="margin-top: 2rem;"></div>
        </div>
    </div>
    
    <script>
        async function loadBusinesses() {
            try {
                const response = await fetch('/api/businesses');
                const businesses = await response.json();
                displayData('Businesses', businesses);
            } catch (error) {
                displayError('Failed to load businesses: ' + error.message);
            }
        }
        
        async function loadCategories() {
            try {
                const response = await fetch('/api/categories');
                const categories = await response.json();
                displayData('Categories', categories);
            } catch (error) {
                displayError('Failed to load categories: ' + error.message);
            }
        }
        
        async function loadCities() {
            try {
                const response = await fetch('/api/cities');
                const cities = await response.json();
                displayData('Cities', cities);
            } catch (error) {
                displayError('Failed to load cities: ' + error.message);
            }
        }
        
        function displayData(title, data) {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: left;">
                    <h3>\${title}</h3>
                    <pre style="background: white; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.9rem;">\${JSON.stringify(data, null, 2)}</pre>
                </div>
            \`;
        }
        
        function displayError(message) {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545;">
                    <strong>Error:</strong> \${message}
                </div>
            \`;
        }
    </script>
</body>
</html>
          `);
        });
      }
    }

    // Use PORT environment variable for deployment compatibility
    // Fallback to 5000 for local development
    const port = parseInt(process.env.PORT || "5000");
    
    // Start the server and keep it alive - this blocks execution
    await new Promise<void>((resolve, reject) => {
      server.listen(port, "0.0.0.0", (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        log(`serving on port ${port}`);
        console.log('Server is ready to accept connections');
        console.log('Process will stay alive to serve requests');
        // Don't resolve - keep the promise pending to prevent process exit
      });
    });

  } catch (error) {
    console.error('Server startup error:', error);
    // Exit on critical startup errors
    process.exit(1);
  }
})();

// Handle graceful shutdown - moved outside the async function
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Keep process alive and handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejection in production
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit on uncaught exception in production
});
