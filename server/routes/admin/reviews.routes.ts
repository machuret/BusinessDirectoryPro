import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// Review Management Routes
// Get all reviews for admin
router.get('/', async (req, res) => {
  try {
    const reviews = await storage.getReviews();
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// Create new review
router.post('/', async (req, res) => {
  try {
    const review = await storage.createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// Update review status (approve/reject)
router.patch('/:reviewId/status', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const { status, adminNotes } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const review = await storage.updateReviewStatus(reviewId, status, adminNotes);
    res.json(review);
  } catch (error) {
    console.error("Error updating review status:", error);
    res.status(500).json({ message: "Failed to update review status" });
  }
});

// Delete single review
router.delete('/:reviewId', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    await storage.deleteReview(reviewId);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

// Bulk delete reviews
router.delete('/bulk', async (req, res) => {
  try {
    const { reviewIds } = req.body;
    
    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({ message: "reviewIds array is required" });
    }

    let deletedCount = 0;
    for (const reviewId of reviewIds) {
      try {
        await storage.deleteReview(reviewId);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting review ${reviewId}:`, error);
      }
    }

    res.json({ 
      message: `${deletedCount} reviews deleted successfully`,
      deletedCount 
    });
  } catch (error) {
    console.error("Error bulk deleting reviews:", error);
    res.status(500).json({ message: "Failed to bulk delete reviews" });
  }
});

export default router;