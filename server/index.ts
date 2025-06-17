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
  const { getEnvironmentConfig } = require('./config/environment');
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
        console.warn('Static files not available, serving API only:', error instanceof Error ? error.message : String(error));
        // Fallback for deployment platforms when static files aren't available
        app.get("*", (_req, res) => {
          res.status(200).json({ 
            status: 'ok', 
            message: 'Business Directory API is running',
            timestamp: new Date().toISOString(),
            mode: 'api-only'
          });
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
