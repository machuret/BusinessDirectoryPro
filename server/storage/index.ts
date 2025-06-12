import { ComprehensiveStorage } from "./comprehensive-storage";

export const storage = new ComprehensiveStorage();
export { IStorage } from "./base-storage";
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