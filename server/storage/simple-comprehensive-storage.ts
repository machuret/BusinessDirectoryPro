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

export class SimpleComprehensiveStorage implements IStorage {
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

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined> {
    return this.userStorage.updateUser(id, userData);
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

  // Simplified implementations for other interfaces
  async getBusinessSubmissions(): Promise<any[]> {
    return [];
  }

  async updateBusinessSubmissionStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<any> {
    return {};
  }

  async getReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    return [];
  }

  async getApprovedReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    return [];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    return result;
  }

  async createPublicReview(businessId: string, reviewData: any): Promise<Review> {
    const review: InsertReview = {
      businessId,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      authorName: reviewData.authorName,
      authorEmail: reviewData.authorEmail,
      status: 'pending'
    };
    return this.createReview(review);
  }

  async getPendingReviews(): Promise<Review[]> {
    return [];
  }

  async approveReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    const [result] = await db.update(reviews)
      .set({ status: 'approved', adminNotes: notes, reviewedBy: adminId })
      .where(eq(reviews.id, reviewId))
      .returning();
    return result;
  }

  async rejectReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    const [result] = await db.update(reviews)
      .set({ status: 'rejected', adminNotes: notes, reviewedBy: adminId })
      .where(eq(reviews.id, reviewId))
      .returning();
    return result;
  }

  async getAllReviewsForAdmin(): Promise<Review[]> {
    return [];
  }

  async deleteReview(reviewId: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, reviewId));
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [result] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return result;
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting> {
    const [result] = await db.insert(siteSettings)
      .values({ key, value, description, category })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, description, category, updatedAt: new Date() }
      })
      .returning();
    return result;
  }

  // Menu operations
  async getMenuItems(position?: string): Promise<MenuItem[]> {
    if (position) {
      return db.select().from(menuItems).where(eq(menuItems.position, position));
    }
    return db.select().from(menuItems);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [result] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return result;
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [result] = await db.insert(menuItems).values(menuItem).returning();
    return result;
  }

  async updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [result] = await db.update(menuItems)
      .set({ ...menuItem, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return result;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Page operations
  async getPages(status?: string): Promise<Page[]> {
    if (status) {
      return db.select().from(pages).where(eq(pages.status, status));
    }
    return db.select().from(pages);
  }

  async getPage(id: number): Promise<Page | undefined> {
    const [result] = await db.select().from(pages).where(eq(pages.id, id));
    return result;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [result] = await db.select().from(pages).where(eq(pages.slug, slug));
    return result;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [result] = await db.insert(pages).values(page).returning();
    return result;
  }

  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    const [result] = await db.update(pages)
      .set({ ...page, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return result;
  }

  async deletePage(id: number): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  async publishPage(id: number, authorId: string): Promise<Page | undefined> {
    const [result] = await db.update(pages)
      .set({ status: 'published', authorId, publishedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return result;
  }

  // Website FAQ operations
  async getWebsiteFaqs(category?: string): Promise<WebsiteFaq[]> {
    if (category) {
      return db.select().from(websiteFaq).where(eq(websiteFaq.category, category));
    }
    return db.select().from(websiteFaq);
  }

  async getWebsiteFaq(id: number): Promise<WebsiteFaq | undefined> {
    const [result] = await db.select().from(websiteFaq).where(eq(websiteFaq.id, id));
    return result;
  }

  async createWebsiteFaq(faq: InsertWebsiteFaq): Promise<WebsiteFaq> {
    const [result] = await db.insert(websiteFaq).values(faq).returning();
    return result;
  }

  async updateWebsiteFaq(id: number, faq: Partial<InsertWebsiteFaq>): Promise<WebsiteFaq | undefined> {
    const [result] = await db.update(websiteFaq)
      .set({ ...faq, updatedAt: new Date() })
      .where(eq(websiteFaq.id, id))
      .returning();
    return result;
  }

  async deleteWebsiteFaq(id: number): Promise<void> {
    await db.delete(websiteFaq).where(eq(websiteFaq.id, id));
  }

  async reorderWebsiteFaqs(faqIds: number[]): Promise<void> {
    // Implementation for reordering
  }

  // Contact messages operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [result] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return result;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [result] = await db.insert(contactMessages).values(message).returning();
    return result;
  }

  async updateContactMessageStatus(id: number, status: string, adminNotes?: string): Promise<ContactMessage | undefined> {
    const [result] = await db.update(contactMessages)
      .set({ status, adminNotes })
      .where(eq(contactMessages.id, id))
      .returning();
    return result;
  }

  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  // Leads operations
  async getLeads(): Promise<LeadWithBusiness[]> {
    return [];
  }

  async getLead(id: number): Promise<LeadWithBusiness | undefined> {
    return undefined;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [result] = await db.insert(leads).values(lead).returning();
    return result;
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    const [result] = await db.update(leads)
      .set({ status })
      .where(eq(leads.id, id))
      .returning();
    return result;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadsByBusiness(businessId: string): Promise<LeadWithBusiness[]> {
    return [];
  }

  // Ownership claim operations
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
    return {};
  }

  async updateOwnershipClaim(id: number, status: string, adminMessage?: string, reviewedBy?: string): Promise<any> {
    return {};
  }

  async deleteOwnershipClaim(id: number): Promise<void> {
    // Stub implementation
  }
}