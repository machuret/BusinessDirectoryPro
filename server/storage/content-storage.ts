import { contentStringsStorage } from './content-strings.storage';
import { siteSettingsStorage } from './site-settings.storage';
import { menuItemsStorage } from './menu-items.storage';
import { pagesStorage } from './pages.storage';
import { websiteFaqsStorage } from './website-faqs.storage';
import { contactMessagesStorage } from './contact-messages.storage';
import { BusinessStorage } from './business/index';
import { categoryStorage } from './category-storage';
import { SocialMediaStorage } from './social-media-storage';
import { userStorage } from './user-storage';
import { ReviewsStorage } from './reviews-storage';

/**
 * ContentStorage - Refactored to use modular domain-specific storage classes
 * This class now delegates operations to focused storage implementations
 */
export class ContentStorage {
  private businessStorage = new BusinessStorage();
  private socialMediaStorage = new SocialMediaStorage();
  private reviewsStorage = new ReviewsStorage();

  constructor(
    private contentStrings = contentStringsStorage,
    private siteSettings = siteSettingsStorage,
    private menuItems = menuItemsStorage,
    private pages = pagesStorage,
    private websiteFaqs = websiteFaqsStorage,
    private contactMessages = contactMessagesStorage,
    private categories = categoryStorage,
    private users = userStorage
  ) {}

  // Content String delegation methods
  async getContentStrings(options: { language?: string; category?: string } = {}): Promise<Record<string, string>> {
    return this.contentStrings.getContentStrings(options);
  }

  async getAllContentStrings(category?: string) {
    return this.contentStrings.getAllContentStrings(category);
  }

  async getContentString(stringKey: string) {
    return this.contentStrings.getContentString(stringKey);
  }

  async createContentString(contentString: any) {
    return this.contentStrings.createContentString(contentString);
  }

  async updateContentString(stringKey: string, updates: any) {
    return this.contentStrings.updateContentString(stringKey, updates);
  }

  async deleteContentString(stringKey: string) {
    return this.contentStrings.deleteContentString(stringKey);
  }

  async bulkUpsertContentStrings(contentStringList: any[]) {
    return this.contentStrings.bulkUpsertContentStrings(contentStringList);
  }

  async getContentStringCategories() {
    return this.contentStrings.getContentStringCategories();
  }

  async getContentStringStats() {
    return this.contentStrings.getContentStringStats();
  }

  // Menu Items delegation methods
  async getMenuItem(id: number) {
    return this.menuItems.getMenuItem(id);
  }

  async getMenuItemById(id: number) {
    return this.menuItems.getMenuItemById(id);
  }

  async createMenuItem(menuItem: any) {
    return this.menuItems.createMenuItem(menuItem);
  }

  async updateMenuItem(id: number, updates: any) {
    return this.menuItems.updateMenuItem(id, updates);
  }

  async deleteMenuItem(id: number) {
    return this.menuItems.deleteMenuItem(id);
  }

  async getMenuItems(position?: string) {
    return this.menuItems.getMenuItems(position);
  }

  // Pages delegation methods
  async getPages(status?: string) {
    return this.pages.getPages(status);
  }

  async getPage(id: number) {
    return this.pages.getPage(id);
  }

  async getPageBySlug(slug: string) {
    return this.pages.getPageBySlug(slug);
  }

  async createPage(pageData: any) {
    return this.pages.createPage(pageData);
  }

  async updatePage(id: number, updates: any) {
    return this.pages.updatePage(id, updates);
  }

  async deletePage(id: number) {
    return this.pages.deletePage(id);
  }

  async publishPage(id: number) {
    return this.pages.publishPage(id);
  }

  // Site Settings delegation methods
  async getSiteSettings() {
    return this.siteSettings.getSiteSettings();
  }

  async getSiteSetting(key: string) {
    return this.siteSettings.getSiteSetting(key);
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string) {
    return this.siteSettings.updateSiteSetting(key, value, description, category);
  }

  // Website FAQs delegation methods
  async getWebsiteFaqs() {
    return this.websiteFaqs.getWebsiteFaqs();
  }

  async getWebsiteFaq(id: number) {
    return this.websiteFaqs.getWebsiteFaq(id);
  }

  async createWebsiteFaq(faq: any) {
    return this.websiteFaqs.createWebsiteFaq(faq);
  }

  async updateWebsiteFaq(id: number, updates: any) {
    return this.websiteFaqs.updateWebsiteFaq(id, updates);
  }

  async deleteWebsiteFaq(id: number) {
    return this.websiteFaqs.deleteWebsiteFaq(id);
  }

  async reorderWebsiteFaqs(reorderData: any[]) {
    return this.websiteFaqs.reorderWebsiteFaqs(reorderData);
  }

  // Contact Messages delegation methods
  async getContactMessages() {
    return this.contactMessages.getContactMessages();
  }

  async getContactMessage(id: number) {
    return this.contactMessages.getContactMessage(id);
  }

  async createContactMessage(message: any) {
    return this.contactMessages.createContactMessage(message);
  }

  async updateContactMessageStatus(id: number, status: string, adminNotes?: string) {
    return this.contactMessages.updateContactMessageStatus(id, status, adminNotes);
  }

  async deleteContactMessage(id: number) {
    return this.contactMessages.deleteContactMessage(id);
  }

  // ========== BUSINESS METHODS ==========
  // Business-related methods delegated to BusinessStorage

  async getBusinesses(params?: {
    categoryId?: number;
    search?: string;
    city?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return this.businessStorage.getBusinesses(params);
  }

  async getBusinessById(id: string) {
    return this.businessStorage.getBusinessById(id);
  }

  async getBusinessBySlug(slug: string) {
    return this.businessStorage.getBusinessBySlug(slug);
  }

  async getBusinessesByOwner(ownerId: string) {
    return this.businessStorage.getBusinessesByOwner(ownerId);
  }

  async getFeaturedBusinesses(limit: number = 10) {
    return this.businessStorage.getFeaturedBusinesses(limit);
  }

  async getRandomBusinesses(limit: number = 10) {
    return this.businessStorage.getRandomBusinesses(limit);
  }

  async getBusinessesByCategory(categoryId: number, limit?: number) {
    return this.businessStorage.getBusinessesByCategory(categoryId, limit);
  }

  async getBusinessesByCity(city: string, limit?: number) {
    return this.businessStorage.getBusinessesByCity(city, limit);
  }

  async searchBusinesses(searchTerm: string, limit?: number) {
    return this.businessStorage.searchBusinesses(searchTerm, limit);
  }

  async getPendingBusinesses() {
    return this.businessStorage.getPendingBusinesses();
  }

  async getBusinessStats() {
    return this.businessStorage.getBusinessStats();
  }

  async getBusinessesNearLocation(latitude: number, longitude: number, radiusKm: number = 10, limit: number = 20) {
    return this.businessStorage.getBusinessesNearLocation(latitude, longitude, radiusKm, limit);
  }

  async getCitiesWithBusinessCounts() {
    return this.businessStorage.getCitiesWithBusinessCounts();
  }

  async getUniqueCities() {
    return this.businessStorage.getUniqueCities();
  }

  async createBusiness(business: any) {
    return this.businessStorage.createBusiness(business);
  }

  async updateBusiness(id: string, updates: any) {
    return this.businessStorage.updateBusiness(id, updates);
  }

  async deleteBusiness(id: string) {
    return this.businessStorage.deleteBusiness(id);
  }

  async updateFeaturedStatus(id: string, featured: boolean) {
    return this.businessStorage.updateFeaturedStatus(id, featured);
  }

  async updateVerificationStatus(id: string, verified: boolean) {
    return this.businessStorage.updateVerificationStatus(id, verified);
  }

  async bulkUpdateBusinesses(ids: string[], updates: any) {
    return this.businessStorage.bulkUpdateBusinesses(ids, updates);
  }

  async bulkDeleteBusinesses(ids: string[]) {
    return this.businessStorage.bulkDeleteBusinesses(ids);
  }

  async generateUniqueSlug(baseSlug: string, excludePlaceId?: string) {
    return this.businessStorage.generateUniqueSlug(baseSlug, excludePlaceId);
  }

  generateSeoMetadata(business: any) {
    return this.businessStorage.generateSeoMetadata(business);
  }

  validateBusinessData(business: any) {
    return this.businessStorage.validateBusinessData(business);
  }

  sanitizeBusinessData(business: any) {
    return this.businessStorage.sanitizeBusinessData(business);
  }

  generateSeoSlug(title: string, city?: string, categoryName?: string) {
    return this.businessStorage.generateSeoSlug(title, city, categoryName);
  }

  // ========== CATEGORY METHODS ==========
  // Category-related methods delegated to CategoryStorage

  async getCategories() {
    return this.categories.getCategories();
  }

  async getCategoryBySlug(slug: string) {
    return this.categories.getCategoryBySlug(slug);
  }

  async createCategory(category: any) {
    return this.categories.createCategory(category);
  }

  async updateCategory(id: number, category: any) {
    return this.categories.updateCategory(id, category);
  }

  async deleteCategory(id: number) {
    return this.categories.deleteCategory(id);
  }

  // ========== SOCIAL MEDIA METHODS ==========
  // Social media-related methods delegated to SocialMediaStorage

  async getSocialMediaLinks(activeOnly: boolean = false) {
    return this.socialMediaStorage.getSocialMediaLinks(activeOnly);
  }

  async getSocialMediaLink(id: number) {
    return this.socialMediaStorage.getSocialMediaLinkById(id);
  }

  async getSocialMediaLinkById(id: number) {
    return this.socialMediaStorage.getSocialMediaLinkById(id);
  }

  async getSocialMediaLinkByPlatform(platform: string) {
    return this.socialMediaStorage.getSocialMediaLinkByPlatform(platform);
  }

  async createSocialMediaLink(linkData: any) {
    return this.socialMediaStorage.createSocialMediaLink(linkData);
  }

  async updateSocialMediaLink(id: number, updates: any) {
    return this.socialMediaStorage.updateSocialMediaLink(id, updates);
  }

  async deleteSocialMediaLink(id: number) {
    return this.socialMediaStorage.deleteSocialMediaLink(id);
  }

  async getActiveSocialMediaLinks() {
    return this.socialMediaStorage.getActiveSocialMediaLinks();
  }

  // ========== USER METHODS ==========
  // User-related methods delegated to UserStorage

  async getUserByEmail(email: string) {
    return this.users.getUserByEmail(email);
  }

  async getUser(id: string) {
    return this.users.getUser(id);
  }

  async createUser(userData: any) {
    return this.users.createUser(userData);
  }

  async upsertUser(userData: any) {
    return this.users.upsertUser(userData);
  }

  async updateUser(id: string, userData: any) {
    return this.users.updateUser(id, userData);
  }

  async updateUserPassword(id: string, hashedPassword: string) {
    return this.users.updateUserPassword(id, hashedPassword);
  }

  async deleteUser(id: string) {
    return this.users.deleteUser(id);
  }

  async getAllUsers() {
    return this.users.getAllUsers();
  }

  // ========== REVIEW METHODS ==========
  // Review-related methods delegated to ReviewsStorage

  async getApprovedReviewsByBusiness(businessId: string) {
    return this.reviewsStorage.getApprovedReviewsByBusiness(businessId);
  }

  async getReviewsByBusiness(businessId: string) {
    return this.reviewsStorage.getReviewsByBusiness(businessId);
  }
}

// Export singleton instance for backward compatibility
export const contentStorage = new ContentStorage();