import { contentStringsStorage } from './content-strings.storage';
import { siteSettingsStorage } from './site-settings.storage';
import { menuItemsStorage } from './menu-items.storage';
import { pagesStorage } from './pages.storage';
import { websiteFaqsStorage } from './website-faqs.storage';
import { contactMessagesStorage } from './contact-messages.storage';

/**
 * ContentStorage - Refactored to use modular domain-specific storage classes
 * This class now delegates operations to focused storage implementations
 */
export class ContentStorage {
  constructor(
    private contentStrings = contentStringsStorage,
    private siteSettings = siteSettingsStorage,
    private menuItems = menuItemsStorage,
    private pages = pagesStorage,
    private websiteFaqs = websiteFaqsStorage,
    private contactMessages = contactMessagesStorage
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
}

// Export singleton instance for backward compatibility
export const contentStorage = new ContentStorage();