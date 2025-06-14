import { Router } from "express";
import { z } from "zod";
import { isAuthenticated, isAdmin } from "../auth";
import { storage } from "../storage";
import { insertContentStringSchema } from "@shared/schema";
import type { Request, Response } from "express";

export const contentRouter = Router();

/**
 * Public endpoint - Get content strings for frontend
 * Supports language selection and category filtering
 * 
 * Query parameters:
 * - language: Language code (default: "en")
 * - category: Filter by category (optional)
 */
contentRouter.get("/api/content/strings", async (req: Request, res: Response) => {
  try {
    const { language = "en", category } = req.query;
    
    const contentStrings = await storage.getContentStrings({
      language: language as string,
      category: category as string | undefined
    });
    
    res.json(contentStrings);
  } catch (error) {
    console.error("Error fetching content strings:", error);
    res.status(500).json({ 
      error: "Failed to fetch content strings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Admin endpoint - Get all content strings with metadata
 * Returns full content string objects for admin management
 */
contentRouter.get("/api/admin/content/strings", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const contentStrings = await storage.getAllContentStrings(category as string | undefined);
    
    res.json(contentStrings);
  } catch (error) {
    console.error("Error fetching admin content strings:", error);
    res.status(500).json({ 
      error: "Failed to fetch content strings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Admin endpoint - Update a content string
 * Allows updating translations, default value, and metadata
 */
contentRouter.put("/api/admin/content/strings/:stringKey", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { stringKey } = req.params;
    const updateData = req.body;
    
    // Validate input data
    const validationSchema = z.object({
      defaultValue: z.string().optional(),
      translations: z.record(z.string(), z.string()).optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      isHtml: z.boolean().optional()
    });
    
    const validatedData = validationSchema.parse(updateData);
    
    const updatedString = await storage.updateContentString(stringKey, {
      ...validatedData,
      updatedAt: new Date()
    });
    
    if (!updatedString) {
      return res.status(404).json({ error: "Content string not found" });
    }
    
    res.json(updatedString);
  } catch (error) {
    console.error("Error updating content string:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid input data",
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      error: "Failed to update content string",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Admin endpoint - Create a new content string
 */
contentRouter.post("/api/admin/content/strings", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = insertContentStringSchema.parse(req.body);
    
    const newString = await storage.createContentString(validatedData);
    
    res.status(201).json(newString);
  } catch (error) {
    console.error("Error creating content string:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid input data",
        details: error.errors
      });
    }
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return res.status(409).json({ 
        error: "Content string key already exists"
      });
    }
    
    res.status(500).json({ 
      error: "Failed to create content string",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Admin endpoint - Delete a content string
 */
contentRouter.delete("/api/admin/content/strings/:stringKey", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { stringKey } = req.params;
    
    const deleted = await storage.deleteContentString(stringKey);
    
    if (!deleted) {
      return res.status(404).json({ error: "Content string not found" });
    }
    
    res.json({ success: true, message: "Content string deleted successfully" });
  } catch (error) {
    console.error("Error deleting content string:", error);
    res.status(500).json({ 
      error: "Failed to delete content string",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Admin endpoint - Bulk update content strings
 * Updates multiple content string values at once from the Content Editor
 */
contentRouter.put("/api/admin/content/strings", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: "Invalid request body" });
    }
    
    // Convert the updates object to an array of content string updates
    const updatePromises = Object.entries(updates).map(async ([key, value]) => {
      return await storage.updateContentString(key, { 
        defaultValue: value as string,
        updatedAt: new Date()
      });
    });
    
    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r !== undefined).length;
    
    res.json({ 
      success: true, 
      updated: successCount,
      message: `Successfully updated ${successCount} content strings`
    });
  } catch (error) {
    console.error("Error bulk updating content strings:", error);
    res.status(500).json({ 
      error: "Failed to update content strings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Admin endpoint - Bulk upsert content strings
 * Useful for importing content strings or batch updates
 */
contentRouter.post("/api/admin/content/strings/bulk", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { strings } = req.body;
    
    if (!Array.isArray(strings)) {
      return res.status(400).json({ error: "Expected 'strings' to be an array" });
    }
    
    // Validate each string
    const validatedStrings = strings.map(str => insertContentStringSchema.parse(str));
    
    const results = await storage.bulkUpsertContentStrings(validatedStrings);
    
    res.json({ 
      success: true, 
      imported: results.length,
      strings: results
    });
  } catch (error) {
    console.error("Error bulk importing content strings:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid input data",
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      error: "Failed to bulk import content strings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Admin endpoint - Get content string categories
 * Returns list of all categories used in content strings
 */
contentRouter.get("/api/admin/content/categories", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const categories = await storage.getContentStringCategories();
    
    res.json(categories);
  } catch (error) {
    console.error("Error fetching content categories:", error);
    res.status(500).json({ 
      error: "Failed to fetch content categories",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Admin endpoint - Get content string statistics
 * Returns metadata about content strings for admin dashboard
 */
contentRouter.get("/api/admin/content/stats", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await storage.getContentStringStats();
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching content stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch content statistics",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});