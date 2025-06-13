import { Express } from "express";
import { storage } from "../storage";

export function setupReviewRoutes(app: Express) {
  // Get reviews for a business (public - approved only)
  app.get("/api/businesses/:businessId/reviews", async (req, res) => {
    try {
      const { businessId } = req.params;
      const reviews = await storage.getApprovedReviewsByBusiness(businessId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create a public review
  app.post("/api/businesses/:businessId/reviews", async (req, res) => {
    try {
      const { businessId } = req.params;
      const reviewData = req.body;
      
      const review = await storage.createPublicReview(businessId, reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Create a review (authenticated users)
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const reviewData = { ...req.body, userId };
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin review management
  app.get('/api/admin/reviews', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviewsForAdmin();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/admin/reviews/pending', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getPendingReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  app.patch('/api/admin/reviews/:id/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.userId;
      
      const review = await storage.approveReview(parseInt(id), adminId, notes);
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  app.patch('/api/admin/reviews/:id/reject', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.userId;
      
      const review = await storage.rejectReview(parseInt(id), adminId, notes);
      res.json(review);
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "Failed to reject review" });
    }
  });

  app.delete('/api/admin/reviews/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteReview(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Mass review operations
  app.patch("/api/admin/reviews/mass-action", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { reviewIds, action } = req.body;
      
      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return res.status(400).json({ message: "Review IDs array is required" });
      }

      if (!['approve', 'reject', 'delete'].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      for (const reviewId of reviewIds) {
        if (action === 'delete') {
          await storage.deleteReview(reviewId);
        } else if (action === 'approve') {
          await storage.approveReview(reviewId, req.session.userId);
        } else if (action === 'reject') {
          await storage.rejectReview(reviewId, req.session.userId);
        }
      }

      res.json({ message: `${reviewIds.length} reviews ${action}d successfully` });
    } catch (error) {
      console.error("Error performing mass review action:", error);
      res.status(500).json({ message: "Failed to perform mass review action" });
    }
  });
}