import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Menu Items API - Public endpoints
router.get("/menu-items", async (req, res) => {
  try {
    const { location } = req.query;
    const menuItems = await storage.getMenuItems(location as string);
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});

router.get("/menu-items/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const menuItems = await storage.getMenuItems(location);
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items by location:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});

// Menu Management APIs - Admin endpoints
router.post("/admin/menu-items", async (req, res) => {
  try {
    const menuItem = await storage.createMenuItem(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ message: "Failed to create menu item" });
  }
});

router.put("/admin/menu-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const menuItem = await storage.updateMenuItem(id, req.body);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ message: "Failed to update menu item" });
  }
});

router.delete("/admin/menu-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteMenuItem(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Failed to delete menu item" });
  }
});

router.put("/admin/menu-items/:id/reorder", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { direction } = req.body;
    const result = await storage.reorderMenuItem(id, direction);
    if (!result) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({ message: "Menu item reordered successfully" });
  } catch (error) {
    console.error("Error reordering menu item:", error);
    res.status(500).json({ message: "Failed to reorder menu item" });
  }
});

export default router;