import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizeBusinesses } from "./openai";
import { setupAuthRoutes } from "./routes/auth";
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
    console.log('Database tables initialized successfully');
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

  // Azure Blob Storage upload endpoint
  app.post('/api/admin/upload-image', uploadImage.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { type } = req.body;
      
      if (!type || !['logo', 'background'].includes(type)) {
        return res.status(400).json({ message: 'Invalid upload type. Must be "logo" or "background"' });
      }

      // Generate unique filename
      const fileName = azureBlobService.generateFileName(req.file.originalname, type as 'logo' | 'background');
      
      // Upload to Azure Blob Storage
      const url = await azureBlobService.uploadFile(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );

      res.json({
        success: true,
        url,
        fileName,
        type,
        originalName: req.file.originalname,
        size: req.file.size
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to upload file',
        success: false 
      });
    }
  });

  // Site settings update endpoint
  app.put('/api/admin/site-settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description, category } = req.body;

      if (!value) {
        return res.status(400).json({ message: 'Value is required' });
      }

      const updatedSetting = await storage.updateSiteSetting(
        key,
        value,
        description,
        category
      );

      res.json(updatedSetting);
    } catch (error) {
      console.error('Error updating site setting:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to update setting'
      });
    }
  });

  // Reviews API endpoints
  app.get('/api/reviews/:businessId', async (req, res) => {
    try {
      const reviews = await storage.getBusinessReviews(req.params.businessId);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
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

  // Admin: Update business featured status
  app.patch('/api/admin/businesses/:businessId', async (req, res) => {
    try {
      const { businessId } = req.params;
      const { featured } = req.body;
      
      if (typeof featured !== 'boolean') {
        return res.status(400).json({ message: "Featured status must be a boolean value" });
      }
      
      const updatedBusiness = await storage.updateBusiness(businessId, { featured });
      
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business featured status:", error);
      res.status(500).json({ message: "Failed to update business" });
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

  // Social Media Management APIs
  app.get("/api/social-media", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const links = await storage.getSocialMediaLinks(activeOnly);
      res.json(links);
    } catch (error) {
      console.error("Error fetching social media links:", error);
      res.status(500).json({ message: "Failed to fetch social media links" });
    }
  });

  app.get("/api/admin/social-media", async (req, res) => {
    try {
      const links = await storage.getSocialMediaLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching all social media links:", error);
      res.status(500).json({ message: "Failed to fetch social media links" });
    }
  });

  app.post("/api/admin/social-media", async (req, res) => {
    try {
      const link = await storage.createSocialMediaLink(req.body);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating social media link:", error);
      res.status(500).json({ message: "Failed to create social media link" });
    }
  });

  app.put("/api/admin/social-media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.updateSocialMediaLink(id, req.body);
      if (!link) {
        return res.status(404).json({ message: "Social media link not found" });
      }
      res.json(link);
    } catch (error) {
      console.error("Error updating social media link:", error);
      res.status(500).json({ message: "Failed to update social media link" });
    }
  });

  app.delete("/api/admin/social-media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSocialMediaLink(id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting social media link:", error);
      res.status(500).json({ message: "Failed to delete social media link" });
    }
  });

  app.patch("/api/admin/social-media/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.toggleSocialMediaLink(id);
      if (!link) {
        return res.status(404).json({ message: "Social media link not found" });
      }
      res.json(link);
    } catch (error) {
      console.error("Error toggling social media link:", error);
      res.status(500).json({ message: "Failed to toggle social media link" });
    }
  });

  app.post("/api/admin/social-media/reorder", async (req, res) => {
    try {
      const { reorderData } = req.body;
      await storage.reorderSocialMediaLinks(reorderData);
      res.json({ message: "Social media links reordered successfully" });
    } catch (error) {
      console.error("Error reordering social media links:", error);
      res.status(500).json({ message: "Failed to reorder social media links" });
    }
  });

  app.post("/api/admin/social-media/bulk-update", async (req, res) => {
    try {
      const { updates } = req.body;
      const updatedLinks = await storage.bulkUpdateSocialMediaLinks(updates);
      res.json(updatedLinks);
    } catch (error) {
      console.error("Error bulk updating social media links:", error);
      res.status(500).json({ message: "Failed to bulk update social media links" });
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

  // Revert ownership claim (admin functionality)
  app.put("/api/admin/ownership-claims/:id/revert", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const { adminMessage } = req.body;
      
      // Get reviewer ID from session or use demo-admin as fallback
      const session = req.session as any;
      const reviewedBy = session?.userId || 'demo-admin';
      
      // Update claim status to 'rejected' and remove business ownership
      const updatedClaim = await storage.updateOwnershipClaim(claimId, 'rejected', adminMessage || 'Ownership reverted by admin', reviewedBy);
      
      if (updatedClaim) {
        // Remove business ownership if it was previously approved
        await storage.removeBusinessOwnership(updatedClaim.businessId);
      }
      
      res.json({ 
        success: true, 
        message: "Ownership claim reverted successfully",
        claim: updatedClaim 
      });
    } catch (error) {
      console.error("Error reverting ownership claim:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to revert ownership claim"
      });
    }
  });

  // Business Submissions Management
  app.get("/api/admin/business-submissions", async (req, res) => {
    try {
      const submissions = await storage.getBusinessSubmissions();
      res.json(submissions);
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

  // Page Management APIs
  app.get("/api/pages", async (req, res) => {
    try {
      const { status } = req.query;
      const pages = await storage.getPages(status as string);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.post("/api/admin/pages", async (req, res) => {
    try {
      const page = await storage.createPage(req.body);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.put("/api/admin/pages/:id", async (req, res) => {
    try {
      const pageId = parseInt(req.params.id);
      const page = await storage.updatePage(pageId, req.body);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/admin/pages/:id", async (req, res) => {
    try {
      const pageId = parseInt(req.params.id);
      await storage.deletePage(pageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  app.post("/api/admin/pages/:id/publish", async (req, res) => {
    try {
      const pageId = parseInt(req.params.id);
      const page = await storage.publishPage(pageId);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error publishing page:", error);
      res.status(500).json({ message: "Failed to publish page" });
    }
  });

  // Site Settings API
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.put("/api/site-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const setting = await storage.updateSiteSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Failed to update site setting" });
    }
  });

  // Admin Site Settings API
  app.get("/api/admin/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin site settings:", error);
      res.status(500).json({ message: "Failed to fetch admin site settings" });
    }
  });

  app.patch("/api/admin/site-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const setting = await storage.updateSiteSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating admin site setting:", error);
      res.status(500).json({ message: "Failed to update admin site setting" });
    }
  });

  // Menu Items API
  app.get("/api/menu-items", async (req, res) => {
    try {
      const { location } = req.query;
      const menuItems = await storage.getMenuItems(location as string);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const menuItems = await storage.getMenuItems(location);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items by location:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

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
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Setup featured requests routes
  setupFeaturedRequestsRoutes(app);

  // Setup reviews routes
  setupReviewRoutes(app);

  // Setup content management routes
  app.use(contentRouter);

  const httpServer = createServer(app);
  return httpServer;
}