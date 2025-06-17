/**
 * Storage Layer Barrel Export
 * Provides centralized access to all storage modules
 */

// Import all storage classes and instances
import { ContentStringsStorage, contentStringsStorage } from './content-strings.storage';
import { SiteSettingsStorage, siteSettingsStorage } from './site-settings.storage';
import { MenuItemsStorage, menuItemsStorage } from './menu-items.storage';
import { PagesStorage, pagesStorage } from './pages.storage';
import { WebsiteFaqsStorage, websiteFaqsStorage } from './website-faqs.storage';
import { ContactMessagesStorage, contactMessagesStorage } from './contact-messages.storage';

// Export all storage classes and instances
export {
  ContentStringsStorage,
  contentStringsStorage,
  SiteSettingsStorage,
  siteSettingsStorage,
  MenuItemsStorage,
  menuItemsStorage,
  PagesStorage,
  pagesStorage,
  WebsiteFaqsStorage,
  websiteFaqsStorage,
  ContactMessagesStorage,
  contactMessagesStorage
};

/**
 * Centralized storage interface combining all domain-specific storages
 * This provides a single point of access for all storage operations
 */
export class UnifiedStorage {
  constructor(
    public contentStrings = contentStringsStorage,
    public siteSettings = siteSettingsStorage,
    public menuItems = menuItemsStorage,
    public pages = pagesStorage,
    public websiteFaqs = websiteFaqsStorage,
    public contactMessages = contactMessagesStorage
  ) {}
}

// Export singleton instance
export const unifiedStorage = new UnifiedStorage();

// Re-export the main ContentStorage class for backward compatibility
export { ContentStorage } from './content-storage';

// Export contentStorage instance as 'storage' for backward compatibility
export { contentStorage as storage } from './content-storage';