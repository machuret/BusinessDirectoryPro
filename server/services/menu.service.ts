/**
 * Menu Management Service Layer
 * Handles business logic for menu items including CRUD operations and complex reordering
 */

import { storage } from '../storage';
import type { MenuItem, InsertMenuItem } from '@shared/schema';

/**
 * Validates menu item creation data
 * @param menuItemData - The menu item data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateMenuItemCreation(menuItemData: any): { isValid: boolean; error?: string } {
  console.log('[MENU SERVICE] Validating menu item creation:', { name: menuItemData.name, position: menuItemData.position });

  if (!menuItemData.name || typeof menuItemData.name !== 'string' || menuItemData.name.trim().length === 0) {
    return { isValid: false, error: 'Menu item name is required' };
  }

  if (!menuItemData.url || typeof menuItemData.url !== 'string' || menuItemData.url.trim().length === 0) {
    return { isValid: false, error: 'Menu item URL is required' };
  }

  if (!menuItemData.position || typeof menuItemData.position !== 'string') {
    return { isValid: false, error: 'Menu item position is required' };
  }

  const validPositions = ['header', 'footer', 'footer1', 'footer2'];
  if (!validPositions.includes(menuItemData.position)) {
    return { isValid: false, error: `Invalid position. Must be one of: ${validPositions.join(', ')}`};
  }

  const validTargets = ['_self', '_blank'];
  if (menuItemData.target && !validTargets.includes(menuItemData.target)) {
    return { isValid: false, error: `Invalid target. Must be one of: ${validTargets.join(', ')}`};
  }

  return { isValid: true };
}

/**
 * Validates menu item update data
 * @param menuItemData - The menu item data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateMenuItemUpdate(menuItemData: any): { isValid: boolean; error?: string } {
  console.log('[MENU SERVICE] Validating menu item update:', { updates: Object.keys(menuItemData) });

  if (menuItemData.name !== undefined) {
    if (typeof menuItemData.name !== 'string' || menuItemData.name.trim().length === 0) {
      return { isValid: false, error: 'Menu item name must be a non-empty string' };
    }
  }

  if (menuItemData.url !== undefined) {
    if (typeof menuItemData.url !== 'string' || menuItemData.url.trim().length === 0) {
      return { isValid: false, error: 'Menu item URL must be a non-empty string' };
    }
  }

  if (menuItemData.position !== undefined) {
    const validPositions = ['header', 'footer', 'footer1', 'footer2'];
    if (!validPositions.includes(menuItemData.position)) {
      return { isValid: false, error: `Invalid position. Must be one of: ${validPositions.join(', ')}`};
    }
  }

  if (menuItemData.target !== undefined) {
    const validTargets = ['_self', '_blank'];
    if (!validTargets.includes(menuItemData.target)) {
      return { isValid: false, error: `Invalid target. Must be one of: ${validTargets.join(', ')}`};
    }
  }

  if (menuItemData.order !== undefined) {
    if (typeof menuItemData.order !== 'number' || menuItemData.order < 0) {
      return { isValid: false, error: 'Order must be a non-negative number' };
    }
  }

  return { isValid: true };
}

/**
 * Creates a new menu item with validation and proper ordering
 * @param menuItemData - The menu item data
 * @returns Promise with the created menu item
 */
export async function createMenuItem(menuItemData: any): Promise<MenuItem> {
  console.log('[MENU SERVICE] Creating new menu item:', { name: menuItemData.name, position: menuItemData.position });

  // Validate input data
  const validation = validateMenuItemCreation(menuItemData);
  if (!validation.isValid) {
    console.log('[MENU SERVICE] Validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Get the next order number for this position
    const existingItems = await storage.getMenuItems(menuItemData.position);
    const maxOrder = existingItems.length > 0 ? Math.max(...existingItems.map(item => item.order)) : 0;

    // Prepare menu item data with proper ordering
    const createData: InsertMenuItem = {
      name: menuItemData.name.trim(),
      url: menuItemData.url.trim(),
      position: menuItemData.position,
      order: menuItemData.order !== undefined ? menuItemData.order : maxOrder + 1,
      isActive: menuItemData.isActive !== undefined ? menuItemData.isActive : true,
      target: menuItemData.target || '_self'
    };

    const menuItem = await storage.createMenuItem(createData);
    console.log('[MENU SERVICE] Successfully created menu item:', {
      id: menuItem.id,
      name: menuItem.name,
      position: menuItem.position,
      order: menuItem.order
    });

    return menuItem;
  } catch (error) {
    console.log('[MENU SERVICE] Error creating menu item:', error.message);
    throw new Error(`Failed to create menu item: ${error.message}`);
  }
}

/**
 * Updates an existing menu item with validation
 * @param menuItemId - The menu item ID to update
 * @param menuItemData - The partial menu item data to update
 * @returns Promise with the updated menu item
 */
export async function updateMenuItem(menuItemId: number, menuItemData: any): Promise<MenuItem> {
  console.log('[MENU SERVICE] Updating menu item:', { id: menuItemId, updates: Object.keys(menuItemData) });

  // Validate input data
  const validation = validateMenuItemUpdate(menuItemData);
  if (!validation.isValid) {
    console.log('[MENU SERVICE] Validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Check if menu item exists
    const existingItem = await storage.getMenuItemById?.(menuItemId);
    if (!existingItem) {
      throw new Error('Menu item not found');
    }

    // Prepare update data
    const updateData: Partial<InsertMenuItem> = {};
    
    if (menuItemData.name !== undefined) updateData.name = menuItemData.name.trim();
    if (menuItemData.url !== undefined) updateData.url = menuItemData.url.trim();
    if (menuItemData.position !== undefined) updateData.position = menuItemData.position;
    if (menuItemData.order !== undefined) updateData.order = menuItemData.order;
    if (menuItemData.isActive !== undefined) updateData.isActive = menuItemData.isActive;
    if (menuItemData.target !== undefined) updateData.target = menuItemData.target;

    const updatedMenuItem = await storage.updateMenuItem(menuItemId, updateData);
    console.log('[MENU SERVICE] Successfully updated menu item:', {
      id: updatedMenuItem.id,
      name: updatedMenuItem.name,
      position: updatedMenuItem.position
    });

    return updatedMenuItem;
  } catch (error) {
    console.log('[MENU SERVICE] Error updating menu item:', error.message);
    throw new Error(`Failed to update menu item: ${error.message}`);
  }
}

/**
 * Deletes a menu item with proper cleanup
 * @param menuItemId - The menu item ID to delete
 * @returns Promise that resolves when menu item is deleted
 */
export async function deleteMenuItem(menuItemId: number): Promise<void> {
  console.log('[MENU SERVICE] Deleting menu item:', { id: menuItemId });

  try {
    // Check if menu item exists
    const existingItem = await storage.getMenuItemById?.(menuItemId);
    if (!existingItem) {
      throw new Error('Menu item not found');
    }

    await storage.deleteMenuItem(menuItemId);
    console.log('[MENU SERVICE] Successfully deleted menu item:', { id: menuItemId, name: existingItem.name });

    // Reorder remaining items in the same position to close gaps
    const remainingItems = await storage.getMenuItems(existingItem.position);
    if (remainingItems.length > 0) {
      await reorderMenuItemsInPosition(existingItem.position, remainingItems.map(item => item.id));
    }
  } catch (error) {
    console.log('[MENU SERVICE] Error deleting menu item:', error.message);
    throw new Error(`Failed to delete menu item: ${error.message}`);
  }
}

/**
 * Reorders menu items within a specific position
 * @param position - The position to reorder items in
 * @param orderedIds - Array of menu item IDs in their new order
 * @returns Promise that resolves when reordering is complete
 */
export async function reorderMenuItemsInPosition(position: string, orderedIds: number[]): Promise<void> {
  console.log('[MENU SERVICE] Reordering menu items in position:', { position, itemCount: orderedIds.length });

  if (!orderedIds || orderedIds.length === 0) {
    throw new Error('Ordered IDs array is required');
  }

  const validPositions = ['header', 'footer', 'footer1', 'footer2'];
  if (!validPositions.includes(position)) {
    throw new Error(`Invalid position. Must be one of: ${validPositions.join(', ')}`);
  }

  try {
    // Update order for each menu item
    for (let i = 0; i < orderedIds.length; i++) {
      const menuItemId = orderedIds[i];
      const newOrder = i + 1;
      
      await storage.updateMenuItem(menuItemId, { order: newOrder });
    }

    console.log('[MENU SERVICE] Successfully reordered menu items in position:', { position, itemCount: orderedIds.length });
  } catch (error) {
    console.log('[MENU SERVICE] Error reordering menu items:', error.message);
    throw new Error(`Failed to reorder menu items: ${error.message}`);
  }
}

/**
 * Moves a menu item up or down within its position
 * @param menuItemId - The menu item ID to move
 * @param direction - Direction to move ('up' or 'down')
 * @returns Promise with boolean indicating if reorder was successful
 */
export async function moveMenuItem(menuItemId: number, direction: 'up' | 'down'): Promise<boolean> {
  console.log('[MENU SERVICE] Moving menu item:', { id: menuItemId, direction });

  if (!['up', 'down'].includes(direction)) {
    throw new Error('Direction must be "up" or "down"');
  }

  try {
    // Get the current menu item
    const currentItem = await storage.getMenuItemById?.(menuItemId);
    if (!currentItem) {
      throw new Error('Menu item not found');
    }

    // Get all items in the same position
    const allItems = await storage.getMenuItems(currentItem.position);
    const sortedItems = allItems.sort((a, b) => a.order - b.order);

    // Find current item index
    const currentIndex = sortedItems.findIndex(item => item.id === menuItemId);
    if (currentIndex === -1) {
      throw new Error('Menu item not found in position');
    }

    // Check if move is possible
    if (direction === 'up' && currentIndex === 0) {
      console.log('[MENU SERVICE] Cannot move up: already at top');
      return false;
    }
    if (direction === 'down' && currentIndex === sortedItems.length - 1) {
      console.log('[MENU SERVICE] Cannot move down: already at bottom');
      return false;
    }

    // Calculate new positions
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentOrder = sortedItems[currentIndex].order;
    const swapOrder = sortedItems[swapIndex].order;

    // Swap the orders
    await storage.updateMenuItem(sortedItems[currentIndex].id, { order: swapOrder });
    await storage.updateMenuItem(sortedItems[swapIndex].id, { order: currentOrder });

    console.log('[MENU SERVICE] Successfully moved menu item:', { 
      id: menuItemId, 
      direction, 
      newOrder: swapOrder 
    });

    return true;
  } catch (error) {
    console.log('[MENU SERVICE] Error moving menu item:', error.message);
    throw new Error(`Failed to move menu item: ${error.message}`);
  }
}

/**
 * Gets all menu items with optional position filtering
 * @param position - Optional position filter
 * @returns Promise with array of menu items
 */
export async function getAllMenuItems(position?: string): Promise<MenuItem[]> {
  console.log('[MENU SERVICE] Retrieved menu items:', { position: position || 'all' });

  try {
    const menuItems = await storage.getMenuItems(position);
    console.log('[MENU SERVICE] Retrieved menu items:', { count: menuItems.length, position: position || 'all' });
    return menuItems;
  } catch (error) {
    console.log('[MENU SERVICE] Error retrieving menu items:', error.message);
    throw new Error(`Failed to retrieve menu items: ${error.message}`);
  }
}

/**
 * Gets a single menu item by ID
 * @param menuItemId - The menu item ID to retrieve
 * @returns Promise with the menu item or undefined if not found
 */
export async function getMenuItemById(menuItemId: number): Promise<MenuItem | undefined> {
  console.log('[MENU SERVICE] Retrieving menu item by ID:', { id: menuItemId });

  try {
    const menuItem = await storage.getMenuItemById?.(menuItemId);
    if (menuItem) {
      console.log('[MENU SERVICE] Retrieved menu item:', { id: menuItem.id, name: menuItem.name });
    } else {
      console.log('[MENU SERVICE] Menu item not found by ID:', { id: menuItemId });
    }
    return menuItem;
  } catch (error) {
    console.log('[MENU SERVICE] Error retrieving menu item by ID:', error.message);
    throw new Error(`Failed to retrieve menu item: ${error.message}`);
  }
}

/**
 * Toggles the active status of a menu item
 * @param menuItemId - The menu item ID to toggle
 * @returns Promise with the updated menu item
 */
export async function toggleMenuItemStatus(menuItemId: number): Promise<MenuItem> {
  console.log('[MENU SERVICE] Toggling menu item status:', { id: menuItemId });

  try {
    const existingItem = await storage.getMenuItemById?.(menuItemId);
    if (!existingItem) {
      throw new Error('Menu item not found');
    }

    const updatedMenuItem = await storage.updateMenuItem(menuItemId, { 
      isActive: !existingItem.isActive 
    });

    console.log('[MENU SERVICE] Toggled menu item status:', {
      id: menuItemId,
      newStatus: updatedMenuItem.isActive ? 'active' : 'inactive'
    });

    return updatedMenuItem;
  } catch (error) {
    console.log('[MENU SERVICE] Error toggling menu item status:', error.message);
    throw new Error(`Failed to toggle menu item status: ${error.message}`);
  }
}

/**
 * Performs bulk operations on multiple menu items
 * @param menuItemIds - Array of menu item IDs to operate on
 * @param action - The action to perform ('activate', 'deactivate', 'delete')
 * @returns Promise with summary of actions performed
 */
export async function performBulkMenuItemAction(
  menuItemIds: number[], 
  action: 'activate' | 'deactivate' | 'delete' | 'activate-all'
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[MENU SERVICE] Performing bulk menu item action:', { action, itemCount: menuItemIds.length });

  if (action === 'activate-all') {
    // Special case: activate all menu items
    try {
      const allItems = await storage.getMenuItems();
      let successCount = 0;
      for (const item of allItems) {
        if (!item.isActive) {
          await storage.updateMenuItem(item.id, { isActive: true });
          successCount++;
        }
      }
      console.log('[MENU SERVICE] Activated all menu items:', { count: successCount });
      return { success: successCount, failed: 0, errors: [] };
    } catch (error) {
      console.log('[MENU SERVICE] Error activating all menu items:', error.message);
      return { success: 0, failed: 1, errors: [error.message] };
    }
  }

  if (!menuItemIds || menuItemIds.length === 0) {
    throw new Error('Menu item IDs array is required');
  }

  if (!['activate', 'deactivate', 'delete'].includes(action)) {
    throw new Error('Invalid action. Must be activate, deactivate, delete, or activate-all');
  }

  const result = { success: 0, failed: 0, errors: [] };

  for (const menuItemId of menuItemIds) {
    try {
      switch (action) {
        case 'activate':
          await storage.updateMenuItem(menuItemId, { isActive: true });
          break;
        case 'deactivate':
          await storage.updateMenuItem(menuItemId, { isActive: false });
          break;
        case 'delete':
          await storage.deleteMenuItem(menuItemId);
          break;
      }
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push(`MenuItem ${menuItemId}: ${error.message}`);
    }
  }

  console.log('[MENU SERVICE] Bulk action completed:', { action, ...result });
  return result;
}