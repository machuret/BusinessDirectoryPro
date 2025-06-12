import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { optimizeBusinesses } from "./openai";
import { setupAuthRoutes } from "./routes/auth";
import { setupBusinessRoutes } from "./routes/businesses";
import { setupAdminRoutes } from "./routes/admin";
import { setupReviewRoutes } from "./routes/reviews";
import { setupSettingsRoutes } from "./routes/settings";
import optimizationRoutes from "./routes/optimization";
import { registerCategoryRoutes } from "./routes/categories";
import { csvImportService } from "./csv-import";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept CSV files for any field name
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    },
  });

  // Set up authentication system
  setupAuth(app);

  // Register modular route handlers
  setupAuthRoutes(app);
  setupBusinessRoutes(app);
  setupAdminRoutes(app);
  setupReviewRoutes(app);
  setupSettingsRoutes(app);
  registerCategoryRoutes(app);
  
  // Register optimization routes
  app.use('/api/admin', optimizationRoutes);

  // CSV Import functionality - Preview
  app.post('/api/admin/import-csv-preview', isAuthenticated, isAdmin, upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
      }

      const preview = await csvImportService.previewImport(req.file.buffer, 10);
      res.json(preview);
    } catch (error) {
      console.error('Error previewing CSV:', error);
      res.status(500).json({ message: 'Failed to preview CSV data' });
    }
  });

  // CSV Import functionality - Validate only
  app.post('/api/admin/import-csv-validate', isAuthenticated, isAdmin, upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
      }

      const csvData = await csvImportService.parseCSV(req.file.buffer);
      const result = await csvImportService.importBusinesses(csvData, {
        validateOnly: true,
        updateDuplicates: false,
        skipDuplicates: true,
        batchSize: 50
      });
      
      res.json({
        ...result,
        message: `Validation completed. ${result.success} valid rows, ${result.errors.length} errors found.`
      });
    } catch (error) {
      console.error('Error validating CSV:', error);
      res.status(500).json({ message: 'Failed to validate CSV data' });
    }
  });

  // CSV Import functionality - Full import
  app.post('/api/admin/import-csv', isAuthenticated, isAdmin, upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
      }

      const { updateDuplicates = false, skipDuplicates = true, batchSize = 50 } = req.body;
      
      const csvData = await csvImportService.parseCSV(req.file.buffer);
      const result = await csvImportService.importBusinesses(csvData, {
        validateOnly: false,
        updateDuplicates: updateDuplicates === 'true',
        skipDuplicates: skipDuplicates === 'true',
        batchSize: parseInt(batchSize) || 50
      });

      res.json({
        ...result,
        message: `Import completed. ${result.created} created, ${result.updated} updated, ${result.duplicatesSkipped} duplicates skipped, ${result.errors.length} errors.`
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      res.status(500).json({ message: 'Failed to import CSV data' });
    }
  });

  // OpenAI optimization endpoints
  app.post('/api/admin/optimize-businesses', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { businessIds, type } = req.body;
      
      if (!Array.isArray(businessIds) || businessIds.length === 0) {
        return res.status(400).json({ message: 'businessIds array is required' });
      }

      if (!['descriptions', 'faqs'].includes(type)) {
        return res.status(400).json({ message: 'Invalid optimization type' });
      }

      const result = await optimizeBusinesses(businessIds, type);
      res.json(result);
    } catch (error) {
      console.error('Error optimizing businesses:', error);
      res.status(500).json({ message: 'Failed to optimize businesses' });
    }
  });

  // Ownership claim routes
  app.get('/api/admin/ownership-claims', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const claims = await storage.getOwnershipClaims();
      res.json(claims);
    } catch (error) {
      console.error("Error fetching ownership claims:", error);
      res.status(500).json({ message: "Failed to fetch ownership claims" });
    }
  });

  app.post('/api/ownership-claims', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const claimData = { ...req.body, userId, status: 'pending' };
      
      const claim = await storage.createOwnershipClaim(claimData);
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating ownership claim:", error);
      res.status(500).json({ message: "Failed to create ownership claim" });
    }
  });

  app.patch('/api/admin/ownership-claims/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminMessage } = req.body;
      const reviewedBy = req.session.userId;
      
      const claim = await storage.updateOwnershipClaim(parseInt(id), status, adminMessage, reviewedBy);
      res.json(claim);
    } catch (error) {
      console.error("Error updating ownership claim:", error);
      res.status(500).json({ message: "Failed to update ownership claim" });
    }
  });

  app.get('/api/my-ownership-claims', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const claims = await storage.getOwnershipClaimsByUser(userId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching user ownership claims:", error);
      res.status(500).json({ message: "Failed to fetch ownership claims" });
    }
  });

  // Duplicate business checking endpoint
  app.post('/api/check-duplicate-business', async (req, res) => {
    try {
      const { title, address } = req.body;
      
      if (!title || !address) {
        return res.status(400).json({ message: "Title and address are required" });
      }

      const businesses = await storage.searchBusinesses(title, address);
      const isDuplicate = businesses.some(business => 
        business.title?.toLowerCase().includes(title.toLowerCase()) &&
        business.address?.toLowerCase().includes(address.toLowerCase())
      );

      res.json({ isDuplicate });
    } catch (error) {
      console.error("Error checking for duplicate business:", error);
      res.status(500).json({ message: "Failed to check for duplicates" });
    }
  });

  // Business submission management endpoints
  app.get('/api/admin/business-submissions', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const submissions = await storage.getBusinessSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching business submissions:", error);
      res.status(500).json({ message: "Failed to fetch business submissions" });
    }
  });

  app.patch('/api/admin/business-submissions/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const reviewedBy = req.session.userId;

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

  // Services Setup Route
  app.post("/api/admin/services/setup", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { setupServicesTables } = await import("./services-setup");
      await setupServicesTables();
      res.json({ message: "Services tables created successfully" });
    } catch (error) {
      console.error("Error setting up services:", error);
      res.status(500).json({ message: "Failed to setup services tables" });
    }
  });

  // Services Management Routes
  app.get("/api/admin/services", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { servicesStorageSimple } = await import("./storage/services-storage-simple");
      await servicesStorageSimple.ensureTablesExist();
      const services = await servicesStorageSimple.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/services", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.updateService(id, req.body);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Setup services tables endpoint
  app.post("/api/admin/setup-services", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { setupServicesDatabase } = await import("./services-database-setup");
      const result = await setupServicesDatabase();
      if (result.success) {
        res.json({ success: true, message: "Services database setup completed", data: result });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      console.error("Error setting up services database:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify services setup endpoint
  app.get("/api/admin/verify-services", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { verifyServicesSetup } = await import("./verify-services-setup");
      const result = await verifyServicesSetup();
      res.json(result);
    } catch (error: any) {
      console.error("Error verifying services setup:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}