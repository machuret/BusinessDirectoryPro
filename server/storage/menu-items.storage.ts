import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { 
  menuItems,
  type MenuItem,
  type InsertMenuItem
} from "@shared/schema";

/**
 * Menu Items Storage Implementation
 * Handles CRUD operations for navigation menu management
 */
export class MenuItemsStorage {
  /**
   * Get menu items with optional position filtering
   */
  async getMenuItems(position?: string): Promise<MenuItem[]> {
    try {
      let query = db.select().from(menuItems);
      
      if (position) {
        query = query.where(eq(menuItems.position, position));
      }
      
      const results = await query.orderBy(menuItems.order, menuItems.name);
      return results;
    } catch (error) {
      console.error("Error fetching menu items:", error);
      return [];
    }
  }

  /**
   * Get menu item by ID
   */
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    try {
      const [result] = await db.select().from(menuItems).where(eq(menuItems.id, id));
      return result;
    } catch (error) {
      console.error("Error fetching menu item:", error);
      return undefined;
    }
  }

  /**
   * Get menu item by ID (alias for consistency)
   */
  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    return this.getMenuItem(id);
  }

  /**
   * Create a new menu item with automatic ordering
   */
  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    try {
      // Get next order number for the position
      const maxOrder = await db.select({ maxOrder: sql<number>`COALESCE(MAX("order"), 0)` })
        .from(menuItems)
        .where(eq(menuItems.position, menuItem.position || 'header'));
      
      const newOrder = Number(maxOrder[0]?.maxOrder || 0) + 1;
      
      const [result] = await db.insert(menuItems)
        .values({
          ...menuItem,
          order: newOrder,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error creating menu item:", error);
      throw new Error("Failed to create menu item");
    }
  }

  /**
   * Update menu item
   */
  async updateMenuItem(id: number, updates: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    try {
      const [result] = await db.update(menuItems)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(menuItems.id, id))
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error updating menu item:", error);
      throw new Error("Failed to update menu item");
    }
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(id: number): Promise<void> {
    try {
      await db.delete(menuItems).where(eq(menuItems.id, id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
      throw new Error("Failed to delete menu item");
    }
  }

  /**
   * Get menu items by position
   */
  async getMenuItemsByPosition(position: string): Promise<MenuItem[]> {
    try {
      return await db.select()
        .from(menuItems)
        .where(eq(menuItems.position, position))
        .orderBy(menuItems.order, menuItems.name);
    } catch (error) {
      console.error("Error fetching menu items by position:", error);
      return [];
    }
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(orderedIds: number[]): Promise<void> {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.update(menuItems)
          .set({ 
            order: i + 1,
            updatedAt: new Date()
          })
          .where(eq(menuItems.id, orderedIds[i]));
      }
    } catch (error) {
      console.error("Error reordering menu items:", error);
      throw new Error("Failed to reorder menu items");
    }
  }

  /**
   * Toggle menu item active status
   */
  async toggleMenuItemStatus(id: number): Promise<MenuItem | undefined> {
    try {
      const existingItem = await this.getMenuItem(id);
      if (!existingItem) {
        throw new Error('Menu item not found');
      }

      const [result] = await db.update(menuItems)
        .set({ 
          isActive: !existingItem.isActive,
          updatedAt: new Date()
        })
        .where(eq(menuItems.id, id))
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error toggling menu item status:", error);
      throw new Error("Failed to toggle menu item status");
    }
  }

  /**
   * Get menu positions with counts
   */
  async getMenuPositions(): Promise<Array<{ position: string; count: number }>> {
    try {
      const results = await db.select({ 
        position: menuItems.position,
        count: sql<number>`COUNT(*)`
      })
        .from(menuItems)
        .groupBy(menuItems.position)
        .orderBy(menuItems.position);
      
      return results.map(r => ({
        position: r.position,
        count: Number(r.count)
      }));
    } catch (error) {
      console.error("Error fetching menu positions:", error);
      return [];
    }
  }

  /**
   * Bulk update menu items
   */
  async bulkUpdateMenuItems(
    updates: Array<{ id: number; data: Partial<InsertMenuItem> }>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const result = { success: 0, failed: 0, errors: [] as string[] };
    
    for (const update of updates) {
      try {
        await this.updateMenuItem(update.id, update.data);
        result.success++;
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push(`Menu item ${update.id}: ${errorMessage}`);
      }
    }
    
    return result;
  }
}

// Export singleton instance
export const menuItemsStorage = new MenuItemsStorage();