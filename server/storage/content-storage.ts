import { eq, desc, asc } from "drizzle-orm";
import { db } from "../db";
import { 
  siteSettings, menuItems, pages, websiteFaq, contactMessages,
  type SiteSetting, type InsertSiteSetting,
  type MenuItem, type InsertMenuItem, type Page, type InsertPage,
  type WebsiteFaq, type InsertWebsiteFaq,
  type ContactMessage, type InsertContactMessage
} from "@shared/schema";

export class ContentStorage {
  // Site Settings
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).orderBy(asc(siteSettings.key));
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting> {
    const existingSetting = await this.getSiteSetting(key);
    
    if (existingSetting) {
      const [updated] = await db
        .update(siteSettings)
        .set({
          value: JSON.stringify(value),
          description: description || existingSetting.description,
          category: category || existingSetting.category,
          updatedAt: new Date()
        })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(siteSettings)
        .values({
          key,
          value: JSON.stringify(value),
          description: description || '',
          category: category || 'general'
        })
        .returning();
      return created;
    }
  }

  // Menu Items
  async getMenuItems(position?: string): Promise<MenuItem[]> {
    const query = db.select().from(menuItems);
    
    if (position) {
      return await query.where(eq(menuItems.position, position)).orderBy(asc(menuItems.order));
    }
    
    return await query.orderBy(asc(menuItems.position), asc(menuItems.order));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [created] = await db.insert(menuItems).values(menuItem).returning();
    return created;
  }

  async updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updated] = await db
      .update(menuItems)
      .set({ ...menuItem, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Pages
  async getPages(status?: string): Promise<Page[]> {
    const query = db.select().from(pages);
    
    if (status) {
      return await query.where(eq(pages.status, status)).orderBy(desc(pages.createdAt));
    }
    
    return await query.orderBy(desc(pages.createdAt));
  }

  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [created] = await db.insert(pages).values(page).returning();
    return created;
  }

  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    const [updated] = await db
      .update(pages)
      .set({ ...page, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  async deletePage(id: number): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  async publishPage(id: number, authorId: string): Promise<Page | undefined> {
    const [published] = await db
      .update(pages)
      .set({
        status: 'published',
        publishedAt: new Date(),
        authorId,
        updatedAt: new Date()
      })
      .where(eq(pages.id, id))
      .returning();
    return published;
  }

  // Website FAQ
  async getWebsiteFaqs(category?: string): Promise<WebsiteFaq[]> {
    const query = db.select().from(websiteFaq);
    
    if (category) {
      return await query.where(eq(websiteFaq.category, category)).orderBy(asc(websiteFaq.order));
    }
    
    return await query.orderBy(asc(websiteFaq.order));
  }

  async getWebsiteFaq(id: number): Promise<WebsiteFaq | undefined> {
    const [faq] = await db.select().from(websiteFaq).where(eq(websiteFaq.id, id));
    return faq;
  }

  async createWebsiteFaq(faq: InsertWebsiteFaq): Promise<WebsiteFaq> {
    const [created] = await db.insert(websiteFaq).values(faq).returning();
    return created;
  }

  async updateWebsiteFaq(id: number, faq: Partial<InsertWebsiteFaq>): Promise<WebsiteFaq | undefined> {
    const [updated] = await db
      .update(websiteFaq)
      .set({ ...faq, updatedAt: new Date() })
      .where(eq(websiteFaq.id, id))
      .returning();
    return updated;
  }

  async deleteWebsiteFaq(id: number): Promise<void> {
    await db.delete(websiteFaq).where(eq(websiteFaq.id, id));
  }

  async reorderWebsiteFaqs(faqIds: number[]): Promise<void> {
    for (let i = 0; i < faqIds.length; i++) {
      await db
        .update(websiteFaq)
        .set({ order: i + 1, updatedAt: new Date() })
        .where(eq(websiteFaq.id, faqIds[i]));
    }
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(message).returning();
    return created;
  }

  async updateContactMessageStatus(id: number, status: string, adminNotes?: string): Promise<ContactMessage | undefined> {
    const [updated] = await db
      .update(contactMessages)
      .set({
        status,
        adminNotes,
        updatedAt: new Date()
      })
      .where(eq(contactMessages.id, id))
      .returning();
    return updated;
  }

  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }
}