import { Router } from "express";
import * as pageService from "../services/page.service";

const router = Router();

// Page Management APIs - Public endpoints
router.get("/pages", async (req, res) => {
  try {
    const { status } = req.query;
    const pages = await pageService.getPages(status as string);
    res.json(pages);
  } catch (error) {
    console.error("Error in pages route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pages";
    res.status(500).json({ message });
  }
});

router.get("/pages/:slug", async (req, res) => {
  try {
    const page = await pageService.getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    console.error("Error in page by slug route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch page";
    res.status(400).json({ message });
  }
});

// Page Management APIs - Admin endpoints
router.post("/admin/pages", async (req, res) => {
  try {
    const page = await pageService.createPage(req.body);
    res.status(201).json(page);
  } catch (error) {
    console.error("Error in create page route:", error);
    const message = error instanceof Error ? error.message : "Failed to create page";
    res.status(400).json({ message });
  }
});

router.put("/admin/pages/:id", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    
    const page = await pageService.updatePage(pageId, req.body);
    res.json(page);
  } catch (error) {
    console.error("Error in update page route:", error);
    const message = error instanceof Error ? error.message : "Failed to update page";
    const statusCode = message === "Page not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});

router.delete("/admin/pages/:id", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    
    await pageService.deletePage(pageId);
    res.status(204).send();
  } catch (error) {
    console.error("Error in delete page route:", error);
    const message = error instanceof Error ? error.message : "Failed to delete page";
    const statusCode = message === "Page not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});

router.post("/admin/pages/:id/publish", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    
    const { authorId } = req.body;
    const page = await pageService.publishPage(pageId, authorId);
    res.json(page);
  } catch (error) {
    console.error("Error in publish page route:", error);
    const message = error instanceof Error ? error.message : "Failed to publish page";
    const statusCode = message === "Page not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});

// Additional admin endpoints for comprehensive page management
router.post("/admin/pages/:id/unpublish", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    
    const { authorId } = req.body;
    const page = await pageService.unpublishPage(pageId, authorId);
    res.json(page);
  } catch (error) {
    console.error("Error in unpublish page route:", error);
    const message = error instanceof Error ? error.message : "Failed to unpublish page";
    const statusCode = message === "Page not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});

router.get("/admin/pages/:id", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    
    const page = await pageService.getPageById(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    console.error("Error in get page by ID route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch page";
    res.status(400).json({ message });
  }
});

export default router;