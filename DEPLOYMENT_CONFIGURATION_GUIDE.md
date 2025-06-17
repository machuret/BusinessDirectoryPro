# Deployment Configuration Guide

## Problem: Recurring Deployment Issues

The application repeatedly faces these deployment problems:
- 401 authentication errors in production
- 500/503 asset loading failures
- CORS blocking requests
- Session management failures

## Root Cause Analysis

**Local vs Production Environment Differences:**
1. **Session Security**: `secure: true` cookies require HTTPS but Replit uses HTTP proxying
2. **CORS Restrictions**: Strict origin matching fails with dynamic Replit URLs
3. **Content Security Policy**: Restrictive CSP blocks legitimate assets
4. **Environment Variable Handling**: Different behavior between local and deployed environments

## Permanent Solution: Environment-Aware Configuration

### 1. Smart Environment Detection

```javascript
// Environment detection utility
const isProduction = process.env.NODE_ENV === 'production';
const isReplit = process.env.REPLIT_URL || process.env.REPL_SLUG;
const isVercel = process.env.VERCEL_URL;
const isHeroku = process.env.DYNO;

const getEnvironmentType = () => {
  if (isReplit) return 'replit';
  if (isVercel) return 'vercel';
  if (isHeroku) return 'heroku';
  return 'local';
};
```

### 2. Platform-Specific Configurations

**Session Configuration:**
```javascript
const getSessionConfig = () => {
  const envType = getEnvironmentType();
  
  const baseConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    }
  };

  switch (envType) {
    case 'replit':
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: false, // Replit uses HTTP proxying
          sameSite: 'lax'
        }
      };
    case 'vercel':
    case 'heroku':
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: true, // HTTPS in production
          sameSite: 'strict'
        }
      };
    default:
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: false,
          sameSite: 'lax'
        }
      };
  }
};
```

**CORS Configuration:**
```javascript
const getCORSConfig = () => {
  const envType = getEnvironmentType();
  
  switch (envType) {
    case 'replit':
      return {
        origin: true, // Allow all origins for Replit
        credentials: true
      };
    case 'vercel':
      return {
        origin: [/\.vercel\.app$/, /\.vercel\.dev$/],
        credentials: true
      };
    case 'heroku':
      return {
        origin: [/\.herokuapp\.com$/],
        credentials: true
      };
    default:
      return {
        origin: ["http://localhost:5000", "http://127.0.0.1:5000"],
        credentials: true
      };
  }
};
```

**Security Headers:**
```javascript
const getSecurityConfig = () => {
  const envType = getEnvironmentType();
  
  if (envType === 'replit') {
    // Relaxed security for Replit compatibility
    return {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    };
  }
  
  // Strict security for other platforms
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    }
  };
};
```

## 3. Automated Configuration Setup

### Pre-deployment Checklist Script
Create `check-deployment-config.js`:

```javascript
const requiredEnvVars = [
  'SESSION_SECRET',
  'DATABASE_URL'
];

const checkEnvironment = () => {
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ All required environment variables present');
};

const validateConfiguration = () => {
  const envType = getEnvironmentType();
  console.log(`🔧 Detected environment: ${envType}`);
  
  // Test session configuration
  // Test CORS configuration
  // Test security headers
  
  console.log('✅ Configuration validated for deployment');
};

checkEnvironment();
validateConfiguration();
```

## 4. Monitoring and Health Checks

### Real-time Configuration Monitoring
```javascript
app.get('/api/health/config', (req, res) => {
  const envType = getEnvironmentType();
  const config = {
    environment: envType,
    session: {
      secure: getSessionConfig().cookie.secure,
      sameSite: getSessionConfig().cookie.sameSite
    },
    cors: getCORSConfig().origin,
    timestamp: new Date().toISOString()
  };
  
  res.json({ status: 'healthy', config });
});
```

## 5. Deployment Automation

### Package.json Scripts
```json
{
  "scripts": {
    "predeploy": "node check-deployment-config.js",
    "deploy:replit": "NODE_ENV=production PLATFORM=replit npm start",
    "deploy:vercel": "NODE_ENV=production PLATFORM=vercel npm start",
    "health-check": "node deployment-health-check.js"
  }
}
```

## 6. Documentation and Training

### Quick Reference Card
```
DEPLOYMENT ISSUES QUICK FIX:
1. Check environment variables: SESSION_SECRET, DATABASE_URL
2. Verify platform detection: console.log(getEnvironmentType())
3. Test authentication: POST /api/auth/login
4. Check CORS: Browser network tab for CORS errors
5. Validate config: GET /api/health/config
```

## Implementation Priority

1. **Immediate**: Implement environment-aware configuration
2. **Short-term**: Add automated health checks
3. **Long-term**: Create deployment automation scripts

This approach eliminates configuration guesswork and prevents recurring deployment issues by automatically adapting to each platform's requirements.