/**
 * Environment-Aware Configuration System
 * Automatically detects deployment platform and applies appropriate settings
 */

export type PlatformType = 'replit' | 'vercel' | 'heroku' | 'local';

export interface EnvironmentConfig {
  platform: PlatformType;
  session: {
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  cors: {
    origin: boolean | string[] | RegExp[];
    credentials: boolean;
  };
  security: {
    contentSecurityPolicy: boolean | object;
    crossOriginEmbedderPolicy: boolean;
  };
}

/**
 * Detect the current deployment platform
 */
export function detectPlatform(): PlatformType {
  if (process.env.REPLIT_URL || process.env.REPL_SLUG) return 'replit';
  if (process.env.VERCEL_URL || process.env.VERCEL) return 'vercel';
  if (process.env.DYNO || process.env.HEROKU_APP_NAME) return 'heroku';
  return 'local';
}

/**
 * Get platform-specific session configuration
 */
export function getSessionConfig() {
  const platform = detectPlatform();
  
  const baseConfig = {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    }
  };

  switch (platform) {
    case 'replit':
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: false, // Replit uses HTTP proxying
          sameSite: 'lax' as const
        }
      };
    
    case 'vercel':
    case 'heroku':
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const
        }
      };
    
    default: // local
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: false,
          sameSite: 'lax' as const
        }
      };
  }
}

/**
 * Get platform-specific CORS configuration
 */
export function getCORSConfig() {
  const platform = detectPlatform();
  
  switch (platform) {
    case 'replit':
      return {
        origin: true, // Allow all origins for Replit compatibility
        credentials: true
      };
    
    case 'vercel':
      return {
        origin: [/\.vercel\.app$/, /\.vercel\.dev$/, /localhost:\d+/],
        credentials: true
      };
    
    case 'heroku':
      return {
        origin: [/\.herokuapp\.com$/, /localhost:\d+/],
        credentials: true
      };
    
    default: // local
      return {
        origin: ["http://localhost:5000", "http://127.0.0.1:5000"],
        credentials: true
      };
  }
}

/**
 * Get platform-specific security configuration
 */
export function getSecurityConfig() {
  const platform = detectPlatform();
  
  if (platform === 'replit') {
    // Relaxed security for Replit compatibility
    return {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    };
  }
  
  // Standard security for other platforms
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"]
      }
    },
    crossOriginEmbedderPolicy: false
  };
}

/**
 * Get complete environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const platform = detectPlatform();
  const sessionConfig = getSessionConfig();
  
  return {
    platform,
    session: {
      secure: sessionConfig.cookie.secure,
      sameSite: sessionConfig.cookie.sameSite
    },
    cors: getCORSConfig(),
    security: getSecurityConfig()
  };
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = ['SESSION_SECRET', 'DATABASE_URL'];
  const missing = required.filter(env => !process.env[env]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Log current configuration for debugging
 */
export function logConfiguration() {
  const config = getEnvironmentConfig();
  console.log(`[CONFIG] Platform: ${config.platform}`);
  console.log(`[CONFIG] Session secure: ${config.session.secure}`);
  console.log(`[CONFIG] Session sameSite: ${config.session.sameSite}`);
  console.log(`[CONFIG] CORS origin: ${typeof config.cors.origin === 'boolean' ? 'all' : 'restricted'}`);
  console.log(`[CONFIG] CSP enabled: ${config.security.contentSecurityPolicy !== false}`);
}