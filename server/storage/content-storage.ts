import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { contentStrings, type ContentString, type InsertContentString } from "@shared/schema";

/**
 * Content storage implementation for content management system
 * Handles CRUD operations for content strings with translation support
 */
export class ContentStorage {
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
      if (category) {
        return await db.select().from(contentStrings)
          .where(eq(contentStrings.category, category))
          .orderBy(contentStrings.category, contentStrings.stringKey);
      }
      
      return await db.select().from(contentStrings)
        .orderBy(contentStrings.category, contentStrings.stringKey);
    } catch (error) {
      console.error("Error fetching all content strings:", error);
      throw new Error("Failed to fetch content strings");
    }
  }

  /**
   * Get a single content string by key
   */
  async getContentString(stringKey: string): Promise<ContentString | undefined> {
    try {
      const [result] = await db.select().from(contentStrings)
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
      if (error instanceof Error && error.message.includes("unique")) {
        throw new Error("Content string key already exists");
      }
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
      
      return result.rowCount > 0;
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
   * Get pages (placeholder implementation for admin interface)
   */
  async getPages(status?: string): Promise<any[]> {
    // This is a placeholder method to prevent server errors
    // In a full CMS implementation, this would fetch actual pages
    return [];
  }

  /**
   * Get statistics about content strings
   */
  async getContentStringStats(): Promise<{
    totalStrings: number;
    categoryCounts: Record<string, number>;
    languageCounts: Record<string, number>;
    lastUpdated: Date | null;
  }> {
    try {
      // Get total count
      const [totalResult] = await db.select({ 
        count: sql<number>`count(*)` 
      }).from(contentStrings);
      
      // Get category counts
      const categoryResults = await db.select({
        category: contentStrings.category,
        count: sql<number>`count(*)`
      })
      .from(contentStrings)
      .groupBy(contentStrings.category);
      
      const categoryCounts: Record<string, number> = {};
      categoryResults.forEach(r => {
        categoryCounts[r.category] = r.count;
      });
      
      // Get language counts by analyzing translations
      const allStrings = await db.select({
        translations: contentStrings.translations
      }).from(contentStrings);
      
      const languageCounts: Record<string, number> = {};
      allStrings.forEach(s => {
        const translations = s.translations as Record<string, string> || {};
        Object.keys(translations).forEach(lang => {
          languageCounts[lang] = (languageCounts[lang] || 0) + 1;
        });
      });
      
      // Get last updated
      const [lastUpdatedResult] = await db.select({
        lastUpdated: sql<Date>`max(updated_at)`
      }).from(contentStrings);
      
      return {
        totalStrings: totalResult.count,
        categoryCounts,
        languageCounts,
        lastUpdated: lastUpdatedResult.lastUpdated
      };
    } catch (error) {
      console.error("Error fetching content stats:", error);
      throw new Error("Failed to fetch content statistics");
    }
  }

  /**
   * Upsert a content string (insert if not exists, update if exists)
   */
  async upsertContentString(
    stringKey: string, 
    defaultValue: string, 
    description?: string, 
    category: string = 'general'
  ): Promise<ContentString> {
    try {
      const [result] = await db.insert(contentStrings)
        .values({
          stringKey,
          defaultValue,
          description: description || '',
          category,
          translations: {},
          isHtml: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: contentStrings.stringKey,
          set: {
            defaultValue,
            description: description || contentStrings.description,
            category,
            updatedAt: new Date()
          }
        })
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error upserting content string:", error);
      throw new Error("Failed to upsert content string");
    }
  }
}

// Export singleton instance
export const contentStorage = new ContentStorage();