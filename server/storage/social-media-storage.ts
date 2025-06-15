import { eq, desc, asc } from "drizzle-orm";
import { db } from "../db";
import { 
  socialMediaLinks,
  type SocialMediaLink,
  type InsertSocialMediaLink 
} from "@shared/schema";

export class SocialMediaStorage {
  // Get all social media links, optionally filtered by active status
  async getSocialMediaLinks(activeOnly: boolean = false): Promise<SocialMediaLink[]> {
    try {
      const query = db.select().from(socialMediaLinks);
      
      if (activeOnly) {
        query.where(eq(socialMediaLinks.isActive, true));
      }
      
      const links = await query.orderBy(asc(socialMediaLinks.sortOrder));
      return links;
    } catch (error) {
      console.error('Error fetching social media links:', error);
      throw new Error('Failed to fetch social media links');
    }
  }

  // Get active social media links for public display
  async getActiveSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return this.getSocialMediaLinks(true);
  }

  // Get a specific social media link by ID
  async getSocialMediaLinkById(id: number): Promise<SocialMediaLink | undefined> {
    try {
      const [link] = await db
        .select()
        .from(socialMediaLinks)
        .where(eq(socialMediaLinks.id, id));
      
      return link;
    } catch (error) {
      console.error('Error fetching social media link by ID:', error);
      throw new Error('Failed to fetch social media link');
    }
  }

  // Get a specific social media link by platform
  async getSocialMediaLinkByPlatform(platform: string): Promise<SocialMediaLink | undefined> {
    try {
      const [link] = await db
        .select()
        .from(socialMediaLinks)
        .where(eq(socialMediaLinks.platform, platform));
      
      return link;
    } catch (error) {
      console.error('Error fetching social media link by platform:', error);
      throw new Error('Failed to fetch social media link');
    }
  }

  // Create a new social media link
  async createSocialMediaLink(linkData: InsertSocialMediaLink): Promise<SocialMediaLink> {
    try {
      // Ensure unique platform
      const existing = await this.getSocialMediaLinkByPlatform(linkData.platform);
      if (existing) {
        throw new Error(`Social media platform '${linkData.platform}' already exists`);
      }

      // Set default sort order if not provided
      if (!linkData.sortOrder) {
        const allLinks = await this.getSocialMediaLinks();
        linkData.sortOrder = allLinks.length + 1;
      }

      const [newLink] = await db
        .insert(socialMediaLinks)
        .values({
          ...linkData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newLink;
    } catch (error) {
      console.error('Error creating social media link:', error);
      throw error;
    }
  }

  // Update an existing social media link
  async updateSocialMediaLink(id: number, updates: Partial<InsertSocialMediaLink>): Promise<SocialMediaLink | undefined> {
    try {
      // Check if link exists
      const existing = await this.getSocialMediaLinkById(id);
      if (!existing) {
        throw new Error('Social media link not found');
      }

      // If platform is being updated, ensure it's unique
      if (updates.platform && updates.platform !== existing.platform) {
        const platformExists = await this.getSocialMediaLinkByPlatform(updates.platform);
        if (platformExists) {
          throw new Error(`Social media platform '${updates.platform}' already exists`);
        }
      }

      const [updatedLink] = await db
        .update(socialMediaLinks)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(socialMediaLinks.id, id))
        .returning();

      return updatedLink;
    } catch (error) {
      console.error('Error updating social media link:', error);
      throw error;
    }
  }

  // Delete a social media link
  async deleteSocialMediaLink(id: number): Promise<void> {
    try {
      const existing = await this.getSocialMediaLinkById(id);
      if (!existing) {
        throw new Error('Social media link not found');
      }

      await db
        .delete(socialMediaLinks)
        .where(eq(socialMediaLinks.id, id));
    } catch (error) {
      console.error('Error deleting social media link:', error);
      throw error;
    }
  }

  // Toggle active status of a social media link
  async toggleSocialMediaLink(id: number): Promise<SocialMediaLink | undefined> {
    try {
      const existing = await this.getSocialMediaLinkById(id);
      if (!existing) {
        throw new Error('Social media link not found');
      }

      return this.updateSocialMediaLink(id, { isActive: !existing.isActive });
    } catch (error) {
      console.error('Error toggling social media link:', error);
      throw error;
    }
  }

  // Reorder social media links
  async reorderSocialMediaLinks(reorderData: { id: number; sortOrder: number }[]): Promise<void> {
    try {
      // Update sort orders in a transaction-like manner
      for (const item of reorderData) {
        await this.updateSocialMediaLink(item.id, { sortOrder: item.sortOrder });
      }
    } catch (error) {
      console.error('Error reordering social media links:', error);
      throw new Error('Failed to reorder social media links');
    }
  }

  // Bulk update social media links (for admin convenience)
  async bulkUpdateSocialMediaLinks(updates: { id: number; url: string; isActive: boolean }[]): Promise<SocialMediaLink[]> {
    try {
      const updatedLinks: SocialMediaLink[] = [];

      for (const update of updates) {
        const updated = await this.updateSocialMediaLink(update.id, {
          url: update.url,
          isActive: update.isActive,
        });
        if (updated) {
          updatedLinks.push(updated);
        }
      }

      return updatedLinks;
    } catch (error) {
      console.error('Error bulk updating social media links:', error);
      throw new Error('Failed to bulk update social media links');
    }
  }
}