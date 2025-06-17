import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// Social Media Management Routes
// Get all social media links
router.get('/', async (req, res) => {
  try {
    const socialMedia = await storage.getSocialMediaLinks(false); // Get all, not just active
    res.json(socialMedia);
  } catch (error) {
    console.error("Error fetching social media links:", error);
    res.status(500).json({ message: "Failed to fetch social media links" });
  }
});

// Create new social media link
router.post('/', async (req, res) => {
  try {
    const socialMediaData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      sortOrder: req.body.sortOrder || 100
    };
    const socialMedia = await storage.createSocialMediaLink(socialMediaData);
    res.status(201).json(socialMedia);
  } catch (error) {
    console.error("Error creating social media link:", error);
    res.status(500).json({ message: "Failed to create social media link" });
  }
});

// Update social media link
router.put('/:id', async (req, res) => {
  try {
    const linkId = parseInt(req.params.id);
    const socialMedia = await storage.updateSocialMediaLink(linkId, req.body);
    
    if (!socialMedia) {
      return res.status(404).json({ message: "Social media link not found" });
    }
    
    res.json(socialMedia);
  } catch (error) {
    console.error("Error updating social media link:", error);
    res.status(500).json({ message: "Failed to update social media link" });
  }
});

// Delete social media link
router.delete('/:id', async (req, res) => {
  try {
    const linkId = parseInt(req.params.id);
    await storage.deleteSocialMediaLink(linkId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting social media link:", error);
    res.status(500).json({ message: "Failed to delete social media link" });
  }
});

// Bulk update social media links
router.patch('/bulk', async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, updates}
    const results = [];
    
    for (const update of updates) {
      const result = await storage.updateSocialMediaLink(update.id, update.updates);
      results.push(result);
    }
    
    res.json({ message: `${updates.length} social media links updated`, results });
  } catch (error) {
    console.error("Error bulk updating social media links:", error);
    res.status(500).json({ message: "Failed to bulk update social media links" });
  }
});

export default router;