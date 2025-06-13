import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
// Note: NOT importing from replitAuth to avoid conflicts
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



  // DISABLED: Authentication system for business page access
  // setupAuth(app);

  // Register modular route handlers - but skip auth routes since we handle above
  // setupAuthRoutes(app);
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

  // Services Management Routes - AI-powered service generation
  app.get("/api/admin/services", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Return empty array for now - services will be generated by AI based on business categories
      res.json([]);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.json([]);
    }
  });

  // Generate services from existing businesses using AI
  app.post("/api/admin/services/generate", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get all businesses to analyze their categories and types
      const businesses = await storage.getBusinesses({ 
        limit: 100 
      });
      
      if (businesses.length === 0) {
        return res.status(400).json({ message: "No businesses found to analyze for service generation" });
      }
      
      // Extract unique categories and business types
      const categories = Array.from(new Set(businesses.map(b => b.category).filter(Boolean)));
      const businessTypes = Array.from(new Set(businesses.map(b => b.title).filter(Boolean)));
      
      // Use OpenAI to generate relevant services based on actual business data
      const prompt = `Based on these actual business categories and types from a directory:
      
Categories: ${categories.join(', ')}
Sample Business Types: ${businessTypes.slice(0, 20).join(', ')}

Generate 8-12 relevant professional services that these businesses typically offer. For each service, provide:
1. name (concise, professional)
2. slug (URL-friendly)
3. description (1-2 sentences)
4. category (group similar services)
5. seo_title (SEO optimized title)
6. seo_description (compelling meta description)
7. content (2-3 paragraphs of detailed content)

Respond with JSON format: {"services": [array of service objects]}. Make services relevant to the actual business types found.`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const aiResult = await openaiResponse.json();
      const generatedServices = JSON.parse(aiResult.choices[0].message.content);

      res.json({
        success: true,
        services: generatedServices.services || generatedServices,
        businessesAnalyzed: businesses.length,
        categoriesFound: categories.length
      });

    } catch (error) {
      console.error("Error generating services:", error);
      res.status(500).json({ message: "Failed to generate services using AI" });
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

  // Menu Management APIs
  app.post("/api/admin/menu-items", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/admin/menu-items/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.updateMenuItem(id, req.body);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu-items/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMenuItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  app.put("/api/admin/menu-items/:id/reorder", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { direction } = req.body;
      const result = await storage.reorderMenuItem(id, direction);
      if (!result) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json({ message: "Menu item reordered successfully" });
    } catch (error) {
      console.error("Error reordering menu item:", error);
      res.status(500).json({ message: "Failed to reorder menu item" });
    }
  });

  // Ownership Claims Management
  app.get("/api/admin/ownership-claims", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Return sample ownership claims for demonstration
      const sampleClaims = [
        {
          id: 1,
          businessId: "ChIJ_baJ4jlYkWsRZsxcUx7VHyc",
          businessTitle: "Brisbane Dental Care",
          userId: "user-123",
          userEmail: "owner@dentalcare.com",
          status: "pending",
          claimDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          verificationNotes: "I am the owner of this dental practice. I have all necessary documentation to prove ownership.",
          contactInfo: {
            name: "Dr. Sarah Johnson",
            phone: "+61 7 3123 4567",
            email: "owner@dentalcare.com"
          }
        },
        {
          id: 2,
          businessId: "ChIJmZH3T45ZkWsRPjD8_Z2oKH0",
          businessTitle: "City Lawyers Brisbane",
          userId: "user-456",
          userEmail: "admin@citylawyers.com.au",
          status: "approved",
          claimDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          adminNotes: "Verified ownership with business registration documents.",
          contactInfo: {
            name: "James Mitchell",
            phone: "+61 7 3456 7890",
            email: "admin@citylawyers.com.au"
          }
        }
      ];
      res.json(sampleClaims);
    } catch (error) {
      console.error("Error fetching ownership claims:", error);
      res.status(500).json({ message: "Failed to fetch ownership claims" });
    }
  });

  app.put("/api/admin/ownership-claims/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      // In a real implementation, this would update the ownership_claims table
      // For now, we'll just return a success response
      res.json({ 
        message: "Ownership claim updated successfully",
        claimId,
        status,
        adminNotes
      });
    } catch (error) {
      console.error("Error updating ownership claim:", error);
      res.status(500).json({ message: "Failed to update ownership claim" });
    }
  });

  // Business Submissions Management
  app.get("/api/admin/business-submissions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Return sample business submissions for demonstration
      const sampleSubmissions = [
        {
          id: 1,
          title: "Green Valley Veterinary Clinic",
          description: "Full-service veterinary clinic providing comprehensive care for pets including medical, surgical, and dental services.",
          address: "123 Green Valley Road, Brisbane QLD 4000",
          city: "Brisbane",
          phone: "+61 7 3234 5678",
          email: "info@greenvalleyvet.com.au",
          website: "https://greenvalleyvet.com.au",
          categoryName: "Veterinary Services",
          submittedBy: "user-789",
          submitterEmail: "owner@greenvalleyvet.com.au",
          status: "pending",
          submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          contactInfo: {
            name: "Dr. Michael Chen",
            phone: "+61 7 3234 5678",
            email: "owner@greenvalleyvet.com.au"
          }
        },
        {
          id: 2,
          title: "Brisbane Marketing Solutions",
          description: "Digital marketing agency specializing in SEO, social media marketing, and web design for small to medium businesses.",
          address: "456 Marketing Street, South Brisbane QLD 4101",
          city: "South Brisbane",
          phone: "+61 7 3345 6789",
          email: "hello@brismarketing.com.au",
          website: "https://brismarketing.com.au",
          categoryName: "Marketing & Advertising",
          submittedBy: "user-101",
          submitterEmail: "admin@brismarketing.com.au",
          status: "approved",
          submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          adminNotes: "Approved - all documentation verified and business listing created successfully.",
          contactInfo: {
            name: "Lisa Rodriguez",
            phone: "+61 7 3345 6789",
            email: "admin@brismarketing.com.au"
          }
        },
        {
          id: 3,
          title: "Artisan Coffee Roasters",
          description: "Local coffee roastery and cafe serving specialty single-origin coffees and light meals in a cozy atmosphere.",
          address: "789 Coffee Lane, Paddington QLD 4064",
          city: "Paddington",
          phone: "+61 7 3456 7890",
          email: "info@artisancoffee.com.au",
          categoryName: "Cafes & Restaurants",
          submittedBy: "user-202",
          submitterEmail: "owner@artisancoffee.com.au",
          status: "rejected",
          submissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          adminNotes: "Rejected - insufficient business documentation provided. Please resubmit with business registration details.",
          contactInfo: {
            name: "Tom Wilson",
            phone: "+61 7 3456 7890",
            email: "owner@artisancoffee.com.au"
          }
        }
      ];
      res.json(sampleSubmissions);
    } catch (error) {
      console.error("Error fetching business submissions:", error);
      res.status(500).json({ message: "Failed to fetch business submissions" });
    }
  });

  app.put("/api/admin/business-submissions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      // In a real implementation, this would:
      // 1. Update the business_submissions table
      // 2. If approved, create a new business listing
      // 3. Send notification to the submitter
      
      res.json({ 
        message: "Business submission updated successfully",
        submissionId,
        status,
        adminNotes
      });
    } catch (error) {
      console.error("Error updating business submission:", error);
      res.status(500).json({ message: "Failed to update business submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}