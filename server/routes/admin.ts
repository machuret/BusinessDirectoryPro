import { Express } from "express";
import { storage } from "../storage";
import uploadRouter from "./upload";
import { azureBlobService } from "../azure-blob";

// Import modular sub-routers
import businessesRouter from "./admin/businesses.routes";
import usersRouter from "./admin/users.routes";
import categoriesRouter from "./admin/categories.routes";
import citiesRouter from "./admin/cities.routes";
import leadsRouter from "./admin/leads.routes";
import reviewsRouter from "./admin/reviews.routes";

export function setupAdminRoutes(app: Express) {
  // Register upload router for admin file uploads
  app.use('/api/admin', uploadRouter);
  
  // Register modular sub-routers with their respective base paths
  app.use('/api/admin/businesses', businessesRouter);
  app.use('/api/admin/users', usersRouter);
  app.use('/api/admin/categories', categoriesRouter);
  app.use('/api/admin/cities', citiesRouter);
  app.use('/api/admin/leads', leadsRouter);
  app.use('/api/admin/reviews', reviewsRouter);

  // Additional non-CRUD routes that don't belong to specific sub-routers

  // User role management
  app.patch('/api/admin/users/:userId/role', async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'user'" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user role
      const updatedUser = await storage.updateUser(userId, { role: role });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Business submissions management
  app.get('/api/admin/business-submissions', async (req, res) => {
    try {
      const submissions = await storage.getBusinessSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching business submissions:", error);
      res.status(500).json({ message: "Failed to fetch business submissions" });
    }
  });

  app.patch('/api/admin/business-submissions/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const reviewedBy = req.session?.userId;

      const result = await storage.updateBusinessSubmissionStatus(id, status, adminNotes, reviewedBy);
      
      if (!result) {
        return res.status(404).json({ message: "Business submission not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error updating business submission:", error);
      res.status(500).json({ message: "Failed to update business submission" });
    }
  });

  // Get all businesses with filters (admin specific filtering)
  app.get('/api/admin/search/businesses', async (req, res) => {
    try {
      const { search, category, city, status } = req.query;
      const filters: any = {};
      
      if (search) filters.search = search as string;
      if (category) filters.category = category as string;
      if (city) filters.city = city as string;
      if (status) filters.status = status as string;
      
      const businesses = await storage.getBusinesses(filters);
      res.json(businesses);
    } catch (error) {
      console.error("Error searching businesses:", error);
      res.status(500).json({ message: "Failed to search businesses" });
    }
  });

  // Get all cities (admin view)
  app.get('/api/admin/cities', async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // Get all categories (admin view)
  app.get('/api/admin/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all reviews (admin view)
  app.get('/api/admin/reviews', async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Review status management
  app.patch('/api/admin/reviews/:reviewId/approve', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      await storage.updateReview(reviewId, { status: 'approved' });
      res.json({ message: "Review approved successfully" });
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  app.patch('/api/admin/reviews/:reviewId/reject', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      await storage.updateReview(reviewId, { status: 'rejected' });
      res.json({ message: "Review rejected successfully" });
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "Failed to reject review" });
    }
  });

  // Get site settings (admin only)
  app.get('/api/admin/site-settings', async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  // Update site settings (admin only)
  app.patch('/api/admin/site-settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      await storage.updateSiteSetting(key, value);
      res.json({ message: "Site setting updated successfully" });
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Failed to update site setting" });
    }
  });

  // Get featured requests (admin view)
  app.get('/api/admin/featured-requests', async (req, res) => {
    try {
      const requests = await storage.getAllFeaturedRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching featured requests:", error);
      res.status(500).json({ message: "Failed to fetch featured requests" });
    }
  });

  // Update featured request status
  app.patch('/api/admin/featured-requests/:requestId/status', async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateFeaturedRequestStatus(requestId, status);
      res.json({ message: "Featured request status updated successfully" });
    } catch (error) {
      console.error("Error updating featured request status:", error);
      res.status(500).json({ message: "Failed to update featured request status" });
    }
  });

  // Get ownership claims (admin view)
  app.get('/api/admin/ownership-claims', async (req, res) => {
    try {
      const claims = await storage.getOwnershipClaims();
      res.json(claims);
    } catch (error) {
      console.error("Error fetching ownership claims:", error);
      res.status(500).json({ message: "Failed to fetch ownership claims" });
    }
  });

  // Update ownership claim status
  app.patch('/api/admin/ownership-claims/:claimId/status', async (req, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateOwnershipClaim(claimId, status);
      res.json({ message: "Ownership claim status updated successfully" });
    } catch (error) {
      console.error("Error updating ownership claim status:", error);
      res.status(500).json({ message: "Failed to update ownership claim status" });
    }
  });

  // Site Settings Management
  app.get('/api/admin/site-settings', async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.put('/api/admin/site-settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description, category } = req.body;
      
      const setting = await storage.updateSiteSetting(key, value, description, category);
      res.json(setting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Failed to update site setting" });
    }
  });

  // Azure Blob Storage Test Endpoint
  app.post('/api/admin/azure-blob/test', async (req, res) => {
    try {
      const testResult = await azureBlobService.testConnection();
      res.json(testResult);
    } catch (error) {
      console.error("Azure Blob Storage test failed:", error);
      res.status(500).json({ 
        success: false, 
        message: "Azure Blob Storage test failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}