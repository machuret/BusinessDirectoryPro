import { eq } from "drizzle-orm";
import { db } from "../db";
import { 
  pages,
  type Page,
  type InsertPage
} from "@shared/schema";

/**
 * Pages Storage Implementation
 * Handles CRUD operations for CMS page management
 */
export class PagesStorage {
  /**
   * Get pages with optional status filtering
   */
  async getPages(status?: string): Promise<Page[]> {
    try {
      if (status) {
        return await db.select().from(pages).where(eq(pages.status, status));
      }
      return await db.select().from(pages).orderBy(pages.updatedAt);
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw new Error("Failed to fetch pages");
    }
  }

  /**
   * Get page by ID
   */
  async getPage(id: number): Promise<Page | undefined> {
    try {
      const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching page:", error);
      throw new Error("Failed to fetch page");
    }
  }

  /**
   * Get page by slug for public access
   */
  async getPageBySlug(slug: string): Promise<Page | undefined> {
    try {
      const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching page by slug:", error);
      throw new Error("Failed to fetch page by slug");
    }
  }

  /**
   * Create a new page
   */
  async createPage(pageData: InsertPage): Promise<Page> {
    try {
      const [page] = await db.insert(pages).values({
        ...pageData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return page;
    } catch (error) {
      console.error("Error creating page:", error);
      throw new Error("Failed to create page");
    }
  }

  /**
   * Update an existing page
   */
  async updatePage(id: number, updates: Partial<InsertPage>): Promise<Page | undefined> {
    try {
      const [page] = await db.update(pages)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(pages.id, id))
        .returning();
      return page;
    } catch (error) {
      console.error("Error updating page:", error);
      throw new Error("Failed to update page");
    }
  }

  /**
   * Delete a page
   */
  async deletePage(id: number): Promise<void> {
    try {
      await db.delete(pages).where(eq(pages.id, id));
    } catch (error) {
      console.error("Error deleting page:", error);
      throw new Error("Failed to delete page");
    }
  }

  /**
   * Publish a page (set status to published and timestamp)
   */
  async publishPage(id: number): Promise<Page | undefined> {
    try {
      const [page] = await db.update(pages)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(pages.id, id))
        .returning();
      return page;
    } catch (error) {
      console.error("Error publishing page:", error);
      throw new Error("Failed to publish page");
    }
  }

  /**
   * Unpublish a page (set status to draft)
   */
  async unpublishPage(id: number): Promise<Page | undefined> {
    try {
      const [page] = await db.update(pages)
        .set({
          status: "draft",
          updatedAt: new Date()
        })
        .where(eq(pages.id, id))
        .returning();
      return page;
    } catch (error) {
      console.error("Error unpublishing page:", error);
      throw new Error("Failed to unpublish page");
    }
  }

  /**
   * Get published pages for public access
   */
  async getPublishedPages(): Promise<Page[]> {
    try {
      return await db.select()
        .from(pages)
        .where(eq(pages.status, "published"))
        .orderBy(pages.publishedAt);
    } catch (error) {
      console.error("Error fetching published pages:", error);
      throw new Error("Failed to fetch published pages");
    }
  }

  /**
   * Search pages by title or content
   */
  async searchPages(searchTerm: string, status?: string): Promise<Page[]> {
    try {
      let query = db.select().from(pages);
      
      if (status) {
        query = query.where(eq(pages.status, status));
      }
      
      const results = await query;
      
      // Filter by search term in title or content
      return results.filter(page => 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching pages:", error);
      throw new Error("Failed to search pages");
    }
  }

  /**
   * Get page statistics for admin dashboard
   */
  async getPageStats(): Promise<{
    totalPages: number;
    publishedPages: number;
    draftPages: number;
    recentlyUpdated: number;
  }> {
    try {
      const allPages = await this.getPages();
      const publishedPages = allPages.filter(p => p.status === 'published');
      const draftPages = allPages.filter(p => p.status === 'draft');
      
      // Get recently updated (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentlyUpdated = allPages.filter(p => 
        new Date(p.updatedAt) > weekAgo
      );

      return {
        totalPages: allPages.length,
        publishedPages: publishedPages.length,
        draftPages: draftPages.length,
        recentlyUpdated: recentlyUpdated.length
      };
    } catch (error) {
      console.error("Error fetching page stats:", error);
      throw new Error("Failed to fetch page stats");
    }
  }
}

// Export singleton instance
export const pagesStorage = new PagesStorage();