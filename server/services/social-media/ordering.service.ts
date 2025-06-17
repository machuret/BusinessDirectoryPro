/**
 * Social Media Ordering Service
 * Handles complex ordering and reordering logic for social media links
 */

import { storage } from '../../storage';
import type { SocialMediaLink } from '@shared/schema';

/**
 * Reorders all social media links according to provided ID array
 * @param orderedIds - Array of social media link IDs in desired order
 * @returns Promise that resolves when reordering is complete
 */
export async function reorderAllSocialMediaLinks(orderedIds: number[]): Promise<void> {
  console.log('[SOCIAL MEDIA ORDERING] Reordering all social media links:', { linkCount: orderedIds.length });

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

    console.log('[SOCIAL MEDIA ORDERING] Successfully reordered all social media links:', { linkCount: orderedIds.length });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA ORDERING] Error reordering social media links:', errorMessage);
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
  console.log('[SOCIAL MEDIA ORDERING] Moving social media link:', { id: linkId, direction });

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
      console.log('[SOCIAL MEDIA ORDERING] Cannot move up: already at top');
      return false;
    }
    if (direction === 'down' && currentIndex === sortedLinks.length - 1) {
      console.log('[SOCIAL MEDIA ORDERING] Cannot move down: already at bottom');
      return false;
    }

    // Calculate new positions
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentOrder = sortedLinks[currentIndex].sortOrder;
    const swapOrder = sortedLinks[swapIndex].sortOrder;

    // Swap the orders
    await storage.updateSocialMediaLink(sortedLinks[currentIndex].id, { sortOrder: swapOrder });
    await storage.updateSocialMediaLink(sortedLinks[swapIndex].id, { sortOrder: currentOrder });

    console.log('[SOCIAL MEDIA ORDERING] Successfully moved social media link:', { 
      id: linkId, 
      direction, 
      newOrder: swapOrder 
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA ORDERING] Error moving social media link:', errorMessage);
    throw new Error(`Failed to move social media link: ${errorMessage}`);
  }
}

/**
 * Reorders remaining social media links to close gaps after deletion
 * @param remainingLinkIds - Array of remaining link IDs
 * @returns Promise that resolves when gap closing is complete
 */
export async function closeOrderingGaps(remainingLinkIds: number[]): Promise<void> {
  console.log('[SOCIAL MEDIA ORDERING] Closing ordering gaps after deletion:', { 
    remainingCount: remainingLinkIds.length 
  });

  if (remainingLinkIds.length === 0) {
    console.log('[SOCIAL MEDIA ORDERING] No remaining links to reorder');
    return;
  }

  try {
    await reorderAllSocialMediaLinks(remainingLinkIds);
    console.log('[SOCIAL MEDIA ORDERING] Successfully closed ordering gaps');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA ORDERING] Error closing ordering gaps:', errorMessage);
    throw new Error(`Failed to close ordering gaps: ${errorMessage}`);
  }
}

/**
 * Validates and normalizes social media link ordering
 * Ensures all links have proper sequential sort order starting from 1
 * @returns Promise that resolves when normalization is complete
 */
export async function normalizeSocialMediaOrdering(): Promise<void> {
  console.log('[SOCIAL MEDIA ORDERING] Normalizing social media link ordering');

  try {
    const allLinks = await storage.getSocialMediaLinks();
    if (allLinks.length === 0) {
      console.log('[SOCIAL MEDIA ORDERING] No links to normalize');
      return;
    }

    // Sort by current order, then by ID as fallback
    const sortedLinks = allLinks.sort((a: SocialMediaLink, b: SocialMediaLink) => {
      if (a.sortOrder === b.sortOrder) {
        return a.id - b.id;
      }
      return a.sortOrder - b.sortOrder;
    });

    // Reorder with sequential numbering
    const orderedIds = sortedLinks.map((link: SocialMediaLink) => link.id);
    await reorderAllSocialMediaLinks(orderedIds);

    console.log('[SOCIAL MEDIA ORDERING] Successfully normalized social media link ordering:', {
      totalLinks: orderedIds.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA ORDERING] Error normalizing ordering:', errorMessage);
    throw new Error(`Failed to normalize social media link ordering: ${errorMessage}`);
  }
}