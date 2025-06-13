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