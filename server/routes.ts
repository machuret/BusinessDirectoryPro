import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { insertBusinessSchema, insertReviewSchema, insertCategorySchema, insertMenuItemSchema, insertPageSchema, publicReviewSchema } from "@shared/schema";
import { optimizeBusinesses } from "./openai";
import { z } from "zod";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    },
  });

  // Set up authentication routes
  setupAuth(app);

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(categoryId);
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Business routes
  app.get('/api/businesses', async (req, res) => {
    try {
      const {
        categoryId,
        search,
        city,
        featured,
        limit = '50',
        offset = '0'
      } = req.query;

      const businesses = await storage.getBusinesses({
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
        city: city as string,
        featured: featured === 'true',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get('/api/businesses/featured', async (req, res) => {
    try {
      const { limit = '6' } = req.query;
      const businesses = await storage.getFeaturedBusinesses(parseInt(limit as string));
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching featured businesses:", error);
      res.status(500).json({ message: "Failed to fetch featured businesses" });
    }
  });

  app.get('/api/businesses/search', async (req, res) => {
    try {
      const { q: query, location } = req.query;
      
      // Allow search with either query or location or both
      if (!query && !location) {
        return res.status(400).json({ message: "Search query or location is required" });
      }

      const businesses = await storage.searchBusinesses(query as string || '', location as string);
      res.json(businesses);
    } catch (error) {
      console.error("Error searching businesses:", error);
      res.status(500).json({ message: "Failed to search businesses" });
    }
  });

  // Get unique cities for filtering
  app.get('/api/cities', async (req, res) => {
    try {
      const cities = await storage.getUniqueCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // Get businesses by city
  app.get('/api/cities/:city/businesses', async (req, res) => {
    try {
      const { city } = req.params;
      const { limit = '50', offset = '0' } = req.query;
      
      const businesses = await storage.getBusinesses({
        city: decodeURIComponent(city),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses by city:", error);
      res.status(500).json({ message: "Failed to fetch businesses by city" });
    }
  });

  // Slug-based business lookup endpoint
  app.get('/api/businesses/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const business = await storage.getBusinessBySlug(slug);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business by slug:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.get('/api/businesses/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      let business;
      
      // Try to get business by slug first, then by placeid
      business = await storage.getBusinessBySlug(identifier);
      if (!business) {
        business = await storage.getBusinessById(identifier);
      }
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.get('/api/businesses/:placeid/reviews', async (req, res) => {
    try {
      const { placeid } = req.params;
      const reviews = await storage.getReviewsByBusiness(placeid);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Public review submission (no authentication required)
  app.post('/api/businesses/:placeid/reviews/public', async (req, res) => {
    try {
      const { placeid } = req.params;
      const reviewData = publicReviewSchema.parse(req.body);
      
      const review = await storage.createPublicReview(placeid, reviewData);
      
      res.status(201).json({ 
        message: "Review submitted successfully. It will be visible after admin approval.",
        review: review
      });
    } catch (error) {
      console.error("Error creating public review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  app.post('/api/businesses/:placeid/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const { placeid } = req.params;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        businessId: placeid,
        userId: userId,
      });
      
      const review = await storage.createReview(reviewData);
      await storage.updateBusinessRating(placeid);
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/businesses/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const business = await storage.getBusinessBySlug(slug);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.get('/api/businesses/owner/:ownerId', isAuthenticated, async (req: any, res) => {
    try {
      const { ownerId } = req.params;
      const userId = req.session.userId;
      
      // Users can only view their own businesses unless they're admin
      if (userId !== ownerId) {
        const user = await storage.getUser(userId);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const businesses = await storage.getBusinessesByOwner(ownerId);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching user businesses:", error);
      res.status(500).json({ message: "Failed to fetch user businesses" });
    }
  });

  app.post('/api/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const businessData = insertBusinessSchema.parse({
        ...req.body,
        ownerId: userId,
      });

      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid business data", errors: error.errors });
      }
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  app.patch('/api/businesses/:id', isAuthenticated, async (req: any, res) => {
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

      const updateData = insertBusinessSchema.partial().parse(req.body);
      const updatedBusiness = await storage.updateBusiness(id, updateData);
      
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid business data", errors: error.errors });
      }
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  app.delete('/api/businesses/:id', isAuthenticated, async (req: any, res) => {
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

  // Review routes
  app.get('/api/businesses/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getReviewsByBusiness(parseInt(id));
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/businesses/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        businessId: parseInt(id),
        userId,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin routes
  app.patch('/api/admin/businesses/:id/feature', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { featured } = req.body;
      
      const updatedBusiness = await storage.updateBusiness(parseInt(id), { featured });
      
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business feature status:", error);
      res.status(500).json({ message: "Failed to update business feature status" });
    }
  });

  // Admin-only user management routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const updateData = req.body;
      
      const updatedUser = await storage.updateUser(id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin business management routes
  app.get('/api/admin/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { limit = '50', offset = '0' } = req.query;
      const businesses = await storage.getBusinesses({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching admin businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.patch('/api/admin/businesses/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { verified } = req.body;
      
      const updatedBusiness = await storage.updateBusiness(parseInt(id), { verified });
      
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business verification:", error);
      res.status(500).json({ message: "Failed to update business verification" });
    }
  });

  app.patch('/api/admin/businesses/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { active } = req.body;
      
      const updatedBusiness = await storage.updateBusiness(parseInt(id), { active });
      
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business status:", error);
      res.status(500).json({ message: "Failed to update business status" });
    }
  });

  // Admin category management routes
  app.patch('/api/admin/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { name, description, icon, color } = req.body;
      
      // Generate slug from name if provided
      const updateData: any = {};
      if (name) {
        updateData.name = name;
        updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      if (description !== undefined) updateData.description = description;
      if (icon) updateData.icon = icon;
      if (color) updateData.color = color;
      
      const updatedCategory = await storage.updateCategory(parseInt(id), updateData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.post('/api/admin/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { name, description, icon, color } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }
      
      const categoryData = {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: description || null,
        icon: icon || 'fas fa-folder',
        color: color || '#6366f1'
      };
      
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.delete('/api/admin/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      await storage.deleteCategory(parseInt(id));
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Site settings routes
  app.get('/api/site-settings', async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      const settingsMap = settings.reduce((acc, setting) => {
        let value = setting.value;
        // Handle double-encoded JSON strings
        if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
          value = JSON.parse(value);
        }
        acc[setting.key] = value;
        return acc;
      }, {} as Record<string, any>);
      
      res.json(settingsMap);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.get('/api/admin/site-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.patch('/api/admin/site-settings/:key', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { key } = req.params;
      const { value, description, category } = req.body;
      
      const updatedSetting = await storage.updateSiteSetting(key, value, description, category);
      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Failed to update site setting" });
    }
  });

  // CSV Import endpoint
  app.post('/api/admin/import/businesses', isAuthenticated, upload.single('csvFile'), async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No CSV file provided" });
      }

      const csvBuffer = req.file.buffer;
      const csvData: any[] = [];
      
      // Parse CSV data
      const readable = new Readable();
      readable.push(csvBuffer);
      readable.push(null);

      return new Promise<void>((resolve, reject) => {
        readable
          .pipe(csv())
          .on('data', (row) => {
            csvData.push(row);
          })
          .on('end', async () => {
            try {
              // Process CSV import
              const result = await storage.bulkImportBusinesses(csvData);
              res.json(result);
              resolve();
            } catch (error) {
              console.error("Error importing CSV data:", error);
              res.status(500).json({ message: "Failed to import CSV data" });
              reject(error);
            }
          })
          .on('error', (error) => {
            console.error("Error parsing CSV:", error);
            res.status(400).json({ message: "Invalid CSV format" });
            reject(error);
          });
      });
    } catch (error) {
      console.error("Error processing CSV upload:", error);
      res.status(500).json({ message: "Failed to process CSV upload" });
    }
  });

  // Ownership claim endpoints
  app.get("/api/ownership-claims", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const claims = await storage.getOwnershipClaims();
      res.json(claims);
    } catch (error) {
      console.error("Error fetching ownership claims:", error);
      res.status(500).json({ message: "Failed to fetch ownership claims" });
    }
  });

  app.get("/api/ownership-claims/user/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const claims = await storage.getOwnershipClaimsByUser(userId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching user ownership claims:", error);
      res.status(500).json({ message: "Failed to fetch ownership claims" });
    }
  });

  app.post("/api/ownership-claims", isAuthenticated, async (req, res) => {
    try {
      const { businessId, message } = req.body;
      const userId = (req.session as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const claim = await storage.createOwnershipClaim({
        userId,
        businessId,
        message,
        status: 'pending'
      });

      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating ownership claim:", error);
      res.status(500).json({ message: "Failed to create ownership claim" });
    }
  });

  app.patch("/api/ownership-claims/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminMessage } = req.body;
      const reviewedBy = (req.session as any).userId;

      const updatedClaim = await storage.updateOwnershipClaim(
        parseInt(id),
        status,
        adminMessage,
        reviewedBy
      );

      res.json(updatedClaim);
    } catch (error) {
      console.error("Error updating ownership claim:", error);
      res.status(500).json({ message: "Failed to update ownership claim" });
    }
  });

  // Admin review management routes
  app.get('/api/admin/reviews', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviewsForAdmin();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/admin/reviews/pending', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getPendingReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  app.patch('/api/admin/reviews/:id/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = (req.session as any).userId;
      
      const review = await storage.approveReview(parseInt(id), adminId, notes);
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  app.patch('/api/admin/reviews/:id/reject', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = (req.session as any).userId;
      
      const review = await storage.rejectReview(parseInt(id), adminId, notes);
      res.json(review);
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "Failed to reject review" });
    }
  });

  // Menu management routes
  app.get('/api/admin/menus', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { position } = req.query;
      const menuItems = await storage.getMenuItems(position as string);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get('/api/admin/menus/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const menuItem = await storage.getMenuItem(parseInt(id));
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  app.post('/api/admin/menus', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(validatedData);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.patch('/api/admin/menus/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const menuItem = await storage.updateMenuItem(parseInt(id), updates);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/admin/menus/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMenuItem(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // OpenAI Optimization routes
  app.post('/api/admin/optimize/descriptions', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { businessIds } = req.body;
      
      if (!Array.isArray(businessIds) || businessIds.length === 0) {
        return res.status(400).json({ message: "Business IDs array is required" });
      }

      const results = await optimizeBusinesses(businessIds, 'descriptions');
      res.json(results);
    } catch (error) {
      console.error("Error optimizing descriptions:", error);
      res.status(500).json({ message: "Failed to optimize descriptions" });
    }
  });

  app.post('/api/admin/optimize/faqs', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { businessIds } = req.body;
      
      if (!Array.isArray(businessIds) || businessIds.length === 0) {
        return res.status(400).json({ message: "Business IDs array is required" });
      }

      const results = await optimizeBusinesses(businessIds, 'faqs');
      res.json(results);
    } catch (error) {
      console.error("Error generating FAQs:", error);
      res.status(500).json({ message: "Failed to generate FAQs" });
    }
  });

  // CMS Page management routes
  app.get('/api/admin/pages', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const pages = await storage.getPages(status as string);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get('/api/admin/pages/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const page = await storage.getPage(parseInt(id));
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.get('/api/pages/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getPageBySlug(slug);
      if (!page || page.status !== 'published') {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page by slug:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.post('/api/admin/pages', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertPageSchema.parse({
        ...req.body,
        authorId: userId
      });
      
      const page = await storage.createPage(validatedData);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.patch('/api/admin/pages/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const page = await storage.updatePage(parseInt(id), updates);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.patch('/api/admin/pages/:id/publish', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).userId;
      
      const page = await storage.publishPage(parseInt(id), userId);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error publishing page:", error);
      res.status(500).json({ message: "Failed to publish page" });
    }
  });

  app.delete('/api/admin/pages/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePage(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
