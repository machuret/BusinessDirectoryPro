/**
 * Social Media Management Service Layer
 * Handles business logic for social media links including CRUD operations, ordering, and validation
 */

import { z } from 'zod';
import { storage } from '../storage';
import type { SocialMediaLink, InsertSocialMediaLink } from '@shared/schema';
import { 
  closeOrderingGaps, 
  reorderAllSocialMediaLinks as reorderAll, 
  moveSocialMediaLink as moveLink,
  normalizeSocialMediaOrdering
} from './social-media/ordering.service';

// Valid social media platforms with type-safe enum
const VALID_PLATFORMS = [
  'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 
  'tiktok', 'pinterest', 'snapchat', 'whatsapp'
] as const;

// Create enum for compile-time type safety
export const PlatformEnum = z.enum(VALID_PLATFORMS);
export type SocialMediaPlatform = z.infer<typeof PlatformEnum>;

// Enhanced schema with z.enum() for better type safety and validation precision
export const socialMediaLinkSchema = z.object({
  platform: PlatformEnum, // Using z.enum() instead of .refine() for better type inference
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name must be 100 characters or less'),
  iconClass: z.string().min(1, 'Icon class is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().positive().optional()
});

// Type-safe helper functions for enhanced developer experience
export const isValidPlatform = (platform: string): platform is SocialMediaPlatform => {
  return VALID_PLATFORMS.includes(platform as SocialMediaPlatform);
};

export const getValidPlatforms = (): readonly SocialMediaPlatform[] => {
  return VALID_PLATFORMS;
};

export const validatePlatform = (platform: string): SocialMediaPlatform => {
  if (!isValidPlatform(platform)) {
    throw new Error(`Invalid platform: ${platform}. Valid platforms are: ${VALID_PLATFORMS.join(', ')}`);
  }
  return platform;
};

/**
 * Creates a new social media link with validation and automatic ordering
 * @param linkData - The social media link data to create
 * @returns Promise with the created social media link
 */
export async function createSocialMediaLink(linkData: InsertSocialMediaLink): Promise<SocialMediaLink> {
  console.log('[SOCIAL MEDIA SERVICE] Creating social media link:', { platform: linkData.platform });

  // Validate the input data using the enhanced schema
  const validatedData = socialMediaLinkSchema.parse(linkData);

  try {
    // Get current max sort order for automatic ordering
    const existingLinks = await storage.getSocialMediaLinks();
    const maxSortOrder = existingLinks.length > 0 
      ? Math.max(...existingLinks.map(link => link.sortOrder || 0))
      : 0;

    // Create the social media link with auto-incremented sort order
    const linkToCreate = {
      ...validatedData,
      sortOrder: validatedData.sortOrder || (maxSortOrder + 1)
    };

    const createdLink = await storage.createSocialMediaLink(linkToCreate);

    if (!createdLink) {
      throw new Error('Failed to create social media link');
    }

    console.log('[SOCIAL MEDIA SERVICE] Created social media link:', {
      id: createdLink.id,
      platform: createdLink.platform,
      sortOrder: createdLink.sortOrder
    });

    return createdLink;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error creating social media link:', errorMessage);
    throw new Error(`Failed to create social media link: ${errorMessage}`);
  }
}

/**
 * Updates an existing social media link with validation
 * @param linkId - The social media link ID to update
 * @param updateData - The data to update
 * @returns Promise with the updated social media link
 */
export async function updateSocialMediaLink(linkId: number, updateData: Partial<InsertSocialMediaLink>): Promise<SocialMediaLink> {
  console.log('[SOCIAL MEDIA SERVICE] Updating social media link:', { id: linkId });

  try {
    // Check if the social media link exists
    const existingLink = await storage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error('Social media link not found');
    }

    // Validate the update data if present
    if (Object.keys(updateData).length > 0) {
      const partialSchema = socialMediaLinkSchema.partial();
      partialSchema.parse(updateData);
    }

    const updatedLink = await storage.updateSocialMediaLink(linkId, updateData);

    if (!updatedLink) {
      throw new Error('Failed to update social media link');
    }

    console.log('[SOCIAL MEDIA SERVICE] Updated social media link:', {
      id: linkId,
      platform: updatedLink.platform,
      updatedFields: Object.keys(updateData)
    });

    return updatedLink;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error updating social media link:', errorMessage);
    throw new Error(`Failed to update social media link: ${errorMessage}`);
  }
}

/**
 * Deletes a social media link and reorders remaining links
 * @param linkId - The social media link ID to delete
 * @returns Promise with boolean indicating success
 */
export async function deleteSocialMediaLink(linkId: number): Promise<boolean> {
  console.log('[SOCIAL MEDIA SERVICE] Deleting social media link:', { id: linkId });

  try {
    // Check if the social media link exists
    const existingLink = await storage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error('Social media link not found');
    }

    // Delete the social media link
    await storage.deleteSocialMediaLink(linkId);

    // Get remaining links and reorder them using the ordering service
    const remainingLinks = await storage.getSocialMediaLinks();
    const remainingLinkIds = remainingLinks
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(link => link.id);

    // Use the ordering service to close gaps after deletion
    await closeOrderingGaps(remainingLinkIds);

    console.log('[SOCIAL MEDIA SERVICE] Deleted social media link and reordered remaining links:', {
      deletedId: linkId,
      remainingCount: remainingLinkIds.length
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error deleting social media link:', errorMessage);
    throw new Error(`Failed to delete social media link: ${errorMessage}`);
  }
}

/**
 * Gets a social media link by ID
 * @param linkId - The social media link ID to retrieve
 * @returns Promise with the social media link or null if not found
 */
export async function getSocialMediaLink(linkId: number): Promise<SocialMediaLink | null> {
  console.log('[SOCIAL MEDIA SERVICE] Getting social media link:', { id: linkId });

  try {
    const link = await storage.getSocialMediaLink?.(linkId);
    
    if (!link) {
      console.log('[SOCIAL MEDIA SERVICE] Social media link not found:', { id: linkId });
      return null;
    }

    console.log('[SOCIAL MEDIA SERVICE] Retrieved social media link:', {
      id: linkId,
      platform: link.platform
    });

    return link;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error getting social media link:', errorMessage);
    throw new Error(`Failed to get social media link: ${errorMessage}`);
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
    const links = await storage.getSocialMediaLinks();
    
    // Filter by active status if requested
    const filteredLinks = activeOnly 
      ? links.filter(link => link.isActive)
      : links;

    // Sort by sort order
    const sortedLinks = filteredLinks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    console.log('[SOCIAL MEDIA SERVICE] Retrieved social media links:', {
      count: sortedLinks.length,
      activeOnly: activeOnly || false
    });

    return sortedLinks;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[SOCIAL MEDIA SERVICE] Error getting social media links:', errorMessage);
    throw new Error(`Failed to get social media links: ${errorMessage}`);
  }
}

// Re-export ordering functions for API compatibility
export const reorderAllSocialMediaLinks = reorderAll;
export const moveSocialMediaLink = moveLink;
export { normalizeSocialMediaOrdering };