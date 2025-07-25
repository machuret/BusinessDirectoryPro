import { eq, like, ilike, and, or, desc, asc, sql, ne } from "drizzle-orm";
import { db, pool } from "../db";
import {
  users,
  categories,
  businesses,
  reviews,
  siteSettings,
  menuItems,
  pages,
  websiteFaq,
  leads,
  contactMessages,
  services,
  businessServices,
  contentStrings,
  socialMediaLinks,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Business,
  type InsertBusiness,
  type Review,
  type InsertReview,
  type SiteSetting,
  type InsertSiteSetting,
  type MenuItem,
  type InsertMenuItem,
  type Page,
  type InsertPage,
  type WebsiteFaq,
  type InsertWebsiteFaq,
  type Lead,
  type InsertLead,
  type ContactMessage,
  type InsertContactMessage,
  type BusinessWithCategory,
  type CategoryWithCount,
  type LeadWithBusiness,
  type Service,
  type InsertService,
  type BusinessService,
  type InsertBusinessService,
  type ContentString,
  type InsertContentString,
  type SocialMediaLink,
  type InsertSocialMediaLink,
} from "@shared/schema";

// Re-export types for storage modules
export type {
  User,
  UpsertUser,
  Category,
  InsertCategory,
  Business,
  InsertBusiness,
  Review,
  InsertReview,
  SiteSetting,
  InsertSiteSetting,
  MenuItem,
  InsertMenuItem,
  Page,
  InsertPage,
  WebsiteFaq,
  InsertWebsiteFaq,
  Lead,
  InsertLead,
  ContactMessage,
  InsertContactMessage,
  BusinessWithCategory,
  CategoryWithCount,
  LeadWithBusiness,
  Service,
  InsertService,
  BusinessService,
  InsertBusinessService,
  ContentString,
  InsertContentString,
  SocialMediaLink,
  InsertSocialMediaLink,
};

// Re-export database utilities and tables for storage modules

interface IStorage {
  // User operations (for email/password auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Admin user management
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  
  // Category operations
  getCategories(): Promise<CategoryWithCount[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;
  
  // City operations
  getUniqueCities(): Promise<{ city: string; count: number }[]>;
  
  // Business operations
  getBusinesses(params?: { 
    categoryId?: number; 
    search?: string; 
    city?: string; 
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<BusinessWithCategory[]>;
  getBusinessById(id: string): Promise<BusinessWithCategory | undefined>;
  getBusinessBySlug(slug: string): Promise<BusinessWithCategory | undefined>;
  getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusiness(id: string): Promise<void>;
  updateBusinessRating(businessId: string): Promise<void>;
  
  // Review operations
  getReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]>;
  getApprovedReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]>;
  createReview(review: InsertReview): Promise<Review>;
  createPublicReview(businessId: string, reviewData: any): Promise<Review>;
  
  // Admin review management
  getPendingReviews(): Promise<Review[]>;
  approveReview(reviewId: number, adminId: string, notes?: string): Promise<Review>;
  rejectReview(reviewId: number, adminId: string, notes?: string): Promise<Review>;
  getAllReviewsForAdmin(): Promise<Review[]>;
  deleteReview(reviewId: number): Promise<void>;
  
  // Search operations
  searchBusinesses(query: string, location?: string): Promise<BusinessWithCategory[]>;
  getFeaturedBusinesses(limit?: number): Promise<BusinessWithCategory[]>;
  getRandomBusinesses(limit?: number): Promise<BusinessWithCategory[]>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting>;
  
  // Ownership claim operations
  getOwnershipClaims(): Promise<any[]>;
  getOwnershipClaimsByUser(userId: string): Promise<any[]>;
  getOwnershipClaimsByBusiness(businessId: string): Promise<any[]>;
  createOwnershipClaim(claim: any): Promise<any>;
  updateOwnershipClaim(id: number, status: string, adminMessage?: string, reviewedBy?: string): Promise<any>;
  deleteOwnershipClaim(id: number): Promise<void>;
  
  // Menu management operations
  getMenuItems(position?: string): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<void>;
  
  // Page management operations (CMS)
  getPages(status?: string): Promise<Page[]>;
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<void>;
  publishPage(id: number, authorId: string): Promise<Page | undefined>;
  
  // Website FAQ management operations
  getWebsiteFaqs(category?: string): Promise<WebsiteFaq[]>;
  getWebsiteFaq(id: number): Promise<WebsiteFaq | undefined>;
  createWebsiteFaq(faq: InsertWebsiteFaq): Promise<WebsiteFaq>;
  updateWebsiteFaq(id: number, faq: Partial<InsertWebsiteFaq>): Promise<WebsiteFaq | undefined>;
  deleteWebsiteFaq(id: number): Promise<void>;
  reorderWebsiteFaqs(faqIds: number[]): Promise<void>;
  
  // Contact messages management operations  
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: number, status: string, adminNotes?: string): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<void>;
  
  // Leads management operations
  getLeads(): Promise<LeadWithBusiness[]>;
  getLead(id: number): Promise<LeadWithBusiness | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLeadStatus(id: number, status: string): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<void>;
  getLeadsByBusiness(businessId: string): Promise<LeadWithBusiness[]>;
  
  // Business submission management operations
  getBusinessSubmissions(): Promise<any[]>;
  updateBusinessSubmissionStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<any>;
  
  // Content string management operations
  getContentStrings(options: { language?: string; category?: string }): Promise<Record<string, string>>;
  getAllContentStrings(category?: string): Promise<ContentString[]>;
  getContentString(stringKey: string): Promise<ContentString | undefined>;
  createContentString(contentString: InsertContentString): Promise<ContentString>;
  updateContentString(stringKey: string, updates: Partial<ContentString>): Promise<ContentString | undefined>;
  deleteContentString(stringKey: string): Promise<boolean>;
  bulkUpsertContentStrings(contentStrings: InsertContentString[]): Promise<ContentString[]>;
  getContentStringCategories(): Promise<string[]>;
  getContentStringStats(): Promise<{
    totalStrings: number;
    categoryCounts: Record<string, number>;
    languageCounts: Record<string, number>;
    lastUpdated: Date | null;
  }>;
}



// Export the IStorage interface
export type { IStorage };