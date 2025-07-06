# Business Directory Platform - Deployment Guide

This guide provides comprehensive instructions for deploying the Business Directory Platform on your own server or cloud service.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Installation](#installation)
5. [Deployment Options](#deployment-options)
6. [Configuration Files](#configuration-files)
7. [Common Issues](#common-issues)

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (we recommend Neon, Supabase, or any PostgreSQL provider)
- npm or yarn package manager
- Git for version control

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Environment (REQUIRED)
NODE_ENV=production  # or development for local testing

# Session Secret (REQUIRED - generate a random string)
SESSION_SECRET=your-random-session-secret-here

# Azure Blob Storage (OPTIONAL - for image uploads)
AZURE_STORAGE_CONNECTION_STRING=your-azure-connection-string
AZURE_STORAGE_CONTAINER_NAME=your-container-name

# OpenAI API (OPTIONAL - for AI features)
OPENAI_API_KEY=your-openai-api-key

# Application URLs (adjust based on your deployment)
APP_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api
```

### Generating Secure Secrets

To generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Database Setup

### Option 1: Using Neon (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname`)
4. Add `?sslmode=require` to the end of the connection string

### Option 2: Using Supabase
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string from "Connection string" section

### Option 3: Self-hosted PostgreSQL
1. Install PostgreSQL on your server
2. Create a database: `CREATE DATABASE business_directory;`
3. Create a user with permissions
4. Use connection string: `postgresql://user:password@localhost:5432/business_directory`

### Database Migration
After setting up your database, run:
```bash
npm run db:push
```

This will create all necessary tables and indexes.

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/business-directory.git
   cd business-directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Build the application**
   ```bash
   # For production
   cd client && npm run build
   ```

## Deployment Options

### Option 1: Local Development
```bash
npm run dev
```
Access at: http://localhost:5000

### Option 2: Production Build (VPS/Dedicated Server)

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Build the backend**
   ```bash
   npm run build
   ```

3. **Start the server**
   ```bash
   npm run start
   ```

4. **Use a process manager (PM2 recommended)**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name business-directory
   pm2 save
   pm2 startup
   ```

5. **Set up reverse proxy (Nginx example)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 3: Replit Deployment (Recommended for Quick Deployment)

For Replit, use development mode to avoid build timeouts:

1. **Import to Replit**
2. **Set run command to:** `NODE_ENV=development tsx server/index.ts`
3. **Add secrets in Replit Secrets tab**
4. **Deploy**

### Option 4: Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN cd client && npm run build

EXPOSE 5000
CMD ["npm", "run", "start"]
```

Build and run:
```bash
docker build -t business-directory .
docker run -p 5000:5000 --env-file .env business-directory
```

## Configuration Files

### 1. Database Configuration (`drizzle.config.ts`)
No changes needed - it reads from DATABASE_URL automatically.

### 2. Server Configuration (`server/config/environment.ts`)
The configuration adapts based on your environment. Key settings:
- Session configuration (secure cookies, sameSite)
- CORS settings
- Security headers

### 3. Client Configuration
Update `client/src/lib/api.ts` if your API is on a different domain:
```typescript
const API_BASE = process.env.VITE_API_URL || '/api';
```

## Common Issues

### Issue 1: Build Timeout
**Problem:** Build times out with many packages (1289+)
**Solution:** 
- Use development mode for quick deployment
- Or reduce dependencies
- Or use Vercel which handles large builds better

### Issue 2: Database Connection Failed
**Problem:** Can't connect to database
**Solution:**
- Check DATABASE_URL format
- Ensure `?sslmode=require` is added for cloud databases
- Verify database credentials
- Check if database accepts connections from your IP

### Issue 3: Images Not Uploading
**Problem:** Image upload fails
**Solution:**
- Set up Azure Blob Storage
- Add AZURE_STORAGE_CONNECTION_STRING to .env
- Create a container and set AZURE_STORAGE_CONTAINER_NAME

### Issue 4: Session Issues in Production
**Problem:** Login doesn't persist
**Solution:**
- Set a strong SESSION_SECRET
- For HTTPS deployments, ensure proxy trust is configured
- Check cookie settings match your domain setup

### Issue 5: CORS Errors
**Problem:** API requests blocked
**Solution:**
- Update CORS configuration in `server/config/environment.ts`
- Add your domain to allowed origins
- Or set APP_URL environment variable

## Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Generate strong SESSION_SECRET
- [ ] Configure database with SSL
- [ ] Set up image storage (Azure Blob)
- [ ] Configure domain and HTTPS
- [ ] Set up monitoring (PM2, logs)
- [ ] Configure backups for database
- [ ] Test all features in production

## Support

For issues or questions:
1. Check the [Common Issues](#common-issues) section
2. Review server logs
3. Ensure all environment variables are set correctly
4. Database migrations are up to date

## Security Considerations

1. **Always use HTTPS in production**
2. **Keep dependencies updated:** `npm audit fix`
3. **Use strong passwords for database and admin accounts**
4. **Enable rate limiting (already configured)**
5. **Regular database backups**
6. **Monitor logs for suspicious activity**

Remember to never commit `.env` files or expose sensitive credentials in your repository.