import { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { db } from "../db";
import { pageContent } from "@shared/schema";
import { eq } from "drizzle-orm";

export function setupFeaturedRequestsRoutes(app: Express) {
  // Initialize page content table and data
  app.post("/api/featured-requests/initialize-page-content", async (req, res) => {
    try {
      // Create table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS page_content (
          id SERIAL PRIMARY KEY,
          page_key VARCHAR NOT NULL UNIQUE,
          title VARCHAR NOT NULL,
          content TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // Insert default content
      const existingContent = await db.select().from(pageContent).where(eq(pageContent.pageKey, 'get-featured'));
      
      if (existingContent.length === 0) {
        await db.insert(pageContent).values({
          pageKey: 'get-featured',
          title: 'Get Featured',
          content: `Ready to boost your business visibility? Getting featured in our directory puts your business in front of thousands of potential customers.

**Why Get Featured?**
• Increased visibility in search results
• Priority placement on our homepage
• Enhanced business profile with special badge
• Higher customer discovery rates

**Requirements:**
• Must be a verified business owner
• Business profile should be complete
• Good standing in our community

Submit your request below and our team will review it within 24-48 hours.`,
          isActive: true
        });
      }

      res.json({ success: true, message: "Page content initialized successfully" });
    } catch (error) {
      console.error("Error initializing page content:", error);
      res.status(500).json({ message: "Failed to initialize page content" });
    }
  });

  // Page content routes for admin-editable pages
  app.get("/api/page-content/:pageKey", async (req, res) => {
    try {
      const { pageKey } = req.params;
      const content = await db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey));
      
      if (content.length === 0) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      res.json(content[0]);
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });

  app.put("/api/page-content/:pageKey", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || !currentUser.claims) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(currentUser.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { pageKey } = req.params;
      const { title, content } = req.body;
      
      const [updated] = await db.update(pageContent)
        .set({ 
          title, 
          content, 
          updatedAt: new Date() 
        })
        .where(eq(pageContent.pageKey, pageKey))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating page content:", error);
      res.status(500).json({ message: "Failed to update page content" });
    }
  });

  // Get all featured requests for admin review with business details
  app.get("/api/admin/featured-requests", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || !currentUser.claims) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(currentUser.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const requests = await storage.getAllFeaturedRequestsWithBusinessDetails();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching admin featured requests:", error);
      res.status(500).json({ message: "Failed to fetch featured requests" });
    }
  });

  // Approve or reject featured request (admin only)
  app.patch("/api/admin/featured-requests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || !currentUser.claims) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(currentUser.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { status, adminMessage } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      const updatedRequest = await storage.updateFeaturedRequestStatus(
        parseInt(id), 
        status, 
        user.id, 
        adminMessage
      );

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating featured request:", error);
      res.status(500).json({ message: "Failed to update featured request" });
    }
  });
  // Get featured requests for a specific user
  app.get("/api/featured-requests/user/:userId", async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUserId = sessionUser.id;
      
      // Users can only view their own featured requests, admins can view any
      if (currentUserId !== userId) {
        if (sessionUser.role !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const requests = await storage.getFeaturedRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching user featured requests:", error);
      res.status(500).json({ message: "Failed to fetch featured requests" });
    }
  });

  // Create a new featured request
  app.post("/api/featured-requests", async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = sessionUser.id;

      const { businessId, message } = req.body;
      
      if (!businessId) {
        return res.status(400).json({ message: "Business ID is required" });
      }

      // Check if user owns the business
      const business = await storage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      if (business.ownerid !== userId) {
        return res.status(403).json({ message: "You can only request featuring for businesses you own" });
      }

      // Check if business is already featured
      if (business.featured) {
        return res.status(400).json({ message: "This business is already featured" });
      }

      // Check for existing pending request
      const userRequests = await storage.getFeaturedRequestsByUser(userId);
      const existingRequest = userRequests.find(
        req => req.businessId === businessId && req.status === 'pending'
      );

      if (existingRequest) {
        return res.status(400).json({ message: "You already have a pending featured request for this business" });
      }

      const request = await storage.createFeaturedRequest({
        businessId,
        userId,
        message
      });

      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating featured request:", error);
      res.status(500).json({ message: "Failed to create featured request" });
    }
  });

  // Admin: Get all featured requests
  app.get("/api/admin/featured-requests", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const requests = await storage.getAllFeaturedRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching featured requests:", error);
      res.status(500).json({ message: "Failed to fetch featured requests" });
    }
  });

  // Admin: Update featured request status
  app.patch("/api/admin/featured-requests/:id", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { status, adminMessage } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }

      const updatedRequest = await storage.updateFeaturedRequestStatus(
        parseInt(id),
        status,
        adminMessage,
        userId
      );

      if (!updatedRequest) {
        return res.status(404).json({ message: "Featured request not found" });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating featured request:", error);
      res.status(500).json({ message: "Failed to update featured request" });
    }
  });
}