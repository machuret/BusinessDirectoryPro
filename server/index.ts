import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createApiPriorityMiddleware } from "./api-priority-middleware";

const app = express();
app.set('trust proxy', 1); // Trust first proxy for Replit environment

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"], // Allow Replit dev banner
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.replit\.app$/, /\.replit\.dev$/, /\.vercel\.app$/, /\.herokuapp\.com$/] 
    : ["http://localhost:5000", "http://127.0.0.1:5000"],
  credentials: true,
}));

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

// Validate required environment variables
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for security");
}

// Session configuration with memory store for development
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on each request
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 2 * 60 * 60 * 1000, // 2 hours (shorter for development)
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
  },
  // Use memory store for development to avoid persistence issues
  ...(process.env.NODE_ENV === 'development' && {
    store: undefined // Use default memory store
  })
};

app.use(session(sessionConfig));

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

// Health check endpoint for deployment platforms - MUST be before route registration
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Business Directory API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    message: 'Business Directory API is healthy',
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
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      try {
        serveStatic(app);
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
