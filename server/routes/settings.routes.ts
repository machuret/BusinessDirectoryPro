import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Site Settings API endpoints
router.get("/site-settings", async (req, res) => {
  try {
    const settings = await storage.getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    res.status(500).json({ message: "Failed to fetch site settings" });
  }
});

router.put("/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await storage.updateSiteSetting(key, value);
    res.json(setting);
  } catch (error) {
    console.error("Error updating site setting:", error);
    res.status(500).json({ message: "Failed to update site setting" });
  }
});

// Admin Site Settings API endpoints
router.get("/admin/site-settings", async (req, res) => {
  try {
    const settings = await storage.getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching admin site settings:", error);
    res.status(500).json({ message: "Failed to fetch admin site settings" });
  }
});

router.put("/admin/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, category } = req.body;

    if (!value) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const updatedSetting = await storage.updateSiteSetting(
      key,
      value,
      description,
      category
    );

    res.json(updatedSetting);
  } catch (error) {
    console.error('Error updating site setting:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update setting'
    });
  }
});

router.patch("/admin/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await storage.updateSiteSetting(key, value);
    res.json(setting);
  } catch (error) {
    console.error("Error updating admin site setting:", error);
    res.status(500).json({ message: "Failed to update admin site setting" });
  }
});

export default router;