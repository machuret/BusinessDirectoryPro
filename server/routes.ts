import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { optimizeBusinesses } from "./openai";
import { setupAuthRoutes } from "./routes/auth";
import { setupBusinessRoutes } from "./routes/businesses";
import { setupAdminRoutes } from "./routes/admin";
import { setupReviewRoutes } from "./routes/reviews";
// import { setupCategoryRoutes } from "./routes/categories";
import { setupSettingsRoutes } from "./routes/settings";
import optimizationRoutes from "./routes/optimization";
import { registerCategoryRoutes } from "./routes/categories";

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
  
  // Register optimization routes
  app.use('/api/admin', optimizationRoutes);

  // CSV Import functionality
  app.post('/api/admin/import-csv', isAuthenticated, isAdmin, upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
      }

      const csvData: any[] = [];
      const stream = Readable.from(req.file.buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => csvData.push(data))
        .on('end', async () => {
          try {
            const result = await storage.bulkImportBusinesses(csvData);
            res.json({
              message: `Import completed. ${result.success} businesses imported successfully.`,
              success: result.success,
              errors: result.errors
            });
          } catch (error) {
            console.error('Error importing CSV:', error);
            res.status(500).json({ message: 'Failed to import CSV data' });
          }
        });
    } catch (error) {
      console.error('Error processing CSV upload:', error);
      res.status(500).json({ message: 'Failed to process CSV upload' });
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

  const httpServer = createServer(app);
  return httpServer;
}