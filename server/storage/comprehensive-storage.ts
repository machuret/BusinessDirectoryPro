import type { IStorage } from "./base-storage";
import { UserStorage } from "./user-storage";
import { BusinessStorage } from "./business";
import { CategoryStorage } from "./category-storage";
import { ServicesStorage } from "./services-storage";
import { OwnershipClaimsStorage, type OwnershipClaimWithDetails } from "./ownership-claims-storage";
import { FeaturedRequestsStorage } from "./featured-requests-storage";
import { ContentStorage } from "./content-storage";
import { LeadsStorage } from "./leads-storage";
import { ReviewsStorage } from "./reviews-storage";
import { SocialMediaStorage } from "./social-media-storage";
import { 
  type User, type UpsertUser, type Category, type InsertCategory,
  type Business, type InsertBusiness, type BusinessWithCategory, type CategoryWithCount,
  type Service, type InsertService, type BusinessService, type InsertBusinessService,
  type Review, type InsertReview, type SiteSetting, type InsertSiteSetting,
  type MenuItem, type InsertMenuItem, type Page, type InsertPage,
  type WebsiteFaq, type InsertWebsiteFaq, type Lead, type InsertLead,
  type ContactMessage, type InsertContactMessage, type LeadWithBusiness,
  type ContentString, type InsertContentString, type SocialMediaLink, type InsertSocialMediaLink
} from "@shared/schema";

/**
 * Refactored comprehensive storage using composition pattern
 * Each domain area is handled by a specialized storage class
 */
export class ComprehensiveStorage implements IStorage {
  // Domain-specific storage instances
  private users = new UserStorage();
  private businesses = new BusinessStorage();
  private categories = new CategoryStorage();
  private services = new ServicesStorage();
  private ownershipClaims = new OwnershipClaimsStorage();
  private featuredRequests = new FeaturedRequestsStorage();
  private content = new ContentStorage();
  private leads = new LeadsStorage();
  private reviews = new ReviewsStorage();
  private socialMedia = new SocialMediaStorage();

  // ===== USER OPERATIONS =====
  async getUser(id: string): Promise<User | undefined> {
    return this.users.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.getUserByEmail(email);
  }

  async createUser(user: UpsertUser): Promise<User> {
    return this.users.createUser(user);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    return this.users.upsertUser(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.users.getAllUsers();
  }

  async getUsers(): Promise<User[]> {
    return this.users.getAllUsers();
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined> {
    return this.users.updateUser(id, userData);
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    return this.users.updateUserPassword(id, hashedPassword);
  }

  async deleteUser(id: string): Promise<void> {
    return this.users.deleteUser(id);
  }

  // ===== CATEGORY OPERATIONS =====
  async getCategories(): Promise<CategoryWithCount[]> {
    return this.categories.getCategories();
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return this.categories.getCategoryBySlug(slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    return this.categories.createCategory(category);
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    return this.categories.updateCategory(id, category);
  }

  async deleteCategory(id: number): Promise<void> {
    return this.categories.deleteCategory(id);
  }

  // ===== BUSINESS OPERATIONS =====
  async getBusinesses(params?: { 
    search?: string; 
    location?: string; 
    category?: string; 
    featured?: boolean; 
    limit?: number; 
    offset?: number;
  }): Promise<BusinessWithCategory[]> {
    return this.businesses.getBusinesses(params);
  }

  async getBusinessById(id: string): Promise<BusinessWithCategory | undefined> {
    return this.businesses.getBusinessById(id);
  }

  async getBusinessBySlug(slug: string): Promise<BusinessWithCategory | undefined> {
    return this.businesses.getBusinessBySlug(slug);
  }

  async getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]> {
    return this.businesses.getBusinessesByOwner(ownerId);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    return this.businesses.createBusiness(business);
  }

  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    return this.businesses.updateBusiness(id, business);
  }

  async deleteBusiness(id: string): Promise<void> {
    return this.businesses.deleteBusiness(id);
  }

  async searchBusinesses(query: string, location?: string): Promise<BusinessWithCategory[]> {
    return this.businesses.searchBusinesses(query, location);
  }

  async getFeaturedBusinesses(limit?: number): Promise<BusinessWithCategory[]> {
    return this.businesses.getFeaturedBusinesses(limit);
  }

  async getBusinessReviews(businessId: string): Promise<Review[]> {
    return this.reviews.getBusinessReviews(businessId);
  }

  async getRandomBusinesses(limit?: number): Promise<BusinessWithCategory[]> {
    return this.businesses.getRandomBusinesses(limit);
  }

  async getUniqueCities(): Promise<{ city: string; count: number }[]> {
    return this.businesses.getUniqueCities();
  }

  async getCities(): Promise<{ city: string; count: number }[]> {
    return this.businesses.getUniqueCities();
  }

  // Legacy business methods for backward compatibility
  async updateBusinessRating(businessId: string, rating: number): Promise<void> {
    // Delegate to business storage - this might need to be implemented there
    return this.businesses.updateBusiness(businessId, { averageRating: rating });
  }

  async updateCityName(oldName: string, newName: string): Promise<void> {
    // This would need to be implemented in business storage
    throw new Error("updateCityName not implemented in modular storage");
  }

  async importBusinessFromCSV(csvData: any): Promise<Business> {
    throw new Error("importBusinessFromCSV not implemented in modular storage");
  }

  async bulkImportBusinesses(businesses: any[]): Promise<Business[]> {
    throw new Error("bulkImportBusinesses not implemented in modular storage");
  }

  async updateBusinessSubmissionStatus(id: string, status: string): Promise<Business | undefined> {
    return this.businesses.updateBusiness(id, { submissionStatus: status });
  }

  // ===== REVIEW OPERATIONS =====
  async getReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    return this.reviews.getReviewsByBusiness(businessId);
  }

  async getApprovedReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    return this.reviews.getApprovedReviewsByBusiness(businessId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    return this.reviews.createReview(review);
  }

  async createPublicReview(businessId: string, reviewData: any): Promise<Review> {
    return this.reviews.createPublicReview(businessId, reviewData);
  }

  async getPendingReviews(): Promise<Review[]> {
    return this.reviews.getPendingReviews();
  }

  async approveReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    return this.reviews.approveReview(reviewId, adminId, notes);
  }

  async rejectReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    return this.reviews.rejectReview(reviewId, adminId, notes);
  }

  async getBusinessReviews(businessId: string): Promise<Review[]> {
    return this.reviews.getBusinessReviews(businessId);
  }

  async getAllReviewsForAdmin(): Promise<Review[]> {
    return this.reviews.getAllReviewsForAdmin();
  }

  async getAllReviews(): Promise<Review[]> {
    return this.reviews.getAllReviews();
  }

  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined> {
    return this.reviews.updateReview(id, updates);
  }

  async deleteReview(reviewId: number): Promise<void> {
    return this.reviews.deleteReview(reviewId);
  }

  // ===== CONTENT OPERATIONS =====
  async getSiteSettings(): Promise<any[]> {
    // Return basic site settings from content strings
    try {
      const settings = await this.content.getContentStrings({ category: "settings" });
      return Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        category: "settings"
      }));
    } catch (error) {
      console.error("Error fetching site settings:", error);
      return [];
    }
  }

  async getSiteSetting(key: string): Promise<any> {
    try {
      const contentString = await this.content.getContentString(key);
      return contentString ? {
        key: contentString.stringKey,
        value: contentString.defaultValue,
        category: contentString.category
      } : undefined;
    } catch (error) {
      console.error("Error fetching site setting:", error);
      return undefined;
    }
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting> {
    return this.content.updateSiteSetting(key, value, description, category);
  }

  async getSiteSettings(): Promise<SiteSetting[]> {
    return this.content.getSiteSettings();
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return this.content.getSiteSetting(key);
  }

  async getMenuItems(position?: string): Promise<MenuItem[]> {
    return this.content.getMenuItems(position);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.content.getMenuItem(id);
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    return this.content.createMenuItem(menuItem);
  }

  async updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    return this.content.updateMenuItem(id, menuItem);
  }

  async deleteMenuItem(id: number): Promise<void> {
    return this.content.deleteMenuItem(id);
  }

  // Legacy method for backward compatibility
  async reorderMenuItem(id: number, newOrder: number): Promise<void> {
    await this.content.updateMenuItem(id, { order: newOrder });
  }

  async getPages(status?: string): Promise<Page[]> {
    return this.content.getPages(status);
  }

  async getPage(id: number): Promise<Page | undefined> {
    return this.content.getPage(id);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return this.content.getPageBySlug(slug);
  }

  async createPage(page: InsertPage): Promise<Page> {
    return this.content.createPage(page);
  }

  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    return this.content.updatePage(id, page);
  }

  async deletePage(id: number): Promise<void> {
    return this.content.deletePage(id);
  }

  async publishPage(id: number, authorId: string): Promise<Page | undefined> {
    return this.content.publishPage(id, authorId);
  }

  async getWebsiteFaqs(category?: string): Promise<WebsiteFaq[]> {
    return this.content.getWebsiteFaqs(category);
  }

  async getWebsiteFaq(id: number): Promise<WebsiteFaq | undefined> {
    return this.content.getWebsiteFaq(id);
  }

  async createWebsiteFaq(faq: InsertWebsiteFaq): Promise<WebsiteFaq> {
    return this.content.createWebsiteFaq(faq);
  }

  async updateWebsiteFaq(id: number, faq: Partial<InsertWebsiteFaq>): Promise<WebsiteFaq | undefined> {
    return this.content.updateWebsiteFaq(id, faq);
  }

  async deleteWebsiteFaq(id: number): Promise<void> {
    return this.content.deleteWebsiteFaq(id);
  }

  async reorderWebsiteFaqs(faqIds: number[]): Promise<void> {
    return this.content.reorderWebsiteFaqs(faqIds);
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return this.content.getContactMessages();
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.content.getContactMessage(id);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    return this.content.createContactMessage(message);
  }

  async updateContactMessageStatus(id: number, status: string, adminNotes?: string): Promise<ContactMessage | undefined> {
    return this.content.updateContactMessageStatus(id, status, adminNotes);
  }

  async deleteContactMessage(id: number): Promise<void> {
    return this.content.deleteContactMessage(id);
  }

  // ===== LEADS OPERATIONS =====
  async getLeads(filters?: any): Promise<LeadWithBusiness[]> {
    return this.leads.getLeads();
  }

  async getLead(id: number): Promise<LeadWithBusiness | undefined> {
    return this.leads.getLead(id);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    return this.leads.createLead(lead);
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    return this.leads.updateLeadStatus(id, status);
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    return this.leads.updateLeadStatus(id, updates.status || 'pending');
  }

  async deleteLead(id: number): Promise<void> {
    return this.leads.deleteLead(id);
  }

  async getLeadsByBusiness(businessId: string): Promise<LeadWithBusiness[]> {
    return this.leads.getLeadsByBusiness(businessId);
  }

  // ===== OWNERSHIP CLAIMS OPERATIONS =====
  async getOwnershipClaims(): Promise<OwnershipClaimWithDetails[]> {
    return this.ownershipClaims.getAllOwnershipClaims();
  }

  async getOwnershipClaimsByUser(userId: string): Promise<OwnershipClaimWithDetails[]> {
    return this.ownershipClaims.getOwnershipClaimsByUser(userId);
  }

  async getOwnershipClaimsByBusiness(businessId: string): Promise<OwnershipClaimWithDetails[]> {
    return this.ownershipClaims.getOwnershipClaimsByBusiness(businessId);
  }

  async createOwnershipClaim(claimData: any): Promise<any> {
    return this.ownershipClaims.createOwnershipClaim(claimData);
  }

  async updateOwnershipClaim(id: number, status: string, adminMessage?: string, reviewedBy?: string): Promise<any> {
    return this.ownershipClaims.updateOwnershipClaimStatus(id, status as any, adminMessage, reviewedBy);
  }

  async deleteOwnershipClaim(id: number): Promise<void> {
    return this.ownershipClaims.deleteOwnershipClaim(id);
  }

  async getOwnershipClaim(id: number): Promise<OwnershipClaimWithDetails | undefined> {
    return this.ownershipClaims.getOwnershipClaim(id);
  }

  async getOwnershipClaimsStats(): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
    return this.ownershipClaims.getOwnershipClaimsStats();
  }

  // ===== SERVICES OPERATIONS =====
  async getServices(): Promise<Service[]> {
    return this.services.getServices();
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.getService(id);
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    return this.services.getServiceBySlug(slug);
  }

  async createService(serviceData: InsertService): Promise<Service> {
    return this.services.createService(serviceData);
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    return this.services.updateService(id, serviceData);
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.deleteService(id);
  }

  async getBusinessServices(businessId: string): Promise<Service[]> {
    return this.services.getBusinessServices(businessId);
  }

  async addServiceToBusiness(businessId: string, serviceId: number): Promise<BusinessService> {
    return this.services.addServiceToBusiness(businessId, serviceId);
  }

  async removeServiceFromBusiness(businessId: string, serviceId: number): Promise<boolean> {
    return this.services.removeServiceFromBusiness(businessId, serviceId);
  }

  // ===== FEATURED REQUESTS OPERATIONS =====
  async createFeaturedRequest(data: any): Promise<any> {
    return FeaturedRequestsStorage.createFeaturedRequest(data);
  }

  async getFeaturedRequestsByUser(userId: string): Promise<any[]> {
    return FeaturedRequestsStorage.getFeaturedRequestsByUser(userId);
  }

  async getAllFeaturedRequests(): Promise<any[]> {
    return FeaturedRequestsStorage.getAllFeaturedRequests();
  }

  async getAllFeaturedRequestsWithBusinessDetails(): Promise<any[]> {
    return FeaturedRequestsStorage.getAllFeaturedRequestsWithBusinessDetails();
  }

  async updateFeaturedRequestStatus(id: number, status: 'approved' | 'rejected', reviewedBy: string, adminMessage?: string): Promise<any> {
    return FeaturedRequestsStorage.updateFeaturedRequestStatus(id, status, reviewedBy, adminMessage);
  }

  async isBusinessEligibleForFeatured(businessId: string, userId: string): Promise<boolean> {
    return FeaturedRequestsStorage.isBusinessEligibleForFeatured(businessId, userId);
  }

  // ===== CONTENT STRING OPERATIONS =====
  async getContentStrings(options: { language?: string; category?: string }): Promise<Record<string, string>> {
    return this.content.getContentStrings(options);
  }

  async getAllContentStrings(category?: string): Promise<ContentString[]> {
    return this.content.getAllContentStrings(category);
  }

  async getContentString(stringKey: string): Promise<ContentString | undefined> {
    return this.content.getContentString(stringKey);
  }

  async createContentString(contentString: InsertContentString): Promise<ContentString> {
    return this.content.createContentString(contentString);
  }

  async updateContentString(stringKey: string, updates: Partial<ContentString>): Promise<ContentString | undefined> {
    return this.content.updateContentString(stringKey, updates);
  }

  async deleteContentString(stringKey: string): Promise<boolean> {
    return this.content.deleteContentString(stringKey);
  }

  async bulkUpsertContentStrings(contentStrings: InsertContentString[]): Promise<ContentString[]> {
    return this.content.bulkUpsertContentStrings(contentStrings);
  }

  async getContentStringCategories(): Promise<string[]> {
    return this.content.getContentStringCategories();
  }

  async getContentStringStats(): Promise<{
    totalStrings: number;
    categoryCounts: Record<string, number>;
    languageCounts: Record<string, number>;
    lastUpdated: Date | null;
  }> {
    return this.content.getContentStringStats();
  }

  // ===== SOCIAL MEDIA OPERATIONS =====
  async getSocialMediaLinks(activeOnly: boolean = false): Promise<SocialMediaLink[]> {
    return this.socialMedia.getSocialMediaLinks(activeOnly);
  }

  async getActiveSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return this.socialMedia.getActiveSocialMediaLinks();
  }

  async getSocialMediaLinkById(id: number): Promise<SocialMediaLink | undefined> {
    return this.socialMedia.getSocialMediaLinkById(id);
  }

  async getSocialMediaLinkByPlatform(platform: string): Promise<SocialMediaLink | undefined> {
    return this.socialMedia.getSocialMediaLinkByPlatform(platform);
  }

  async createSocialMediaLink(linkData: InsertSocialMediaLink): Promise<SocialMediaLink> {
    return this.socialMedia.createSocialMediaLink(linkData);
  }

  async updateSocialMediaLink(id: number, updates: Partial<InsertSocialMediaLink>): Promise<SocialMediaLink | undefined> {
    return this.socialMedia.updateSocialMediaLink(id, updates);
  }

  async deleteSocialMediaLink(id: number): Promise<void> {
    return this.socialMedia.deleteSocialMediaLink(id);
  }

  async toggleSocialMediaLink(id: number): Promise<SocialMediaLink | undefined> {
    return this.socialMedia.toggleSocialMediaLink(id);
  }

  async reorderSocialMediaLinks(reorderData: { id: number; sortOrder: number }[]): Promise<void> {
    return this.socialMedia.reorderSocialMediaLinks(reorderData);
  }

  async bulkUpdateSocialMediaLinks(updates: { id: number; url: string; isActive: boolean }[]): Promise<SocialMediaLink[]> {
    return this.socialMedia.bulkUpdateSocialMediaLinks(updates);
  }

  // ===== SITE SETTINGS OPERATIONS =====
  async getSiteSettings(): Promise<SiteSetting[]> {
    return this.content.getSiteSettings();
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return this.content.getSiteSetting(key);
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting> {
    return this.content.updateSiteSetting(key, value, description, category);
  }

  // ===== MENU ITEMS OPERATIONS =====
  async getMenuItems(location?: string): Promise<MenuItem[]> {
    return this.content.getMenuItems(location);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.content.getMenuItem(id);
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    return this.content.createMenuItem(menuItem);
  }

  async updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    return this.content.updateMenuItem(id, menuItem);
  }

  async deleteMenuItem(id: number): Promise<void> {
    return this.content.deleteMenuItem(id);
  }

  // ===== BUSINESS SUBMISSIONS OPERATIONS =====
  async getBusinessSubmissions(): Promise<any[]> {
    try {
      // Get businesses that are pending approval (submissionstatus = 'pending')
      const submissions = await db
        .select({
          id: businesses.placeid,
          placeid: businesses.placeid,
          title: businesses.title,
          description: businesses.description,
          address: businesses.address,
          city: businesses.city,
          phone: businesses.phone,
          email: businesses.email,
          website: businesses.website,
          categoryName: businesses.categoryname,
          status: businesses.submissionstatus,
          submittedBy: businesses.submittedby,
          submissionDate: businesses.createdat,
          updatedAt: businesses.updatedat,
        })
        .from(businesses)
        .where(eq(businesses.submissionstatus, 'pending'))
        .orderBy(desc(businesses.createdat));

      return submissions;
    } catch (error) {
      console.error('Error fetching business submissions:', error);
      return [];
    }
  }

  async updateBusinessSubmissionStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<any> {
    // Update business status - when approved, set to published
    const finalStatus = status === 'approved' ? 'published' : status;
    return this.businesses.updateBusiness(id, { 
      status: finalStatus,
      updatedAt: new Date()
    });
  }

  // ===== LEADS OPERATIONS =====
  async getAllLeads(): Promise<LeadWithBusiness[]> {
    return this.leads.getAllLeads();
  }

  async getAdminLeads(): Promise<LeadWithBusiness[]> {
    return this.leads.getAdminLeads();
  }

  async getOwnerLeads(ownerId: string): Promise<LeadWithBusiness[]> {
    return this.leads.getOwnerLeads(ownerId);
  }

  async isBusinessClaimed(businessId: string): Promise<{ isClaimed: boolean; ownerId?: string }> {
    return this.leads.isBusinessClaimed(businessId);
  }

  async getLead(id: number): Promise<LeadWithBusiness | undefined> {
    return this.leads.getLead(id);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    return this.leads.createLead(lead);
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    return this.leads.updateLeadStatus(id, status);
  }

  async deleteLead(id: number): Promise<void> {
    return this.leads.deleteLead(id);
  }

  async getLeadsByBusiness(businessId: string): Promise<LeadWithBusiness[]> {
    return this.leads.getLeadsByBusiness(businessId);
  }
}

// Export a singleton instance
export const storage = new ComprehensiveStorage();