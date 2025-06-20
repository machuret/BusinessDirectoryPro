// Vercel serverless function entry point
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
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

// Register all routes
registerRoutes(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    message: 'Business Directory API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
export default app;