import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { optimizeBusinesses } from "./openai";
import { setupAuthRoutes } from "./routes/auth";
import { setupBusinessRoutes } from "./routes/businesses";
import { setupAdminRoutes } from "./routes/admin";
import { setupReviewRoutes } from "./routes/reviews";
import { setupSettingsRoutes } from "./routes/settings";
import optimizationRoutes from "./routes/optimization";
import { registerCategoryRoutes } from "./routes/categories";
import { csvImportService } from "./csv-import";
import { createOwnershipClaimsTable } from "./create-ownership-table";
import { setupFeaturedRequestsRoutes } from "./routes/featured-requests";
import { createFeaturedRequestsTable } from "./create-featured-requests-table";


export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database tables - ensure ownership_claims and featured_requests tables exist
  try {
    await createOwnershipClaimsTable();
    await createFeaturedRequestsTable();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }

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

  // Database setup endpoint for manual initialization
  app.post('/api/setup-db', async (req, res) => {
    try {
      const result = await createOwnershipClaimsTable();
      res.json({ success: result, message: result ? 'Database tables created successfully' : 'Failed to create tables' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error setting up database', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // No authentication system - public access

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
  app.post('/api/admin/import-csv-preview', upload.single('csvFile'), async (req, res) => {
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
  app.post('/api/admin/import-csv-validate', upload.single('csvFile'), async (req, res) => {
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
  app.post('/api/admin/import-csv', upload.single('csvFile'), async (req, res) => {
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
  app.post('/api/admin/optimize-businesses', async (req, res) => {
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

  // User management routes
  app.get('/api/admin/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/admin/users', async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/admin/users/:id', async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.patch('/api/admin/users/:id/password', async (req, res) => {
    try {
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);
      
      // Hash the password
      const salt = randomBytes(16).toString('hex');
      const buf = (await scryptAsync(req.body.password, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString('hex')}.${salt}`;
      
      await storage.updateUserPassword(req.params.id, hashedPassword);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Failed to update password' });
    }
  });

  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Ownership claim routes
  app.get('/api/admin/ownership-claims', async (req, res) => {
    try {
      const claims = await storage.getOwnershipClaims();
      res.json(claims);
    } catch (error) {
      console.error("Error fetching ownership claims:", error);
      res.status(500).json({ message: "Failed to fetch ownership claims" });
    }
  });

  app.post('/api/ownership-claims', async (req: any, res) => {
    try {
      // For now, use a demo user ID - in production this would come from authentication
      const userId = req.user?.id || 'demo-user-1';
      
      const claimData = { 
        ...req.body, 
        userId, 
        status: 'pending' 
      };
      
      console.log('Creating ownership claim:', claimData);
      const claim = await storage.createOwnershipClaim(claimData);
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating ownership claim:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create ownership claim",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch('/api/admin/ownership-claims/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminMessage } = req.body;
      const reviewedBy = req.user?.id || 'demo-admin';
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'pending', 'approved', or 'rejected'" });
      }
      
      console.log(`Admin ${reviewedBy} updating ownership claim ${id} to status: ${status}`);
      const claim = await storage.updateOwnershipClaim(parseInt(id), status, adminMessage, reviewedBy);
      
      if (!claim) {
        return res.status(404).json({ message: "Ownership claim not found" });
      }
      
      res.json(claim);
    } catch (error) {
      console.error("Error updating ownership claim:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update ownership claim",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/my-ownership-claims', async (req: any, res) => {
    try {
      const userId = req.user?.id || 'demo-user-1';
      console.log(`Fetching ownership claims for user: ${userId}`);
      const claims = await storage.getOwnershipClaimsByUser(userId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching user ownership claims:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch ownership claims",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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
  app.post("/api/admin/services/setup", async (req, res) => {
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
  app.get("/api/admin/services", async (req, res) => {
    try {
      // Return empty array for now - services will be generated by AI based on business categories
      res.json([]);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.json([]);
    }
  });

  // Generate services from existing businesses using AI
  app.post("/api/admin/services/generate", async (req, res) => {
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

  app.post("/api/admin/services", async (req, res) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", async (req, res) => {
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

  app.delete("/api/admin/services/:id", async (req, res) => {
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
  app.post("/api/admin/setup-services", async (req, res) => {
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
  app.get("/api/admin/verify-services", async (req, res) => {
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
  app.post("/api/admin/menu-items", async (req, res) => {
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/admin/menu-items/:id", async (req, res) => {
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

  app.delete("/api/admin/menu-items/:id", async (req, res) => {
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

  app.put("/api/admin/menu-items/:id/reorder", async (req, res) => {
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
  app.post("/api/ownership-claims", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.body.userId;
      const { businessId, message } = req.body;

      if (!userId || !businessId || !message) {
        return res.status(400).json({ 
          message: "User ID, business ID, and message are required" 
        });
      }

      if (message.trim().length < 50) {
        return res.status(400).json({ 
          message: "Message must be at least 50 characters long" 
        });
      }

      const claimData = {
        userId,
        businessId,
        message: message.trim(),
        status: 'pending'
      };

      const newClaim = await storage.createOwnershipClaim(claimData);
      res.status(201).json(newClaim);
    } catch (error) {
      console.error("Error creating ownership claim:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create ownership claim"
      });
    }
  });

  app.get("/api/admin/ownership-claims", async (req, res) => {
    try {
      const claims = await storage.getOwnershipClaims();
      res.json(claims);
    } catch (error) {
      console.error("Error fetching ownership claims:", error);
      res.status(500).json({ 
        message: "Failed to fetch ownership claims",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/ownership-claims/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const claims = await storage.getOwnershipClaimsByUser(userId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching user ownership claims:", error);
      res.status(500).json({ 
        message: "Failed to fetch user ownership claims",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/user/businesses", async (req, res) => {
    try {
      const session = req.session as any;
      const userId = session?.userId || 'demo-user-1'; // Fallback for testing
      
      const businesses = await storage.getBusinessesByOwner(userId);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching user businesses:", error);
      res.status(500).json({ 
        message: "Failed to fetch user businesses",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/admin/ownership-claims/:id", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const { status, adminMessage } = req.body;
      
      // Get reviewer ID from session or use demo-admin as fallback
      const session = req.session as any;
      const reviewedBy = session?.userId || 'demo-admin';
      
      const updatedClaim = await storage.updateOwnershipClaim(claimId, status, adminMessage, reviewedBy);
      res.json(updatedClaim);
    } catch (error) {
      console.error("Error updating ownership claim:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update ownership claim"
      });
    }
  });

  app.delete("/api/admin/ownership-claims/:id", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      
      await storage.deleteOwnershipClaim(claimId);
      res.json({ success: true, message: "Ownership claim deleted successfully" });
    } catch (error) {
      console.error("Error deleting ownership claim:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to delete ownership claim"
      });
    }
  });

  // Business Submissions Management
  app.get("/api/admin/business-submissions", async (req, res) => {
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

  app.put("/api/admin/business-submissions/:id", async (req, res) => {
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

  // Setup featured requests routes
  setupFeaturedRequestsRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}