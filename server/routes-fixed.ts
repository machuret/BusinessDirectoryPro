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

  // No authentication system - public access

  // Register modular route handlers
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
        return res.status(400).json({ message: 'Business IDs array is required' });
      }

      if (!['descriptions', 'faqs'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either "descriptions" or "faqs"' });
      }

      const result = await optimizeBusinesses(businessIds, type);
      res.json(result);
    } catch (error) {
      console.error('Error optimizing businesses:', error);
      res.status(500).json({ message: 'Failed to optimize businesses' });
    }
  });

  // Leads management
  app.get('/api/admin/leads', async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({ message: 'Failed to fetch leads' });
    }
  });

  // User authentication routes (bypassed for development)
  app.get('/api/user', async (req, res) => {
    // Return demo user for development
    res.json({
      id: "demo-user",
      username: "demo",
      role: "admin"
    });
  });

  // Business management routes
  app.get('/api/businesses/stats', async (req, res) => {
    try {
      const stats = await storage.getBusinessStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching business stats:', error);
      res.status(500).json({ message: 'Failed to fetch business statistics' });
    }
  });

  app.get('/api/admin/export/businesses', async (req, res) => {
    try {
      const businesses = await storage.getAllBusinesses();
      res.json(businesses);
    } catch (error) {
      console.error('Error exporting businesses:', error);
      res.status(500).json({ message: 'Failed to export businesses' });
    }
  });

  // FAQ management
  app.get('/api/admin/faq', async (req, res) => {
    try {
      const faq = await storage.getFAQItems();
      res.json(faq);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      res.status(500).json({ message: 'Failed to fetch FAQ items' });
    }
  });

  app.post('/api/admin/faq', async (req, res) => {
    try {
      const faq = await storage.createFAQItem(req.body);
      res.status(201).json(faq);
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ message: 'Failed to create FAQ item' });
    }
  });

  app.put('/api/admin/faq/:id', async (req, res) => {
    try {
      const faq = await storage.updateFAQItem(parseInt(req.params.id), req.body);
      res.json(faq);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ message: 'Failed to update FAQ item' });
    }
  });

  app.delete('/api/admin/faq/:id', async (req, res) => {
    try {
      await storage.deleteFAQItem(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ message: 'Failed to delete FAQ item' });
    }
  });

  // Menu management
  app.get('/api/menu-items', async (req, res) => {
    try {
      const { location } = req.query;
      const items = await storage.getMenuItems(location as string);
      res.json(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ message: 'Failed to fetch menu items' });
    }
  });

  app.post('/api/admin/menu-items', async (req, res) => {
    try {
      const item = await storage.createMenuItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ message: 'Failed to create menu item' });
    }
  });

  app.put('/api/admin/menu-items/:id', async (req, res) => {
    try {
      const item = await storage.updateMenuItem(parseInt(req.params.id), req.body);
      res.json(item);
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ message: 'Failed to update menu item' });
    }
  });

  app.delete('/api/admin/menu-items/:id', async (req, res) => {
    try {
      await storage.deleteMenuItem(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ message: 'Failed to delete menu item' });
    }
  });

  app.post('/api/admin/menu-items/reorder', async (req, res) => {
    try {
      const { items } = req.body;
      await Promise.all(
        items.map((item: any) => 
          storage.updateMenuItem(item.id, { position: item.position })
        )
      );
      res.sendStatus(200);
    } catch (error) {
      console.error('Error reordering menu items:', error);
      res.status(500).json({ message: 'Failed to reorder menu items' });
    }
  });

  // Pages management
  app.get('/api/pages', async (req, res) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ message: 'Failed to fetch pages' });
    }
  });

  app.post('/api/admin/pages', async (req, res) => {
    try {
      const page = await storage.createPage(req.body);
      res.status(201).json(page);
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ message: 'Failed to create page' });
    }
  });

  app.put('/api/admin/pages/:id', async (req, res) => {
    try {
      const page = await storage.updatePage(parseInt(req.params.id), req.body);
      res.json(page);
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ message: 'Failed to update page' });
    }
  });

  app.delete('/api/admin/pages/:id', async (req, res) => {
    try {
      await storage.deletePage(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ message: 'Failed to delete page' });
    }
  });

  // Direct page routing
  app.get('/api/pages/:slug', async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      res.json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ message: 'Failed to fetch page' });
    }
  });

  // Advanced search endpoint
  app.get('/api/businesses/search', async (req, res) => {
    try {
      const { query, category, city, limit = 20, offset = 0 } = req.query;
      const businesses = await storage.searchBusinesses({
        query: query as string,
        category: category as string,
        city: city as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(businesses);
    } catch (error) {
      console.error('Error searching businesses:', error);
      res.status(500).json({ message: 'Failed to search businesses' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}