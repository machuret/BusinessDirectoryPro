import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// Review Management Routes
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