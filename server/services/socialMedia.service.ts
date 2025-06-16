/**
 * Social Media Management Service Layer
 * Handles business logic for social media links including CRUD operations, ordering, and validation
 */

import { storage } from '../storage';
import type { SocialMediaLink, InsertSocialMediaLink } from '@shared/schema';

/**
 * Validates social media link creation data
 * @param linkData - The social media link data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateSocialMediaLinkCreation(linkData: any): { isValid: boolean; error?: string } {
  console.log('[SOCIAL MEDIA SERVICE] Validating social media link creation:', { platform: linkData.platform });

  if (!linkData.platform || typeof linkData.platform !== 'string' || linkData.platform.trim().length === 0) {
    return { isValid: false, error: 'Platform is required' };
  }

  if (!linkData.url || typeof linkData.url !== 'string' || linkData.url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  // Basic URL validation
  try {
    new URL(linkData.url);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  if (!linkData.displayName || typeof linkData.displayName !== 'string' || linkData.displayName.trim().length === 0) {
    return { isValid: false, error: 'Display name is required' };
  }

  if (!linkData.iconClass || typeof linkData.iconClass !== 'string' || linkData.iconClass.trim().length === 0) {
    return { isValid: false, error: 'Icon class is required' };
  }

  const validPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat', 'whatsapp'];
  if (!validPlatforms.includes(linkData.platform.toLowerCase())) {
    return { isValid: false, error: `Invalid platform. Supported platforms: ${validPlatforms.join(', ')}` };
  }

  if (linkData.sortOrder !== undefined) {
    if (typeof linkData.sortOrder !== 'number' || linkData.sortOrder < 0) {
      return { isValid: false, error: 'Sort order must be a non-negative number' };
    }
  }

  return { isValid: true };
}

/**
 * Validates social media link update data
 * @param linkData - The social media link data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateSocialMediaLinkUpdate(linkData: any): { isValid: boolean; error?: string } {
  console.log('[SOCIAL MEDIA SERVICE] Validating social media link update:', { updates: Object.keys(linkData) });

  if (linkData.platform !== undefined) {
    if (typeof linkData.platform !== 'string' || linkData.platform.trim().length === 0) {
      return { isValid: false, error: 'Platform must be a non-empty string' };
    }
    
    const validPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat', 'whatsapp'];
    if (!validPlatforms.includes(linkData.platform.toLowerCase())) {
      return { isValid: false, error: `Invalid platform. Supported platforms: ${validPlatforms.join(', ')}` };
    }
  }

  if (linkData.url !== undefined) {
    if (typeof linkData.url !== 'string' || linkData.url.trim().length === 0) {
      return { isValid: false, error: 'URL must be a non-empty string' };
    }
    
    try {
      new URL(linkData.url);
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  if (linkData.displayName !== undefined) {
    if (typeof linkData.displayName !== 'string' || linkData.displayName.trim().length === 0) {
      return { isValid: false, error: 'Display name must be a non-empty string' };
    }
  }

  if (linkData.iconClass !== undefined) {
    if (typeof linkData.iconClass !== 'string' || linkData.iconClass.trim().length === 0) {
      return { isValid: false, error: 'Icon class must be a non-empty string' };
    }
  }

  if (linkData.sortOrder !== undefined) {
    if (typeof linkData.sortOrder !== 'number' || linkData.sortOrder < 0) {
      return { isValid: false, error: 'Sort order must be a non-negative number' };
    }
  }

  return { isValid: true };
}

/**
 * Creates a new social media link with validation and proper ordering
 * @param linkData - The social media link data
 * @returns Promise with the created social media link
 */
export async function createSocialMediaLink(linkData: any): Promise<SocialMediaLink> {
  console.log('[SOCIAL MEDIA SERVICE] Creating new social media link:', { platform: linkData.platform });

  // Validate input data
  const validation = validateSocialMediaLinkCreation(linkData);
  if (!validation.isValid) {
    console.log('[SOCIAL MEDIA SERVICE] Validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Check for duplicate platform
    const existingLinks = await storage.getSocialMediaLinks();
    const duplicatePlatform = existingLinks.find(link => 
      link.platform.toLowerCase() === linkData.platform.toLowerCase()
    );
    
    if (duplicatePlatform) {
      throw new Error(`A social media link for ${linkData.platform} already exists`);
    }

    // Get the next sort order
    const maxOrder = existingLinks.length > 0 ? Math.max(...existingLinks.map(link => link.sortOrder)) : 0;

    // Prepare social media link data with proper ordering
    const createData: InsertSocialMediaLink = {
      platform: linkData.platform.toLowerCase(),
      url: linkData.url.trim(),
      displayName: linkData.displayName.trim(),
      iconClass: linkData.iconClass.trim(),
      isActive: linkData.isActive !== undefined ? linkData.isActive : true,
      sortOrder: linkData.sortOrder !== undefined ? linkData.sortOrder : maxOrder + 1
    };

    const socialMediaLink = await storage.createSocialMediaLink(createData);
    console.log('[SOCIAL MEDIA SERVICE] Successfully created social media link:', {
      id: socialMediaLink.id,
      platform: socialMediaLink.platform,
      sortOrder: socialMediaLink.sortOrder
    });

    return socialMediaLink;
  } catch (error) {
    console.log('[SOCIAL MEDIA SERVICE] Error creating social media link:', error.message);
    throw new Error(`Failed to create social media link: ${error.message}`);
  }
}

/**
 * Updates an existing social media link with validation
 * @param linkId - The social media link ID to update
 * @param linkData - The partial social media link data to update
 * @returns Promise with the updated social media link
 */
export async function updateSocialMediaLink(linkId: number, linkData: any): Promise<SocialMediaLink> {
  console.log('[SOCIAL MEDIA SERVICE] Updating social media link:', { id: linkId, updates: Object.keys(linkData) });

  // Validate input data
  const validation = validateSocialMediaLinkUpdate(linkData);
  if (!validation.isValid) {
    console.log('[SOCIAL MEDIA SERVICE] Validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Check if social media link exists
    const existingLink = await storage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error('Social media link not found');
    }

    // Check for duplicate platform if platform is being updated
    if (linkData.platform && linkData.platform.toLowerCase() !== existingLink.platform.toLowerCase()) {
      const allLinks = await storage.getSocialMediaLinks();
      const duplicatePlatform = allLinks.find(link => 
        link.id !== linkId && link.platform.toLowerCase() === linkData.platform.toLowerCase()
      );
      
      if (duplicatePlatform) {
        throw new Error(`A social media link for ${linkData.platform} already exists`);
      }
    }

    // Prepare update data
    const updateData: Partial<InsertSocialMediaLink> = {};
    
    if (linkData.platform !== undefined) updateData.platform = linkData.platform.toLowerCase();
    if (linkData.url !== undefined) updateData.url = linkData.url.trim();
    if (linkData.displayName !== undefined) updateData.displayName = linkData.displayName.trim();
    if (linkData.iconClass !== undefined) updateData.iconClass = linkData.iconClass.trim();
    if (linkData.isActive !== undefined) updateData.isActive = linkData.isActive;
    if (linkData.sortOrder !== undefined) updateData.sortOrder = linkData.sortOrder;

    const updatedLink = await storage.updateSocialMediaLink(linkId, updateData);
    console.log('[SOCIAL MEDIA SERVICE] Successfully updated social media link:', {
      id: updatedLink.id,
      platform: updatedLink.platform
    });

    return updatedLink;
  } catch (error) {
    console.log('[SOCIAL MEDIA SERVICE] Error updating social media link:', error.message);
    throw new Error(`Failed to update social media link: ${error.message}`);
  }
}

/**
 * Deletes a social media link with proper cleanup
 * @param linkId - The social media link ID to delete
 * @returns Promise that resolves when social media link is deleted
 */
export async function deleteSocialMediaLink(linkId: number): Promise<void> {
  console.log('[SOCIAL MEDIA SERVICE] Deleting social media link:', { id: linkId });

  try {
    // Check if social media link exists
    const existingLink = await storage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error('Social media link not found');
    }

    await storage.deleteSocialMediaLink(linkId);
    console.log('[SOCIAL MEDIA SERVICE] Successfully deleted social media link:', { 
      id: linkId, 
      platform: existingLink.platform 
    });

    // Reorder remaining links to close gaps
    const remainingLinks = await storage.getSocialMediaLinks();
    if (remainingLinks.length > 0) {
      await reorderAllSocialMediaLinks(remainingLinks.map(link => link.id));
    }
  } catch (error) {
    console.log('[SOCIAL MEDIA SERVICE] Error deleting social media link:', error.message);
    throw new Error(`Failed to delete social media link: ${error.message}`);
  }
}

/**
 * Reorders all social media links based on provided order
 * @param orderedIds - Array of social media link IDs in their new order
 * @returns Promise that resolves when reordering is complete
 */
export async function reorderAllSocialMediaLinks(orderedIds: number[]): Promise<void> {
  console.log('[SOCIAL MEDIA SERVICE] Reordering all social media links:', { linkCount: orderedIds.length });

  if (!orderedIds || orderedIds.length === 0) {
    throw new Error('Ordered IDs array is required');
  }

  try {
    // Update sort order for each social media link
    for (let i = 0; i < orderedIds.length; i++) {
      const linkId = orderedIds[i];
      const newSortOrder = i + 1;
      
      await storage.updateSocialMediaLink(linkId, { sortOrder: newSortOrder });
    }

    console.log('[SOCIAL MEDIA SERVICE] Successfully reordered all social media links:', { linkCount: orderedIds.length });
  } catch (error) {
    console.log('[SOCIAL MEDIA SERVICE] Error reordering social media links:', error.message);
    throw new Error(`Failed to reorder social media links: ${error.message}`);
  }
}

/**
 * Moves a social media link up or down in the ordering
 * @param linkId - The social media link ID to move
 * @param direction - Direction to move ('up' or 'down')
 * @returns Promise with boolean indicating if reorder was successful
 */
export async function moveSocialMediaLink(linkId: number, direction: 'up' | 'down'): Promise<boolean> {
  console.log('[SOCIAL MEDIA SERVICE] Moving social media link:', { id: linkId, direction });

  if (!['up', 'down'].includes(direction)) {
    throw new Error('Direction must be "up" or "down"');
  }

  try {
    // Get the current social media link
    const currentLink = await storage.getSocialMediaLink?.(linkId);
    if (!currentLink) {
      throw new Error('Social media link not found');
    }

    // Get all links sorted by order
    const allLinks = await storage.getSocialMediaLinks();
    const sortedLinks = allLinks.sort((a, b) => a.sortOrder - b.sortOrder);

    // Find current link index
    const currentIndex = sortedLinks.findIndex(link => link.id === linkId);
    if (currentIndex === -1) {
      throw new Error('Social media link not found in list');
    }

    // Check if move is possible
    if (direction === 'up' && currentIndex === 0) {
      console.log('[SOCIAL MEDIA SERVICE] Cannot move up: already at top');
      return false;
    }
    if (direction === 'down' && currentIndex === sortedLinks.length - 1) {
      console.log('[SOCIAL MEDIA SERVICE] Cannot move down: already at bottom');
      return false;
    }

    // Calculate new positions
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentOrder = sortedLinks[currentIndex].sortOrder;
    const swapOrder = sortedLinks[swapIndex].sortOrder;

    // Swap the orders
    await storage.updateSocialMediaLink(sortedLinks[currentIndex].id, { sortOrder: swapOrder });
    await storage.updateSocialMediaLink(sortedLinks[swapIndex].id, { sortOrder: currentOrder });

    console.log('[SOCIAL MEDIA SERVICE] Successfully moved social media link:', { 
      id: linkId, 
      direction, 
      newOrder: swapOrder 
    });

    return true;
  } catch (error) {
    console.log('[SOCIAL MEDIA SERVICE] Error moving social media link:', error.message);
    throw new Error(`Failed to move social media link: ${error.message}`);
  }
}

/**
 * Toggles the active status of a social media link
 * @param linkId - The social media link ID to toggle
 * @returns Promise with the updated social media link
 */
export async function toggleSocialMediaLinkStatus(linkId: number): Promise<SocialMediaLink> {
  console.log('[SOCIAL MEDIA SERVICE] Toggling social media link status:', { id: linkId });

  try {
    const existingLink = await storage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error('Social media link not found');
    }

    const updatedLink = await storage.updateSocialMediaLink(linkId, { 
      isActive: !existingLink.isActive 
    });

    console.log('[SOCIAL MEDIA SERVICE] Toggled social media link status:', {
      id: linkId,
      platform: updatedLink.platform,
      newStatus: updatedLink.isActive ? 'active' : 'inactive'
    });

    return updatedLink;
  } catch (error) {
    console.log('[SOCIAL MEDIA SERVICE] Error toggling social media link status:', error.message);
    throw new Error(`Failed to toggle social media link status: ${error.message}`);
  }
}

/**
 * Gets all social media links with optional active filtering
 * @param activeOnly - Whether to return only active links
 * @returns Promise with array of social media links
 */
export async function getAllSocialMediaLinks(activeOnly?: boolean): Promise<SocialMediaLink[]> {
  console.log('[SOCIAL MEDIA SERVICE] Retrieved social media links:', { activeOnly: activeOnly || false });

  try {
    const links = await storage.getSocialMediaLinks(activeOnly);
    console.log('[SOCIAL MEDIA SERVICE] Retrieved social media links:', { 
      count: links.length, 
      activeOnly: activeOnly || false 
    });
    return links;
  } catch (error) {
    console.log('[SOCIAL MEDIA SERVICE] Error retrieving social media links:', error.message);
    throw new Error(`Failed to retrieve social media links: ${error.message}`);
  }
}

/**
 * Gets a single social media link by ID
 * @param linkId - The social media link ID to retrieve
 * @returns Promise with the social media link or undefined if not found
 */
export async function getSocialMediaLinkById(linkId: number): Promise<SocialMediaLink | undefined> {
  console.log('[SOCIAL MEDIA SERVICE] Retrieving social media link by ID:', { id: linkId });

  try {
    const link = await storage.getSocialMediaLink?.(linkId);
    if (link) {
      console.log('[SOCIAL MEDIA SERVICE] Retrieved social media link:', { id: link.id, platform: link.platform });
    } else {
      console.log('[SOCIAL MEDIA SERVICE] Social media link not found by ID:', { id: linkId });
    }
    return link;
  } catch (error) {
    console.log('[SOCIAL MEDIA SERVICE] Error retrieving social media link by ID:', error.message);
    throw new Error(`Failed to retrieve social media link: ${error.message}`);
  }
}

/**
 * Performs bulk updates on multiple social media links
 * @param updates - Array of update objects with id and data
 * @returns Promise with summary of updates performed
 */
export async function performBulkSocialMediaLinkUpdates(
  updates: Array<{ id: number; data: any }>
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[SOCIAL MEDIA SERVICE] Performing bulk social media link updates:', { updateCount: updates.length });

  if (!updates || updates.length === 0) {
    throw new Error('Updates array is required');
  }

  const result = { success: 0, failed: 0, errors: [] };

  for (const update of updates) {
    try {
      await updateSocialMediaLink(update.id, update.data);
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Link ${update.id}: ${error.message}`);
    }
  }

  console.log('[SOCIAL MEDIA SERVICE] Bulk updates completed:', result);
  return result;
}

/**
 * Performs bulk operations on multiple social media links
 * @param linkIds - Array of social media link IDs to operate on
 * @param action - The action to perform ('activate', 'deactivate', 'delete')
 * @returns Promise with summary of actions performed
 */
export async function performBulkSocialMediaLinkAction(
  linkIds: number[], 
  action: 'activate' | 'deactivate' | 'delete'
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[SOCIAL MEDIA SERVICE] Performing bulk social media link action:', { action, linkCount: linkIds.length });

  if (!linkIds || linkIds.length === 0) {
    throw new Error('Link IDs array is required');
  }

  if (!['activate', 'deactivate', 'delete'].includes(action)) {
    throw new Error('Invalid action. Must be activate, deactivate, or delete');
  }

  const result = { success: 0, failed: 0, errors: [] };

  for (const linkId of linkIds) {
    try {
      switch (action) {
        case 'activate':
          await storage.updateSocialMediaLink(linkId, { isActive: true });
          break;
        case 'deactivate':
          await storage.updateSocialMediaLink(linkId, { isActive: false });
          break;
        case 'delete':
          await storage.deleteSocialMediaLink(linkId);
          break;
      }
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Link ${linkId}: ${error.message}`);
    }
  }

  console.log('[SOCIAL MEDIA SERVICE] Bulk action completed:', { action, ...result });
  return result;
}