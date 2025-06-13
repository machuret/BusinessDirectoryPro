import type { IStorage } from "./base-storage";
import { UserStorage } from "./user-storage";
import { BusinessStorage } from "./business";
import { CategoryStorage } from "./category-storage";
import { ServicesStorage } from "./services-storage";
import { eq, like, ilike, and, or, desc, asc, sql, ne } from "drizzle-orm";
import { db } from "../db";
import { 
  reviews, siteSettings, menuItems, pages, websiteFaq, leads, contactMessages,
  type Review, type InsertReview, type SiteSetting, type InsertSiteSetting,
  type MenuItem, type InsertMenuItem, type Page, type InsertPage,
  type WebsiteFaq, type InsertWebsiteFaq, type Lead, type InsertLead,
  type ContactMessage, type InsertContactMessage, type LeadWithBusiness,
  type User, type UpsertUser, type Category, type InsertCategory,
  type Business, type InsertBusiness, type BusinessWithCategory, type CategoryWithCount,
  type Service, type InsertService, type BusinessService, type InsertBusinessService
} from "@shared/schema";

export class ComprehensiveStorage implements IStorage {
  private userStorage = new UserStorage();
  private businessStorage = new BusinessStorage();
  private categoryStorage = new CategoryStorage();
  private servicesStorage = new ServicesStorage();

  // User operations - delegate to UserStorage
  async getUser(id: string): Promise<User | undefined> {
    return this.userStorage.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.userStorage.getUserByEmail(email);
  }

  async createUser(user: UpsertUser): Promise<User> {
    return this.userStorage.createUser(user);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    return this.userStorage.upsertUser(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userStorage.getAllUsers();
  }

  async getUsers(): Promise<User[]> {
    return this.userStorage.getAllUsers();
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined> {
    return this.userStorage.updateUser(id, userData);
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    return this.userStorage.updateUserPassword(id, hashedPassword);
  }

  async deleteUser(id: string): Promise<void> {
    return this.userStorage.deleteUser(id);
  }

  // Category operations - delegate to CategoryStorage
  async getCategories(): Promise<CategoryWithCount[]> {
    return this.categoryStorage.getCategories();
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return this.categoryStorage.getCategoryBySlug(slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    return this.categoryStorage.createCategory(category);
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    return this.categoryStorage.updateCategory(id, category);
  }

  async deleteCategory(id: number): Promise<void> {
    return this.categoryStorage.deleteCategory(id);
  }

  // Business operations - delegate to BusinessStorage
  async getBusinesses(params?: { 
    categoryId?: number; 
    search?: string; 
    city?: string; 
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<BusinessWithCategory[]> {
    return this.businessStorage.getBusinesses(params);
  }

  async getBusinessById(id: string): Promise<BusinessWithCategory | undefined> {
    return this.businessStorage.getBusinessById(id);
  }

  async getBusinessBySlug(slug: string): Promise<BusinessWithCategory | undefined> {
    return this.businessStorage.getBusinessBySlug(slug);
  }

  async getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]> {
    return this.businessStorage.getBusinessesByOwner(ownerId);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    return this.businessStorage.createBusiness(business);
  }

  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    return this.businessStorage.updateBusiness(id, business);
  }

  async deleteBusiness(id: string): Promise<void> {
    return this.businessStorage.deleteBusiness(id);
  }

  async updateBusinessRating(businessId: string): Promise<void> {
    return this.businessStorage.updateBusinessRating(businessId);
  }

  async searchBusinesses(query: string, location?: string): Promise<BusinessWithCategory[]> {
    return this.businessStorage.searchBusinesses(query, location);
  }

  async getFeaturedBusinesses(limit?: number): Promise<BusinessWithCategory[]> {
    return this.businessStorage.getFeaturedBusinesses(limit);
  }

  async getRandomBusinesses(limit?: number): Promise<BusinessWithCategory[]> {
    return this.businessStorage.getRandomBusinesses(limit);
  }

  async getUniqueCities(): Promise<{ city: string; count: number }[]> {
    return this.businessStorage.getUniqueCities();
  }

  async updateCityName(oldName: string, newName: string, description?: string): Promise<void> {
    return this.businessStorage.updateCityName(oldName, newName, description);
  }

  async importBusinessFromCSV(businessData: any): Promise<Business> {
    return this.businessStorage.importBusinessFromCSV(businessData);
  }

  async bulkImportBusinesses(businessesData: any[]): Promise<{ success: number; errors: any[] }> {
    return this.businessStorage.bulkImportBusinesses(businessesData);
  }

  async getBusinessSubmissions(): Promise<any[]> {
    return this.businessStorage.getBusinessSubmissions();
  }

  async updateBusinessSubmissionStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<any> {
    return this.businessStorage.updateBusinessSubmissionStatus(id, status, adminNotes, reviewedBy);
  }

  // Review operations
  async getReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    return await db
      .select({
        id: reviews.id,
        businessId: reviews.businessId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        authorName: reviews.authorName,
        authorEmail: reviews.authorEmail,
        status: reviews.status,
        adminNotes: reviews.adminNotes,
        createdAt: reviews.createdAt,
        reviewedAt: reviews.reviewedAt,
        reviewedBy: reviews.reviewedBy,
        user: {
          firstName: reviews.authorName,
          lastName: reviews.authorEmail
        }
      })
      .from(reviews)
      .where(eq(reviews.businessId, businessId));
  }

  async getApprovedReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    return await db
      .select({
        id: reviews.id,
        businessId: reviews.businessId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        authorName: reviews.authorName,
        authorEmail: reviews.authorEmail,
        status: reviews.status,
        adminNotes: reviews.adminNotes,
        createdAt: reviews.createdAt,
        reviewedAt: reviews.reviewedAt,
        reviewedBy: reviews.reviewedBy,
        user: {
          firstName: reviews.authorName,
          lastName: reviews.authorEmail
        }
      })
      .from(reviews)
      .where(and(eq(reviews.businessId, businessId), eq(reviews.status, 'approved')));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async createPublicReview(businessId: string, reviewData: any): Promise<Review> {
    const review: InsertReview = {
      businessId,
      userId: reviewData.userId || null,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      authorName: reviewData.authorName,
      authorEmail: reviewData.authorEmail,
      status: 'pending',
      createdAt: new Date()
    };
    return await this.createReview(review);
  }

  async getPendingReviews(): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.status, 'pending'));
  }

  async approveReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: notes
      })
      .where(eq(reviews.id, reviewId))
      .returning();
    return updated;
  }

  async rejectReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: notes
      })
      .where(eq(reviews.id, reviewId))
      .returning();
    return updated;
  }

  async getBusinessReviews(businessId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(and(
        eq(reviews.businessId, businessId),
        eq(reviews.status, 'approved')
      ))
      .orderBy(desc(reviews.createdAt));
  }

  async getAllReviewsForAdmin(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async deleteReview(reviewId: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, reviewId));
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    return result[0];
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(key);
    
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ value, description, category, updatedAt: new Date() })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(siteSettings)
        .values({ key, value, description, category, createdAt: new Date(), updatedAt: new Date() })
        .returning();
      return created;
    }
  }

  // Menu management operations
  async getMenuItems(position?: string): Promise<MenuItem[]> {
    let query = db.select().from(menuItems);
    
    if (position) {
      query = query.where(eq(menuItems.position, position));
    }
    
    return await query.orderBy(asc(menuItems.order));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
    return result[0];
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

  // Page management operations (CMS)
  async getPages(status?: string): Promise<Page[]> {
    let query = db.select().from(pages);
    
    if (status) {
      query = query.where(eq(pages.status, status));
    }
    
    return await query.orderBy(desc(pages.updatedAt));
  }

  async getPage(id: number): Promise<Page | undefined> {
    const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    return result[0];
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
    return result[0];
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
    const [updated] = await db
      .update(pages)
      .set({ 
        status: 'published',
        publishedAt: new Date(),
        authorId,
        updatedAt: new Date()
      })
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  // Website FAQ management operations
  async getWebsiteFaqs(category?: string): Promise<WebsiteFaq[]> {
    let query = db.select().from(websiteFaq);
    
    if (category) {
      query = query.where(eq(websiteFaq.category, category));
    }
    
    return await query.orderBy(asc(websiteFaq.order));
  }

  async getWebsiteFaq(id: number): Promise<WebsiteFaq | undefined> {
    const result = await db.select().from(websiteFaq).where(eq(websiteFaq.id, id)).limit(1);
    return result[0];
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
        .set({ order: i + 1 })
        .where(eq(websiteFaq.id, faqIds[i]));
    }
  }

  // Contact messages management operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    return result[0];
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(message).returning();
    return created;
  }

  async updateContactMessageStatus(id: number, status: string, adminNotes?: string): Promise<ContactMessage | undefined> {
    const [updated] = await db
      .update(contactMessages)
      .set({ status, adminNotes, updatedAt: new Date() })
      .where(eq(contactMessages.id, id))
      .returning();
    return updated;
  }

  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  // Leads management operations
  async getLeads(): Promise<LeadWithBusiness[]> {
    try {
      const result = await db.execute(sql`
        SELECT l.*, b.title as business_title
        FROM leads l
        LEFT JOIN businesses b ON l.business_id = b.placeid
        ORDER BY l.created_at DESC
      `);

      return result.rows.map((row: any) => ({
        ...row,
        business: row.business_title ? { title: row.business_title } : null
      })) as LeadWithBusiness[];
    } catch (error: any) {
      // If leads table doesn't exist, return empty array instead of failing
      if (error.code === '42P01' && error.message.includes('relation "leads" does not exist')) {
        console.log('Leads table does not exist, returning empty array');
        return [];
      }
      throw error;
    }
  }

  async getLead(id: number): Promise<LeadWithBusiness | undefined> {
    const result = await db.execute(sql`
      SELECT l.*, b.title as business_title
      FROM leads l
      LEFT JOIN businesses b ON l.business_id = b.placeid
      WHERE l.id = ${id}
      LIMIT 1
    `);

    if (result.rows.length === 0) return undefined;

    const row = result.rows[0];
    return {
      ...row,
      business: row.business_title ? { title: row.business_title } : null
    } as LeadWithBusiness;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    const [updated] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadsByBusiness(businessId: string): Promise<LeadWithBusiness[]> {
    const result = await db.execute(sql`
      SELECT l.*, b.title as business_title
      FROM leads l
      LEFT JOIN businesses b ON l.business_id = b.placeid
      WHERE l.business_id = ${businessId}
      ORDER BY l.created_at DESC
    `);

    return result.rows.map((row: any) => ({
      ...row,
      business: row.business_title ? { title: row.business_title } : null
    })) as LeadWithBusiness[];
  }

  // Ownership claim operations (stubbed for now)
  async getOwnershipClaims(): Promise<any[]> {
    return [];
  }

  async getOwnershipClaimsByUser(userId: string): Promise<any[]> {
    return [];
  }

  async getOwnershipClaimsByBusiness(businessId: string): Promise<any[]> {
    return [];
  }

  async createOwnershipClaim(claim: any): Promise<any> {
    return claim;
  }

  async updateOwnershipClaim(id: number, status: string, adminMessage?: string, reviewedBy?: string): Promise<any> {
    return {};
  }

  async deleteOwnershipClaim(id: number): Promise<void> {
    // Stub implementation
  }

  // Services Management - delegate to ServicesStorage
  async getServices(): Promise<Service[]> {
    return this.servicesStorage.getServices();
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.servicesStorage.getService(id);
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    return this.servicesStorage.getServiceBySlug(slug);
  }

  async createService(serviceData: InsertService): Promise<Service> {
    return this.servicesStorage.createService(serviceData);
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    return this.servicesStorage.updateService(id, serviceData);
  }

  async deleteService(id: number): Promise<boolean> {
    return this.servicesStorage.deleteService(id);
  }

  async getBusinessServices(businessId: string): Promise<Service[]> {
    return this.servicesStorage.getBusinessServices(businessId);
  }

  async addServiceToBusiness(businessId: string, serviceId: number): Promise<BusinessService> {
    return this.servicesStorage.addServiceToBusiness(businessId, serviceId);
  }

  async removeServiceFromBusiness(businessId: string, serviceId: number): Promise<boolean> {
    return this.servicesStorage.removeServiceFromBusiness(businessId, serviceId);
  }
}