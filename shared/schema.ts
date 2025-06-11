import { pgTable, varchar, text, timestamp, serial, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session table for connect-pg-simple
export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  password: text("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: varchar("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  icon: varchar("icon").notNull(),
  color: varchar("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Businesses table - matching the database structure you provided
export const businesses = pgTable("businesses", {
  placeid: text("placeid").primaryKey(),
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  categoryname: text("categoryname"),
  categories: jsonb("categories"),
  price: text("price"),
  website: text("website"),
  phone: text("phone"),
  phoneunformatted: text("phoneunformatted"),
  menu: text("menu"),
  address: text("address"),
  neighborhood: text("neighborhood"),
  street: text("street"),
  city: text("city"),
  postalcode: text("postalcode"),
  state: text("state"),
  countrycode: text("countrycode"),
  lat: numeric("lat"),
  lng: numeric("lng"),
  pluscode: text("pluscode"),
  locatedin: text("locatedin"),
  fid: text("fid"),
  cid: text("cid"),
  kgmid: text("kgmid"),
  url: text("url"),
  searchpageurl: text("searchpageurl"),
  googlefoodurl: text("googlefoodurl"),
  claimthisbusiness: boolean("claimthisbusiness"),
  permanentlyclosed: boolean("permanentlyclosed"),
  temporarilyclosed: boolean("temporarilyclosed"),
  isadvertisement: boolean("isadvertisement"),
  featured: boolean("featured"),
  totalscore: numeric("totalscore"),
  reviewscount: integer("reviewscount"),
  reviewsdistribution: jsonb("reviewsdistribution"),
  reviewstags: jsonb("reviewstags"),
  reviews: jsonb("reviews"),
  imageurl: text("imageurl"),
  imagescount: integer("imagescount"),
  imagecategories: jsonb("imagecategories"),
  imageurls: jsonb("imageurls"),
  images: jsonb("images"),
  logo: jsonb("logo"),
  openinghours: jsonb("openinghours"),
  additionalopeninghours: jsonb("additionalopeninghours"),
  openinghoursbusinessconfirmationtext: text("openinghoursbusinessconfirmationtext"),
  additionalinfo: jsonb("additionalinfo"),
  amenities: jsonb("amenities"),
  accessibility: jsonb("accessibility"),
  planning: jsonb("planning"),
  reservetableurl: text("reservetableurl"),
  tablereservationlinks: jsonb("tablereservationlinks"),
  bookinglinks: jsonb("bookinglinks"),
  orderby: jsonb("orderby"),
  restaurantdata: jsonb("restaurantdata"),
  hotelads: jsonb("hotelads"),
  hotelstars: integer("hotelstars"),
  hoteldescription: text("hoteldescription"),
  checkindate: text("checkindate"),
  checkoutdate: text("checkoutdate"),
  similarhotelsnearby: jsonb("similarhotelsnearby"),
  hotelreviewsummary: jsonb("hotelreviewsummary"),
  peoplealsosearch: jsonb("peoplealsosearch"),
  placestags: jsonb("placestags"),
  gasprices: jsonb("gasprices"),
  questionsandanswers: jsonb("questionsandanswers"),
  updatesfromcustomers: jsonb("updatesfromcustomers"),
  ownerupdates: jsonb("ownerupdates"),
  webresults: jsonb("webresults"),
  leadsenrichment: jsonb("leadsenrichment"),
  userplacenote: text("userplacenote"),
  scrapedat: timestamp("scrapedat"),
  searchstring: text("searchstring"),
  language: text("language"),
  rank: integer("rank"),
  ownerid: text("ownerid").references(() => users.id),
  seotitle: text("seotitle"),
  slug: text("slug").notNull().unique(),
  seodescription: text("seodescription"),
  createdat: timestamp("createdat").defaultNow(),
  updatedat: timestamp("updatedat").defaultNow(),
  faq: jsonb("faq"),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  businessId: text("business_id").references(() => businesses.placeid),
  userId: varchar("user_id").references(() => users.id),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment"),
  status: text("status").default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => users.id),
});

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: varchar("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ownership claims table
export const ownershipClaims = pgTable("ownership_claims", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: text("business_id").notNull().references(() => businesses.placeid, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  message: text("message"), // User's claim message
  adminMessage: text("admin_message"), // Admin's response message
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu items table
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  position: text("position").notNull(), // header, footer
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  target: text("target").default("_self"), // _self, _blank
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pages table for CMS
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  status: varchar("status").notNull().default("draft"), // draft, published
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

// Website FAQ table
export const websiteFaq = pgTable("website_faq", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category").notNull().default("general"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema definitions for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  createdat: true,
  updatedat: true,
});

export const csvBusinessSchema = insertBusinessSchema.partial().extend({
  // Make placeid required for CSV import
  placeid: z.string().min(1),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  reviewedBy: true,
});

// Public review submission schema (for anonymous users)
export const publicReviewSchema = z.object({
  reviewerName: z.string().min(1, "Name is required"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOwnershipClaimSchema = createInsertSchema(ownershipClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertWebsiteFaqSchema = createInsertSchema(websiteFaq).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertOwnershipClaim = z.infer<typeof insertOwnershipClaimSchema>;
export type OwnershipClaim = typeof ownershipClaims.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertWebsiteFaq = z.infer<typeof insertWebsiteFaqSchema>;
export type WebsiteFaq = typeof websiteFaq.$inferSelect;

// Business with category info
export type BusinessWithCategory = Business & {
  category?: Category;
  owner?: Pick<User, 'firstName' | 'lastName' | 'email'>;
};

// Category with business count
export type CategoryWithCount = Category & {
  businessCount: number;
};