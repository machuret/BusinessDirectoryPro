import { Express } from "express";
import { storage } from "../storage";

export function setupFeaturedRequestsRoutes(app: Express) {
  // Get featured requests for a specific user
  app.get("/api/featured-requests/user/:userId", async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Check if user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user;
      if (!currentUser || !currentUser.claims) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUserId = currentUser.claims.sub;
      
      // Users can only view their own featured requests, admins can view any
      if (currentUserId !== userId) {
        const user = await storage.getUser(currentUserId);
        if (!user || user.role !== 'admin') {
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user;
      if (!currentUser || !currentUser.claims) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = currentUser.claims.sub;

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