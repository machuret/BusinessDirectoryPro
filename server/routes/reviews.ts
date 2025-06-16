import { Express } from "express";
import { storage } from "../storage";
import { 
  createPublicReview, 
  createUserReview, 
  deleteReview, 
  approveReview, 
  rejectReview,
  validateMassReviewAction 
} from "../services/review.service";

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
      
      const review = await createPublicReview(businessId, reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      const message = error instanceof Error ? error.message : "Failed to create review";
      res.status(400).json({ message });
    }
  });

  // Create a review (authenticated users)
  app.post("/api/reviews", async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const reviewData = { ...req.body, userId };
      
      const review = await createUserReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      const message = error instanceof Error ? error.message : "Failed to create review";
      res.status(400).json({ message });
    }
  });

  // Admin review management
  app.get('/api/admin/reviews', async (req, res) => {
    try {
      const reviews = await storage.getAllReviewsForAdmin();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/admin/reviews/pending', async (req, res) => {
    try {
      const reviews = await storage.getPendingReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  app.patch('/api/admin/reviews/:id/approve', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.userId;
      
      const review = await approveReview(parseInt(id), adminId, notes);
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      const message = error instanceof Error ? error.message : "Failed to approve review";
      res.status(400).json({ message });
    }
  });

  app.patch('/api/admin/reviews/:id/reject', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.userId;
      
      const review = await rejectReview(parseInt(id), adminId, notes);
      res.json(review);
    } catch (error) {
      console.error("Error rejecting review:", error);
      const message = error instanceof Error ? error.message : "Failed to reject review";
      res.status(400).json({ message });
    }
  });

  app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteReview(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      const message = error instanceof Error ? error.message : "Failed to delete review";
      res.status(400).json({ message });
    }
  });

  // Mass review operations
  app.patch("/api/admin/reviews/mass-action", async (req: any, res) => {
    try {
      const validation = validateMassReviewAction(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.error });
      }

      const { reviewIds, action } = req.body;
      const adminId = req.session.userId;
      const errors: any[] = [];
      let successCount = 0;

      for (const reviewId of reviewIds) {
        try {
          if (action === 'delete') {
            await deleteReview(reviewId);
          } else if (action === 'approve') {
            await approveReview(reviewId, adminId);
          } else if (action === 'reject') {
            await rejectReview(reviewId, adminId);
          }
          successCount++;
        } catch (error) {
          errors.push({
            reviewId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        message: `${successCount} of ${reviewIds.length} reviews ${action}d successfully`,
        successCount,
        totalRequested: reviewIds.length,
        errors
      });
    } catch (error) {
      console.error("Error performing mass review action:", error);
      const message = error instanceof Error ? error.message : "Failed to perform mass review action";
      res.status(500).json({ message });
    }
  });
}