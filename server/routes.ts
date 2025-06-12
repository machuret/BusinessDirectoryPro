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

  // Services Management Routes - Using in-memory storage for now due to DB connection issues
  app.get("/api/admin/services", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Temporary in-memory services data until DB connection is resolved
      const services = [
        {
          id: 1,
          name: 'General Dentistry',
          slug: 'general-dentistry',
          description: 'Comprehensive dental care including cleanings, exams, and preventive treatments.',
          category: 'General',
          seo_title: 'General Dentistry Services - Comprehensive Dental Care',
          seo_description: 'Professional general dentistry services including routine cleanings, dental exams, fillings, and preventive care to maintain optimal oral health.',
          content: 'Our general dentistry services provide comprehensive oral healthcare to patients of all ages. We focus on preventive care to help you maintain healthy teeth and gums for life.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Cosmetic Dentistry',
          slug: 'cosmetic-dentistry',
          description: 'Enhance your smile with professional cosmetic dental treatments.',
          category: 'Cosmetic',
          seo_title: 'Cosmetic Dentistry - Professional Smile Enhancement',
          seo_description: 'Transform your smile with our cosmetic dentistry services including teeth whitening, veneers, and smile makeovers by experienced dental professionals.',
          content: 'Our cosmetic dentistry services are designed to enhance the beauty of your smile while maintaining optimal oral health. We use the latest techniques and materials.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Dental Implants',
          slug: 'dental-implants',
          description: 'Permanent tooth replacement solutions with dental implants.',
          category: 'Restorative',
          seo_title: 'Dental Implants - Permanent Tooth Replacement Solutions',
          seo_description: 'Replace missing teeth with natural-looking dental implants. Our experienced team provides comprehensive implant dentistry services.',
          content: 'Dental implants provide a permanent solution for missing teeth, offering the look, feel, and function of natural teeth with long-lasting results.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Orthodontics',
          slug: 'orthodontics',
          description: 'Straighten your teeth with braces and clear aligners.',
          category: 'Orthodontic',
          seo_title: 'Orthodontics - Braces and Clear Aligners',
          seo_description: 'Achieve a straighter smile with our orthodontic treatments including traditional braces, clear aligners, and Invisalign.',
          content: 'Our orthodontic services help patients of all ages achieve straighter, healthier smiles through various treatment options tailored to individual needs.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Root Canal Therapy',
          slug: 'root-canal-therapy',
          description: 'Save your natural teeth with professional root canal treatment.',
          category: 'Endodontic',
          seo_title: 'Root Canal Therapy - Save Your Natural Teeth',
          seo_description: 'Professional root canal therapy to save infected or damaged teeth. Our gentle approach ensures comfortable treatment and successful outcomes.',
          content: 'Root canal therapy allows us to save natural teeth that have become infected or severely damaged, providing pain relief and preserving your smile.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 6,
          name: 'Teeth Whitening',
          slug: 'teeth-whitening',
          description: 'Professional teeth whitening for a brighter, whiter smile.',
          category: 'Cosmetic',
          seo_title: 'Professional Teeth Whitening - Brighter Smile',
          seo_description: 'Achieve a brighter, whiter smile with our professional teeth whitening treatments. Safe, effective, and long-lasting results.',
          content: 'Our professional teeth whitening treatments can safely and effectively brighten your smile, removing stains and discoloration for dramatic results.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
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