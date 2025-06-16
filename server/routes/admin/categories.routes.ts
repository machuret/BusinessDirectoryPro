import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// Category Management Routes
// Create new category
router.post("/", async (req, res) => {
  try {
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = await storage.updateCategory(categoryId, req.body);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    await storage.deleteCategory(categoryId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

export default router;