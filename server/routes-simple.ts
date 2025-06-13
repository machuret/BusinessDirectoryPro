import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Business endpoints - NO AUTHENTICATION REQUIRED
  app.get('/api/businesses', async (req, res) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  app.get('/api/businesses/slug/:slug', async (req, res) => {
    try {
      console.log('[DEBUG] Fetching business with slug:', req.params.slug);
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        console.log('[DEBUG] Business not found for slug:', req.params.slug);
        return res.status(404).json({ error: "Business not found" });
      }
      console.log('[DEBUG] Business found:', {
        placeid: business.placeid,
        title: business.title,
        slug: business.slug,
        hasTitle: !!business.title,
        hasDescription: !!business.description,
        hasPhone: !!business.phone,
        hasWebsite: !!business.website
      });
      res.json(business);
    } catch (error) {
      console.error('[ERROR] Error fetching business:', error);
      res.status(500).json({ error: "Failed to fetch business" });
    }
  });

  app.get('/api/businesses/featured', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const businesses = await storage.getFeaturedBusinesses(limit);
      res.json(businesses);
    } catch (error) {
      console.error('[ERROR] Error fetching featured businesses:', error);
      res.status(500).json({ error: "Failed to fetch featured businesses" });
    }
  });

  app.get('/api/businesses/random', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 9;
      const businesses = await storage.getRandomBusinesses(limit);
      res.json(businesses);
    } catch (error) {
      console.error('[ERROR] Error fetching random businesses:', error);
      res.status(500).json({ error: "Failed to fetch random businesses" });
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('[ERROR] Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get('/api/businesses/:businessId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getBusinessReviews(req.params.businessId);
      res.json(reviews || []);
    } catch (error) {
      console.error('[ERROR] Error fetching business reviews:', error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Pages endpoints - NO AUTHENTICATION REQUIRED  
  app.get('/api/pages', async (req, res) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  // Menu items endpoints - NO AUTHENTICATION REQUIRED
  app.get('/api/menu-items', async (req, res) => {
    try {
      const location = req.query.location as string || 'header';
      const menuItems = await storage.getMenuItems(location);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  // Site settings endpoints - NO AUTHENTICATION REQUIRED
  app.get('/api/site-settings', async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site settings" });
    }
  });

  // Auth endpoint - ALWAYS RETURN DEMO USER
  app.get('/api/auth/user', (req, res) => {
    console.log('[AUTH BYPASS] Returning demo user for business page viewing');
    res.json({
      id: "demo-user-1",
      email: "maria.garcia@email.com", 
      firstName: "Maria",
      lastName: "Garcia",
      role: "user"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}