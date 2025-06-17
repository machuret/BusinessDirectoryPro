/**
 * Social Media Management Service Layer
 * Handles business logic for social media links including CRUD operations, ordering, and validation
 */

import { z } from 'zod';
import { storage } from '../storage';
import type { SocialMediaLink, InsertSocialMediaLink } from '@shared/schema';

// Valid social media platforms with type-safe enum
const VALID_PLATFORMS = [
  'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 
  'tiktok', 'pinterest', 'snapchat', 'whatsapp'
] as const;

// Type-safe platform enum for better validation and inference
export const PlatformEnum = z.enum(VALID_PLATFORMS);

// Export platform type for use throughout the service
export type SocialMediaPlatform = z.infer<typeof PlatformEnum>;

/**
 * Type-safe helper functions leveraging the improved enum validation
 */

/**
 * Validates if a string is a valid social media platform
 * @param platform - Platform string to validate
 * @returns boolean indicating if platform is valid
 */
export function isValidPlatform(platform: string): platform is SocialMediaPlatform {
  return PlatformEnum.safeParse(platform).success;
}

/**
 * Gets all valid platform options
 * @returns Array of valid platform strings
 */
export function getValidPlatforms(): readonly SocialMediaPlatform[] {
  return VALID_PLATFORMS;
}

/**
 * Type-safe platform validation with detailed error message
 * @param platform - Platform to validate
 * @throws Error with detailed message if invalid
 */
export function validatePlatform(platform: unknown): asserts platform is SocialMediaPlatform {
  if (typeof platform !== 'string') {
    throw new Error(`Platform must be a string, received: ${typeof platform}`);
  }
  
  if (!isValidPlatform(platform)) {
    throw new Error(`Invalid platform "${platform}". Valid platforms: ${VALID_PLATFORMS.join(', ')}`);
  }
}

/**
 * Zod schema for social media link validation
 * Using z.enum() for type-safe platform validation
 */
export const socialMediaLinkSchema = z.object({
  platform: PlatformEnum,
  url: z.string()
    .min(1, 'URL is required')
    .url('Invalid URL format'),
  displayName: z.string()
    .min(1, 'Display name is required')
    .trim(),
  iconClass: z.string()
    .min(1, 'Icon class is required')
    .trim(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order must be non-negative')
    .optional()
});

/**
 * Zod schema for social media link updates (all fields optional)
 */
export const socialMediaLinkUpdateSchema = socialMediaLinkSchema.partial().extend({
  url: z.string()
    .optional()
    .refine(
      (url) => !url || url.trim().length === 0 || z.string().url().safeParse(url).success,
      'Invalid URL format'
    )
});

/**
 * Type definitions derived from Zod schemas
 */
export type SocialMediaLinkInput = z.infer<typeof socialMediaLinkSchema>;
export type SocialMediaLinkUpdateInput = z.infer<typeof socialMediaLinkUpdateSchema>;

/**
 * Creates a new social media link with validation and proper ordering
 * @param linkData - The social media link data
 * @returns Promise with the created social media link
 */
export async function createSocialMediaLink(linkData: unknown): Promise<SocialMediaLink> {
  console.log('[SOCIAL MEDIA SERVICE] Creating new social media link:', { 
    platform: typeof linkData === 'object' && linkData !== null && 'platform' in linkData ? (linkData as any).platform : 'unknown' 
  });

  // Validate input data using Zod schema
  const validatedData = socialMediaLinkSchema.parse(linkData);

  try {
    // Check for duplicate platform
    const existingLinks = await storage.getSocialMediaLinks();
    const duplicatePlatform = existingLinks.find((link: SocialMediaLink) => 
      link.platform.toLowerCase() === validatedData.platform.toLowerCase()
    );
    
    if (duplicatePlatform) {
      throw new Error(`A social media link for ${validatedData.platform} already exists`);
    }

    // Get the next sort order
    const maxOrder = existingLinks.length > 0 ? Math.max(...existingLinks.map((link: SocialMediaLink) => link.sortOrder)) : 0;

    // Prepare social media link data with proper ordering
    const createData: InsertSocialMediaLink = {
      platform: validatedData.platform,
      url: validatedData.url.trim(),
      displayName: validatedData.displayName.trim(),
      iconClass: validatedData.iconClass.trim(),
      isActive: validatedData.isActive,
      sortOrder: validatedData.sortOrder ?? maxOrder + 1
    };

    const socialMediaLink = await storage.createSocialMediaLink(createData);
    console.log('[SOCIAL MEDIA SERVICE] Successfully created social media link:', {
      id: socialMediaLink.id,
      platform: socialMediaLink.platform,
      sortOrder: socialMediaLink.sortOrder
    });

    return socialMediaLink;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error creating social media link:', errorMessage);
    throw new Error(`Failed to create social media link: ${errorMessage}`);
  }
}

/**
 * Updates an existing social media link with validation
 * @param linkId - The social media link ID to update
 * @param linkData - The partial social media link data to update
 * @returns Promise with the updated social media link
 */
export async function updateSocialMediaLink(linkId: number, linkData: unknown): Promise<SocialMediaLink> {
  console.log('[SOCIAL MEDIA SERVICE] Updating social media link:', { 
    id: linkId, 
    updates: typeof linkData === 'object' && linkData !== null ? Object.keys(linkData) : [] 
  });

  // Validate input data using Zod schema
  const validatedData = socialMediaLinkUpdateSchema.parse(linkData);

  try {
    // Check if social media link exists
    const existingLink = await storage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error('Social media link not found');
    }

    // Check for duplicate platform if platform is being updated
    if (validatedData.platform && validatedData.platform !== existingLink.platform.toLowerCase()) {
      const allLinks = await storage.getSocialMediaLinks();
      const duplicatePlatform = allLinks.find((link: SocialMediaLink) => 
        link.id !== linkId && link.platform.toLowerCase() === validatedData.platform!.toLowerCase()
      );
      
      if (duplicatePlatform) {
        throw new Error(`A social media link for ${validatedData.platform} already exists`);
      }
    }

    // Prepare update data
    const updateData: Partial<InsertSocialMediaLink> = {};
    
    if (validatedData.platform !== undefined) updateData.platform = validatedData.platform;
    if (validatedData.url !== undefined) updateData.url = validatedData.url.trim();
    if (validatedData.displayName !== undefined) updateData.displayName = validatedData.displayName.trim();
    if (validatedData.iconClass !== undefined) updateData.iconClass = validatedData.iconClass.trim();
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.sortOrder !== undefined) updateData.sortOrder = validatedData.sortOrder;

    const updatedLink = await storage.updateSocialMediaLink(linkId, updateData);
    if (!updatedLink) {
      throw new Error('Failed to update social media link');
    }

    console.log('[SOCIAL MEDIA SERVICE] Successfully updated social media link:', {
      id: updatedLink.id,
      platform: updatedLink.platform
    });

    return updatedLink;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error updating social media link:', errorMessage);
    throw new Error(`Failed to update social media link: ${errorMessage}`);
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
      await reorderAllSocialMediaLinks(remainingLinks.map((link: SocialMediaLink) => link.id));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error deleting social media link:', errorMessage);
    throw new Error(`Failed to delete social media link: ${errorMessage}`);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error reordering social media links:', errorMessage);
    throw new Error(`Failed to reorder social media links: ${errorMessage}`);
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
    const sortedLinks = allLinks.sort((a: SocialMediaLink, b: SocialMediaLink) => a.sortOrder - b.sortOrder);

    // Find current link index
    const currentIndex = sortedLinks.findIndex((link: SocialMediaLink) => link.id === linkId);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error moving social media link:', errorMessage);
    throw new Error(`Failed to move social media link: ${errorMessage}`);
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

    if (!updatedLink) {
      throw new Error('Failed to toggle social media link status');
    }

    console.log('[SOCIAL MEDIA SERVICE] Toggled social media link status:', {
      id: linkId,
      platform: updatedLink.platform,
      newStatus: updatedLink.isActive ? 'active' : 'inactive'
    });

    return updatedLink;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error toggling social media link status:', errorMessage);
    throw new Error(`Failed to toggle social media link status: ${errorMessage}`);
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
    const allLinks = await storage.getSocialMediaLinks();
    const links = activeOnly ? allLinks.filter((link: SocialMediaLink) => link.isActive) : allLinks;
    console.log('[SOCIAL MEDIA SERVICE] Retrieved social media links:', { 
      count: links.length, 
      activeOnly: activeOnly || false 
    });
    return links;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error retrieving social media links:', errorMessage);
    throw new Error(`Failed to retrieve social media links: ${errorMessage}`);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error retrieving social media link by ID:', errorMessage);
    throw new Error(`Failed to retrieve social media link: ${errorMessage}`);
  }
}

/**
 * Performs bulk updates on multiple social media links
 * @param updates - Array of update objects with id and data
 * @returns Promise with summary of updates performed
 */
export async function performBulkSocialMediaLinkUpdates(
  updates: Array<{ id: number; data: unknown }>
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[SOCIAL MEDIA SERVICE] Performing bulk social media link updates:', { updateCount: updates.length });

  if (!updates || updates.length === 0) {
    throw new Error('Updates array is required');
  }

  const result = { success: 0, failed: 0, errors: [] as string[] };

  for (const update of updates) {
    try {
      await updateSocialMediaLink(update.id, update.data);
      result.success++;
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Link ${update.id}: ${errorMessage}`);
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

  const result = { success: 0, failed: 0, errors: [] as string[] };

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
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Link ${linkId}: ${errorMessage}`);
    }
  }

  console.log('[SOCIAL MEDIA SERVICE] Bulk action completed:', { action, ...result });
  return result;
}