import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Social Media Management APIs
router.get("/social-media", async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const links = await storage.getSocialMediaLinks(activeOnly);
    res.json(links);
  } catch (error) {
    console.error("Error fetching social media links:", error);
    res.status(500).json({ message: "Failed to fetch social media links" });
  }
});

router.get("/admin/social-media", async (req, res) => {
  try {
    const links = await storage.getSocialMediaLinks();
    res.json(links);
  } catch (error) {
    console.error("Error fetching all social media links:", error);
    res.status(500).json({ message: "Failed to fetch social media links" });
  }
});

router.post("/admin/social-media", async (req, res) => {
  try {
    const link = await storage.createSocialMediaLink(req.body);
    res.status(201).json(link);
  } catch (error) {
    console.error("Error creating social media link:", error);
    res.status(500).json({ message: "Failed to create social media link" });
  }
});

router.put("/admin/social-media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const link = await storage.updateSocialMediaLink(id, req.body);
    if (!link) {
      return res.status(404).json({ message: "Social media link not found" });
    }
    res.json(link);
  } catch (error) {
    console.error("Error updating social media link:", error);
    res.status(500).json({ message: "Failed to update social media link" });
  }
});

router.delete("/admin/social-media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteSocialMediaLink(id);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting social media link:", error);
    res.status(500).json({ message: "Failed to delete social media link" });
  }
});

router.patch("/admin/social-media/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const link = await storage.toggleSocialMediaLink(id);
    if (!link) {
      return res.status(404).json({ message: "Social media link not found" });
    }
    res.json(link);
  } catch (error) {
    console.error("Error toggling social media link:", error);
    res.status(500).json({ message: "Failed to toggle social media link" });
  }
});

router.post("/admin/social-media/reorder", async (req, res) => {
  try {
    const { reorderData } = req.body;
    await storage.reorderSocialMediaLinks(reorderData);
    res.json({ message: "Social media links reordered successfully" });
  } catch (error) {
    console.error("Error reordering social media links:", error);
    res.status(500).json({ message: "Failed to reorder social media links" });
  }
});

router.post("/admin/social-media/bulk-update", async (req, res) => {
  try {
    const { updates } = req.body;
    const updatedLinks = await storage.bulkUpdateSocialMediaLinks(updates);
    res.json(updatedLinks);
  } catch (error) {
    console.error("Error bulk updating social media links:", error);
    res.status(500).json({ message: "Failed to bulk update social media links" });
  }
});

export default router;