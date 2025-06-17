import { eq } from "drizzle-orm";
import { db } from "../db";
import { 
  siteSettings,
  type SiteSetting,
  type InsertSiteSetting
} from "@shared/schema";

/**
 * Site Settings Storage Implementation
 * Handles CRUD operations for application configuration and settings
 */
export class SiteSettingsStorage {
  /**
   * Get all site settings
   */
  async getSiteSettings(): Promise<SiteSetting[]> {
    try {
      return await db.select().from(siteSettings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      throw new Error("Failed to fetch site settings");
    }
  }

  /**
   * Get single site setting by key
   */
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    try {
      const [setting] = await db.select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key));
      
      return setting;
    } catch (error) {
      console.error("Error fetching site setting:", error);
      throw new Error("Failed to fetch site setting");
    }
  }

  /**
   * Update or create site setting with upsert logic
   */
  async updateSiteSetting(
    key: string,
    value: any,
    description?: string,
    category?: string
  ): Promise<SiteSetting> {
    try {
      const [setting] = await db.insert(siteSettings)
        .values({
          key,
          value,
          description,
          category,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value,
            description,
            category,
            updatedAt: new Date()
          }
        })
        .returning();
      
      return setting;
    } catch (error) {
      console.error("Error updating site setting:", error);
      throw new Error("Failed to update site setting");
    }
  }

  /**
   * Create a new site setting
   */
  async createSiteSetting(settingData: InsertSiteSetting): Promise<SiteSetting> {
    try {
      const [setting] = await db.insert(siteSettings)
        .values({
          ...settingData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return setting;
    } catch (error) {
      console.error("Error creating site setting:", error);
      throw new Error("Failed to create site setting");
    }
  }

  /**
   * Delete site setting by key
   */
  async deleteSiteSetting(key: string): Promise<boolean> {
    try {
      const result = await db.delete(siteSettings)
        .where(eq(siteSettings.key, key));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting site setting:", error);
      throw new Error("Failed to delete site setting");
    }
  }

  /**
   * Get site settings by category
   */
  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    try {
      return await db.select()
        .from(siteSettings)
        .where(eq(siteSettings.category, category));
    } catch (error) {
      console.error("Error fetching site settings by category:", error);
      throw new Error("Failed to fetch site settings by category");
    }
  }

  /**
   * Bulk update multiple site settings
   */
  async bulkUpdateSiteSettings(
    settings: Array<{ key: string; value: any; description?: string; category?: string }>
  ): Promise<SiteSetting[]> {
    try {
      const results: SiteSetting[] = [];
      
      for (const setting of settings) {
        const result = await this.updateSiteSetting(
          setting.key,
          setting.value,
          setting.description,
          setting.category
        );
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error("Error bulk updating site settings:", error);
      throw new Error("Failed to bulk update site settings");
    }
  }
}

// Export singleton instance
export const siteSettingsStorage = new SiteSettingsStorage();