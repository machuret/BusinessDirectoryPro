# Business Directory Platform

## Overview

This is a comprehensive business directory platform built with React, TypeScript, Express.js, and PostgreSQL. The platform provides a full-featured business listing system with admin management, user authentication, and advanced search capabilities. The application follows a modern full-stack architecture with separate client and server directories, implementing best practices for performance, accessibility, and maintainability.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with design system tokens
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: React Router with lazy loading for code splitting
- **Component Library**: Standardized component system with accessibility compliance

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication with secure password hashing
- **File Storage**: Azure Blob Storage integration for business images
- **API Design**: RESTful endpoints with comprehensive error handling

### Data Storage
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Session Storage**: Database-backed session management
- **File Storage**: Azure Blob Storage for images and media

## Key Components

### Business Management
- Complete CRUD operations for business listings
- Category-based organization with filtering
- Photo gallery management with Azure integration
- Business hours and contact information management
- Featured business system with approval workflow
- Business claim verification system

### User Authentication & Authorization
- Multi-role system (admin, business owner, user)
- Secure session management with regeneration
- Password hashing using scrypt with salt
- Protected routes with middleware authentication
- User dashboard for business management

### Admin Dashboard
- Comprehensive admin interface with 18+ management tools
- User management with role assignment
- Business moderation and approval workflow
- Content management system for dynamic text
- Analytics and reporting capabilities
- Lead management and contact form handling

### Search & Discovery
- Advanced search with category and location filtering
- Dynamic city-based business discovery
- Featured business carousel
- Related business recommendations
- SEO-optimized business pages

## Data Flow

### Business Discovery Flow
1. User searches or browses categories
2. Frontend queries `/api/businesses` with filters
3. Backend applies database filters with indexing
4. Results returned with pagination and caching
5. Frontend renders business cards with progressive loading

### Business Submission Flow
1. User submits business via form
2. Form validation on client and server
3. Image upload to Azure Blob Storage
4. Database insertion with category assignment
5. Admin notification for approval
6. Business appears in directory upon approval

### Authentication Flow
1. User registers/logs in via `/api/auth` endpoints
2. Session created with secure configuration
3. Session validation on protected routes
4. Role-based access control for admin features
5. Session cleanup on logout

## External Dependencies

### Database & Storage
- **Neon PostgreSQL**: Primary database hosting
- **Azure Blob Storage**: Image and media storage
- **Drizzle ORM**: Database operations and migrations

### Development & Build Tools
- **Vite**: Frontend build tool and development server
- **ESBuild**: Backend TypeScript compilation
- **Tailwind CSS**: Utility-first styling framework
- **React Query**: Server state management and caching

### Authentication & Security
- **Express Session**: Session management
- **Crypto**: Password hashing and security utilities
- **CORS**: Cross-origin request handling

## Deployment Strategy

### Serverless Architecture (Vercel)
- **Frontend**: Static site generation with Vite
- **Backend**: Serverless functions in `/api` directory
- **Database**: External PostgreSQL connection
- **Storage**: Azure integration for file uploads

### Build Configuration
- Frontend builds to `/public` directory
- Backend compiles to `/api` directory using ESBuild
- Environment-specific configurations for development/production
- Automated deployment via GitHub integration

### Performance Optimizations
- Route-based code splitting with React.lazy()
- Database indexing for query optimization
- In-memory caching for frequently accessed data
- CDN integration for static assets
- Progressive loading with skeleton states

## Changelog

- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.