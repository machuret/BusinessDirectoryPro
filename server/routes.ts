import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizeBusinesses } from "./openai";
import { setupAuthRoutes } from "./routes/auth";
import { setupAuth } from "./auth";
import { setupBusinessRoutes } from "./routes/businesses";
import { setupAdminRoutes } from "./routes/admin";
import { setupReviewRoutes } from "./routes/reviews";
import optimizationRoutes from "./routes/optimization";
import { registerCategoryRoutes } from "./routes/categories";
import { createOwnershipClaimsTable } from "./create-ownership-table";
import { setupFeaturedRequestsRoutes } from "./routes/featured-requests";
import { createFeaturedRequestsTable } from "./create-featured-requests-table";
import { createLeadsTable } from "./create-leads-table";
import { setupLeadRoutes } from "./routes/leads";
import { contentRouter } from "./routes/content";
import { createContentStringsTable, seedInitialContentStrings } from "../migrations/create-content-strings-table";

// Import new modular routers
import settingsRouter from "./routes/settings.routes";
import importRouter from "./routes/import.routes";
import claimsRouter from "./routes/claims.routes";
import servicesRouter from "./routes/services.routes";
import socialMediaRouter from "./routes/socialMedia.routes";
import menuRouter from "./routes/menu.routes";
import pagesRouter from "./routes/pages.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database tables - ensure ownership_claims, featured_requests, leads, and content_strings tables exist
  try {
    await createOwnershipClaimsTable();
    await createFeaturedRequestsTable();
    await createLeadsTable();
    await createContentStringsTable();
    await seedInitialContentStrings();
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }

  // Database setup endpoint for manual initialization
  app.post('/api/setup-db', async (req, res) => {
    try {
      const result = await createOwnershipClaimsTable();
      res.json({ success: result, message: result ? 'Database tables created successfully' : 'Failed to create tables' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error setting up database', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Set up authentication system first
  setupAuth(app);
  
  // Register existing modular route handlers
  setupAuthRoutes(app);
  setupBusinessRoutes(app);
  setupAdminRoutes(app);
  setupReviewRoutes(app);
  registerCategoryRoutes(app);
  setupLeadRoutes(app);
  
  // Register content management routes
  app.use(contentRouter);
  
  // Register optimization routes
  app.use('/api/admin', optimizationRoutes);

  // Register new modular routers
  app.use('/api', settingsRouter);
  app.use('/api', importRouter);
  app.use('/api', claimsRouter);
  app.use('/api', servicesRouter);
  app.use('/api', socialMediaRouter);
  app.use('/api', menuRouter);
  app.use('/api', pagesRouter);

  // Featured requests setup
  setupFeaturedRequestsRoutes(app);

  // Business optimization endpoint
  app.post('/api/admin/optimize-businesses', async (req, res) => {
    try {
      const { businessIds } = req.body;
      if (!businessIds || !Array.isArray(businessIds)) {
        return res.status(400).json({ message: 'businessIds array is required' });
      }

      const optimizedBusinesses = await optimizeBusinesses(businessIds);
      res.json({ 
        success: true, 
        optimizedCount: optimizedBusinesses.length,
        businesses: optimizedBusinesses 
      });
    } catch (error) {
      console.error('Error optimizing businesses:', error);
      res.status(500).json({ 
        message: 'Failed to optimize businesses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}