import { eq } from "drizzle-orm";
import { db } from "../db";
import { 
  contentStrings,
  type ContentString, 
  type InsertContentString
} from "@shared/schema";

/**
 * Content Strings Storage Implementation
 * Handles CRUD operations for content strings with translation support
 */
export class ContentStringsStorage {
  /**
   * Get content strings for frontend consumption
   * Returns a flat key-value object with translated strings
   */
  async getContentStrings(options: { language?: string; category?: string } = {}): Promise<Record<string, string>> {
    const { language = "en", category } = options;
    
    try {
      const query = db.select().from(contentStrings);
      
      // Apply category filter if specified
      const results = category 
        ? await query.where(eq(contentStrings.category, category))
        : await query;
      
      // Transform to key-value pairs with language preference
      const contentMap: Record<string, string> = {};
      
      for (const content of results) {
        const translations = content.translations as Record<string, string> || {};
        
        // Use translation if available, otherwise fall back to default value
        contentMap[content.stringKey] = translations[language] || content.defaultValue;
      }
      
      return contentMap;
    } catch (error) {
      console.error("Error fetching content strings:", error);
      throw new Error("Failed to fetch content strings");
    }
  }

  /**
   * Get all content strings with full metadata for admin interface
   */
  async getAllContentStrings(category?: string): Promise<ContentString[]> {
    try {
      const query = db.select().from(contentStrings);
      
      const results = category 
        ? await query.where(eq(contentStrings.category, category))
        : await query;
      
      return results;
    } catch (error) {
      console.error("Error fetching all content strings:", error);
      throw new Error("Failed to fetch content strings");
    }
  }

  /**
   * Get a specific content string by key
   */
  async getContentString(stringKey: string): Promise<ContentString | undefined> {
    try {
      const [result] = await db
        .select()
        .from(contentStrings)
        .where(eq(contentStrings.stringKey, stringKey));
      
      return result;
    } catch (error) {
      console.error("Error fetching content string:", error);
      throw new Error("Failed to fetch content string");
    }
  }

  /**
   * Create a new content string
   */
  async createContentString(contentString: InsertContentString): Promise<ContentString> {
    try {
      const [result] = await db.insert(contentStrings)
        .values({
          ...contentString,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error creating content string:", error);
      throw new Error("Failed to create content string");
    }
  }

  /**
   * Update an existing content string
   */
  async updateContentString(stringKey: string, updates: Partial<ContentString>): Promise<ContentString | undefined> {
    try {
      const [result] = await db.update(contentStrings)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(contentStrings.stringKey, stringKey))
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error updating content string:", error);
      throw new Error("Failed to update content string");
    }
  }

  /**
   * Delete a content string
   */
  async deleteContentString(stringKey: string): Promise<boolean> {
    try {
      const result = await db.delete(contentStrings)
        .where(eq(contentStrings.stringKey, stringKey));
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting content string:", error);
      throw new Error("Failed to delete content string");
    }
  }

  /**
   * Bulk upsert content strings
   */
  async bulkUpsertContentStrings(contentStringList: InsertContentString[]): Promise<ContentString[]> {
    try {
      const results: ContentString[] = [];
      
      for (const contentString of contentStringList) {
        const [result] = await db.insert(contentStrings)
          .values({
            ...contentString,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .onConflictDoUpdate({
            target: contentStrings.stringKey,
            set: {
              defaultValue: contentString.defaultValue,
              translations: contentString.translations,
              category: contentString.category,
              description: contentString.description,
              isHtml: contentString.isHtml,
              updatedAt: new Date()
            }
          })
          .returning();
        
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error("Error bulk upserting content strings:", error);
      throw new Error("Failed to bulk upsert content strings");
    }
  }

  /**
   * Get all categories used in content strings
   */
  async getContentStringCategories(): Promise<string[]> {
    try {
      const results = await db.selectDistinct({ category: contentStrings.category })
        .from(contentStrings)
        .orderBy(contentStrings.category);
      
      return results.map(r => r.category);
    } catch (error) {
      console.error("Error fetching content categories:", error);
      throw new Error("Failed to fetch content categories");
    }
  }

  /**
   * Get content statistics for admin dashboard
   */
  async getContentStringStats(): Promise<{
    totalStrings: number;
    categoriesCount: number;
    recentUpdates: number;
    categories: Array<{ category: string; count: number }>;
  }> {
    try {
      const totalStrings = await db.select({ count: contentStrings.id }).from(contentStrings);
      const categories = await this.getContentStringCategories();
      
      // Get category counts
      const categoryStats = await Promise.all(
        categories.map(async (category) => {
          const [result] = await db.select({ count: contentStrings.id })
            .from(contentStrings)
            .where(eq(contentStrings.category, category));
          return { category, count: result?.count || 0 };
        })
      );

      // Get recent updates (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const [recentUpdatesResult] = await db.select({ count: contentStrings.id })
        .from(contentStrings)
        .where(eq(contentStrings.updatedAt, weekAgo));

      return {
        totalStrings: totalStrings.length,
        categoriesCount: categories.length,
        recentUpdates: recentUpdatesResult?.count || 0,
        categories: categoryStats
      };
    } catch (error) {
      console.error("Error fetching content string stats:", error);
      throw new Error("Failed to fetch content string stats");
    }
  }

  /**
   * Search content strings by key or value
   */
  async searchContentStrings(searchTerm: string, category?: string): Promise<ContentString[]> {
    try {
      let query = db.select().from(contentStrings);
      
      if (category) {
        query = query.where(eq(contentStrings.category, category));
      }
      
      const results = await query;
      
      // Filter by search term in stringKey or defaultValue
      return results.filter(content => 
        content.stringKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.defaultValue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching content strings:", error);
      throw new Error("Failed to search content strings");
    }
  }
}

// Export singleton instance
export const contentStringsStorage = new ContentStringsStorage();