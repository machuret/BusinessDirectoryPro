// Main export for the refactored modular storage system
import { ComprehensiveStorage } from "./comprehensive-storage";

// Create a single instance to be used throughout the application
export const storage = new ComprehensiveStorage();

// Export the interface for type checking
export type { IStorage } from "./base-storage";

// Export all types for external use
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
} from "./base-storage";

// Export individual storage modules for advanced use cases
export { UserStorage } from "./user-storage";
export { BusinessStorage } from "./business";
export { CategoryStorage } from "./category-storage";
export { ComprehensiveStorage } from "./comprehensive-storage";