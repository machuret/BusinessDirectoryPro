import { Router } from "express";
import * as menuService from "../services/menu.service";

const router = Router();

// Menu Items API - Public endpoints
router.get("/menu-items", async (req, res) => {
  try {
    const { position, location } = req.query;
    const filterPosition = position || location; // Support both parameters
    const menuItems = await menuService.getAllMenuItems(filterPosition as string);
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});

router.get("/menu-items/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const menuItems = await menuService.getAllMenuItems(location);
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items by location:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});

// Menu Management APIs - Admin endpoints
router.post("/admin/menu-items", async (req, res) => {
  try {
    const menuItem = await menuService.createMenuItem(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create menu item" });
  }
});

router.get("/admin/menu-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    
    const menuItem = await menuService.getMenuItemById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({ message: "Failed to fetch menu item" });
  }
});

router.put("/admin/menu-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    
    const menuItem = await menuService.updateMenuItem(id, req.body);
    res.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update menu item" });
  }
});

router.delete("/admin/menu-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    
    await menuService.deleteMenuItem(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting menu item:", error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to delete menu item" });
  }
});

router.patch("/admin/menu-items/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    
    const menuItem = await menuService.toggleMenuItemStatus(id);
    res.json(menuItem);
  } catch (error) {
    console.error("Error toggling menu item:", error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to toggle menu item" });
  }
});

router.put("/admin/menu-items/:id/move", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    
    const { direction } = req.body;
    if (!direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ message: "Direction must be 'up' or 'down'" });
    }
    
    const result = await menuService.moveMenuItem(id, direction);
    if (!result) {
      return res.status(400).json({ message: "Cannot move menu item in that direction" });
    }
    res.json({ message: "Menu item moved successfully" });
  } catch (error) {
    console.error("Error moving menu item:", error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to move menu item" });
  }
});

router.post("/admin/menu-items/reorder", async (req, res) => {
  try {
    const { position, orderedIds } = req.body;
    
    if (!position || !orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "Position and orderedIds array are required" });
    }
    
    await menuService.reorderMenuItemsInPosition(position, orderedIds);
    res.json({ message: "Menu items reordered successfully" });
  } catch (error) {
    console.error("Error reordering menu items:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to reorder menu items" });
  }
});

router.post("/admin/menu-items/bulk-action", async (req, res) => {
  try {
    const { menuItemIds, action } = req.body;
    
    if (!menuItemIds || !Array.isArray(menuItemIds) || menuItemIds.length === 0) {
      return res.status(400).json({ message: "Menu item IDs array is required" });
    }
    
    if (!action || !['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: "Action must be 'activate', 'deactivate', or 'delete'" });
    }
    
    const result = await menuService.performBulkMenuItemAction(menuItemIds, action);
    
    if (result.failed > 0) {
      return res.status(207).json({
        message: `Bulk action completed with some failures`,
        ...result
      });
    }
    
    res.json({
      message: `Successfully ${action}d ${result.success} menu items`,
      ...result
    });
  } catch (error) {
    console.error("Error performing bulk menu item action:", error);
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to perform bulk action" });
  }
});

export default router;