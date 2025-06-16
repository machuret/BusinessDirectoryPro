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
 * Clean comprehensive storage using composition pattern
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

  // ===== CITY OPERATIONS =====
  async getCities(): Promise<{ city: string; count: number }[]> {
    return this.businesses.getUniqueCities();
  }

  async getUniqueCities(): Promise<{ city: string; count: number }[]> {
    return this.businesses.getUniqueCities();
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

  async getUserBusinesses(userId: string): Promise<BusinessWithCategory[]> {
    return this.businesses.getBusinessesByOwner(userId);
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

  async getRandomBusinesses(limit?: number): Promise<BusinessWithCategory[]> {
    return this.businesses.getRandomBusinesses(limit);
  }

  async getUniqueCities(): Promise<{ city: string; count: number }[]> {
    return this.businesses.getUniqueCities();
  }

  async updateBusinessRating(businessId: string): Promise<void> {
    return this.reviews.updateBusinessRating(businessId);
  }

  async getBusinessSubmissions(): Promise<BusinessWithCategory[]> {
    return this.businesses.getPendingBusinesses();
  }

  async updateBusinessSubmissionStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<Business | undefined> {
    const updates: Partial<InsertBusiness> = {
      status: status as any,
      adminNotes,
      reviewedBy
    };
    return this.businesses.updateBusiness(id, updates);
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

  async getAllReviewsForAdmin(): Promise<Review[]> {
    return this.reviews.getAllReviewsForAdmin();
  }

  async getAllReviews(): Promise<Review[]> {
    return this.reviews.getAllReviewsForAdmin();
  }

  async updateReview(reviewId: number, updates: { status: string }): Promise<Review> {
    if (updates.status === 'approved') {
      return this.reviews.approveReview(reviewId, 'admin');
    } else if (updates.status === 'rejected') {
      return this.reviews.rejectReview(reviewId, 'admin');
    }
    throw new Error('Invalid status update');
  }

  async deleteReview(reviewId: number): Promise<void> {
    return this.reviews.deleteReview(reviewId);
  }

  // ===== CONTENT OPERATIONS =====
  async getSiteSettings(): Promise<SiteSetting[]> {
    return this.content.getSiteSettings();
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return this.content.getSiteSetting(key);
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting> {
    return this.content.updateSiteSetting(key, value, description, category);
  }

  async getMenuItems(position?: string): Promise<MenuItem[]> {
    return this.content.getMenuItems(position);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.content.getMenuItem(id);
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    return this.content.getMenuItemById(id);
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
  async getLeads(): Promise<LeadWithBusiness[]> {
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
    return this.ownershipClaims.updateOwnershipClaim(id, status as any, adminMessage, reviewedBy);
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
    return this.featuredRequests.createFeaturedRequest(data);
  }

  async getFeaturedRequestsByUser(userId: string): Promise<any[]> {
    return this.featuredRequests.getFeaturedRequestsByUser(userId);
  }

  async getAllFeaturedRequests(): Promise<any[]> {
    return this.featuredRequests.getAllFeaturedRequests();
  }

  async getAllFeaturedRequestsWithBusinessDetails(): Promise<any[]> {
    return this.featuredRequests.getAllFeaturedRequestsWithBusinessDetails();
  }

  async updateFeaturedRequestStatus(id: number, status: 'approved' | 'rejected', reviewedBy: string, adminMessage?: string): Promise<any> {
    return this.featuredRequests.updateFeaturedRequestStatus(id, status, reviewedBy, adminMessage);
  }

  async isBusinessEligibleForFeatured(businessId: string, userId: string): Promise<boolean> {
    return this.featuredRequests.isBusinessEligibleForFeatured(businessId, userId);
  }

  // ===== SOCIAL MEDIA OPERATIONS =====
  async getSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return this.socialMedia.getSocialMediaLinks();
  }

  async getSocialMediaLink(id: number): Promise<SocialMediaLink | undefined> {
    return this.socialMedia.getSocialMediaLink(id);
  }

  async createSocialMediaLink(link: InsertSocialMediaLink): Promise<SocialMediaLink> {
    return this.socialMedia.createSocialMediaLink(link);
  }

  async updateSocialMediaLink(id: number, link: Partial<InsertSocialMediaLink>): Promise<SocialMediaLink | undefined> {
    return this.socialMedia.updateSocialMediaLink(id, link);
  }

  async deleteSocialMediaLink(id: number): Promise<void> {
    return this.socialMedia.deleteSocialMediaLink(id);
  }

  // ===== CONTENT STRINGS OPERATIONS =====
  async getContentStrings(options?: { language?: string; category?: string }): Promise<Record<string, string>> {
    return this.content.getContentStrings(options);
  }

  async getContentString(key: string): Promise<ContentString | undefined> {
    return this.content.getContentString(key);
  }

  async createContentString(contentString: InsertContentString): Promise<ContentString> {
    return this.content.createContentString(contentString);
  }

  async updateContentString(id: number, contentString: Partial<InsertContentString>): Promise<ContentString | undefined> {
    return this.content.updateContentString(id, contentString);
  }

  async deleteContentString(id: number): Promise<void> {
    return this.content.deleteContentString(id);
  }
}