import { Router } from "express";
import * as socialMediaService from "../services/socialMedia.service";

const router = Router();

// Social Media Management APIs
router.get("/social-media", async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const links = await socialMediaService.getAllSocialMediaLinks(activeOnly);
    res.json(links);
  } catch (error) {
    console.error("Error fetching social media links:", error);
    res.status(500).json({ message: "Failed to fetch social media links" });
  }
});

router.get("/admin/social-media", async (req, res) => {
  try {
    const links = await socialMediaService.getAllSocialMediaLinks();
    res.json(links);
  } catch (error) {
    console.error("Error fetching all social media links:", error);
    res.status(500).json({ message: "Failed to fetch social media links" });
  }
});

router.get("/admin/social-media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    
    const link = await socialMediaService.getSocialMediaLinkById(id);
    if (!link) {
      return res.status(404).json({ message: "Social media link not found" });
    }
    res.json(link);
  } catch (error) {
    console.error("Error fetching social media link:", error);
    res.status(500).json({ message: "Failed to fetch social media link" });
  }
});

router.post("/admin/social-media", async (req, res) => {
  try {
    const link = await socialMediaService.createSocialMediaLink(req.body);
    res.status(201).json(link);
  } catch (error) {
    console.error("Error creating social media link:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create social media link" });
  }
});

router.put("/admin/social-media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    
    const link = await socialMediaService.updateSocialMediaLink(id, req.body);
    res.json(link);
  } catch (error) {
    console.error("Error updating social media link:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update social media link" });
  }
});

router.delete("/admin/social-media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    
    await socialMediaService.deleteSocialMediaLink(id);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting social media link:", error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to delete social media link" });
  }
});

router.patch("/admin/social-media/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    
    const link = await socialMediaService.toggleSocialMediaLinkStatus(id);
    res.json(link);
  } catch (error) {
    console.error("Error toggling social media link:", error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to toggle social media link" });
  }
});

router.put("/admin/social-media/:id/move", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    
    const { direction } = req.body;
    if (!direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ message: "Direction must be 'up' or 'down'" });
    }
    
    const result = await socialMediaService.moveSocialMediaLink(id, direction);
    if (!result) {
      return res.status(400).json({ message: "Cannot move social media link in that direction" });
    }
    res.json({ message: "Social media link moved successfully" });
  } catch (error) {
    console.error("Error moving social media link:", error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to move social media link" });
  }
});

router.post("/admin/social-media/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body;
    
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "OrderedIds array is required" });
    }
    
    await socialMediaService.reorderAllSocialMediaLinks(orderedIds);
    res.json({ message: "Social media links reordered successfully" });
  } catch (error) {
    console.error("Error reordering social media links:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to reorder social media links" });
  }
});

router.post("/admin/social-media/bulk-update", async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: "Updates array is required" });
    }
    
    const result = await socialMediaService.performBulkSocialMediaLinkUpdates(updates);
    
    if (result.failed > 0) {
      return res.status(207).json({
        message: `Bulk update completed with some failures`,
        ...result
      });
    }
    
    res.json({
      message: `Successfully updated ${result.success} social media links`,
      ...result
    });
  } catch (error) {
    console.error("Error bulk updating social media links:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to bulk update social media links" });
  }
});

router.post("/admin/social-media/bulk-action", async (req, res) => {
  try {
    const { linkIds, action } = req.body;
    
    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({ message: "Link IDs array is required" });
    }
    
    if (!action || !['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: "Action must be 'activate', 'deactivate', or 'delete'" });
    }
    
    const result = await socialMediaService.performBulkSocialMediaLinkAction(linkIds, action);
    
    if (result.failed > 0) {
      return res.status(207).json({
        message: `Bulk action completed with some failures`,
        ...result
      });
    }
    
    res.json({
      message: `Successfully ${action}d ${result.success} social media links`,
      ...result
    });
  } catch (error) {
    console.error("Error performing bulk social media action:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to perform bulk action" });
  }
});

export default router;