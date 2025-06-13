import { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../auth";

export function setupBusinessRoutes(app: Express) {
  // Get all businesses (public)
  app.get("/api/businesses", async (req, res) => {
    try {
      const { categoryId, search, city, featured, limit, offset } = req.query;
      const businesses = await storage.getBusinesses({
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
        city: city as string,
        featured: featured === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get featured businesses (public)
  app.get("/api/businesses/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const businesses = await storage.getFeaturedBusinesses(limit);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching featured businesses:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get random businesses (public)
  app.get("/api/businesses/random", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 9;
      const businesses = await storage.getRandomBusinesses(limit);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching random businesses:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get unique cities (public)
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getUniqueCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get business by ID (public)
  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const business = await storage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get business by slug (public)
  app.get("/api/businesses/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const business = await storage.getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error fetching business by slug:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Search businesses (public)
  app.get("/api/search", async (req, res) => {
    try {
      const { query, location } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const businesses = await storage.searchBusinesses(query as string, location as string);
      res.json(businesses);
    } catch (error) {
      console.error("Error searching businesses:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Alternative search endpoint for compatibility
  app.get("/api/businesses/search", async (req, res) => {
    try {
      const { q, location } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const businesses = await storage.getBusinesses({
        search: q as string,
        city: location as string,
        limit: 50
      });
      res.json(businesses);
    } catch (error) {
      console.error("Error searching businesses:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get user's businesses (authenticated)
  app.get("/api/my-businesses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const businesses = await storage.getBusinessesByOwner(userId);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching user businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Get businesses by category slug (public)
  app.get("/api/businesses/category/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      
      // First get the category by slug to get the ID
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const businesses = await storage.getBusinesses({
        categoryId: category.id,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses by category:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Create business (authenticated)
  app.post("/api/businesses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const businessData = { ...req.body, ownerid: userId };
      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  // Update business (owner or admin)
  app.patch("/api/businesses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      
      // Check if user owns the business or is admin
      const business = await storage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      if (business.ownerid !== userId) {
        const user = await storage.getUser(userId);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const updatedBusiness = await storage.updateBusiness(id, req.body);
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  // Delete business (owner or admin)
  app.delete("/api/businesses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      
      // Check if user owns the business or is admin
      const business = await storage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      if (business.ownerid !== userId) {
        const user = await storage.getUser(userId);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      await storage.deleteBusiness(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting business:", error);
      res.status(500).json({ message: "Failed to delete business" });
    }
  });
}