import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Page Management APIs - Public endpoints
router.get("/pages", async (req, res) => {
  try {
    const { status } = req.query;
    const pages = await storage.getPages(status as string);
    res.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    res.status(500).json({ message: "Failed to fetch pages" });
  }
});

router.get("/pages/:slug", async (req, res) => {
  try {
    const page = await storage.getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    res.status(500).json({ message: "Failed to fetch page" });
  }
});

// Page Management APIs - Admin endpoints
router.post("/admin/pages", async (req, res) => {
  try {
    const page = await storage.createPage(req.body);
    res.status(201).json(page);
  } catch (error) {
    console.error("Error creating page:", error);
    res.status(500).json({ message: "Failed to create page" });
  }
});

router.put("/admin/pages/:id", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    const page = await storage.updatePage(pageId, req.body);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ message: "Failed to update page" });
  }
});

router.delete("/admin/pages/:id", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    await storage.deletePage(pageId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ message: "Failed to delete page" });
  }
});

router.post("/admin/pages/:id/publish", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    const page = await storage.publishPage(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    console.error("Error publishing page:", error);
    res.status(500).json({ message: "Failed to publish page" });
  }
});

export default router;