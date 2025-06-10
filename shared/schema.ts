import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for email/password auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"), // user, business_owner, admin
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

// Businesses table
export const businesses = pgTable("businesses", {
  // Core identification
  id: serial("id").primaryKey(),
  placeid: text("placeid").unique(), // Google Places ID from CSV
  ownerId: varchar("owner_id").references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  
  // Basic info
  title: varchar("title").notNull(), // Changed from 'name' to 'title' to match CSV
  subtitle: text("subtitle"),
  description: text("description"),
  categoryname: varchar("categoryname"), // Category name from CSV
  categories: jsonb("categories"), // Categories JSON from CSV
  
  // SEO fields
  slug: varchar("slug").notNull().unique(),
  seotitle: text("seotitle"),
  seodescription: text("seodescription"),
  
  // Contact info
  phone: varchar("phone"),
  phoneunformatted: varchar("phoneunformatted"),
  website: varchar("website"),
  email: varchar("email"),
  
  // Location data
  address: text("address"),
  neighborhood: varchar("neighborhood"),
  street: varchar("street"),
  city: varchar("city"),
  postalcode: varchar("postalcode"),
  state: varchar("state"),
  countrycode: varchar("countrycode"),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lng: decimal("lng", { precision: 11, scale: 8 }),
  pluscode: varchar("pluscode"),
  locatedin: varchar("locatedin"),
  
  // Google-specific IDs
  fid: varchar("fid"),
  cid: varchar("cid"),
  kgmid: varchar("kgmid"),
  url: text("url"),
  searchpageurl: text("searchpageurl"),
  googlefoodurl: text("googlefoodurl"),
  
  // Business status
  claimthisbusiness: boolean("claimthisbusiness"),
  permanentlyclosed: boolean("permanentlyclosed"),
  temporarilyclosed: boolean("temporarilyclosed"),
  isadvertisement: boolean("isadvertisement"),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  active: boolean("active").default(true),
  
  // Pricing and reviews
  price: varchar("price"),
  totalscore: decimal("totalscore", { precision: 3, scale: 2 }),
  reviewscount: integer("reviewscount"),
  reviewsdistribution: jsonb("reviewsdistribution"),
  reviewstags: jsonb("reviewstags"),
  reviews: jsonb("reviews"),
  
  // Media
  imageurl: text("imageurl"),
  imagescount: integer("imagescount"),
  imagecategories: jsonb("imagecategories"),
  imageurls: jsonb("imageurls"),
  images: jsonb("images"),
  logo: jsonb("logo"),
  
  // Hours and additional info
  openinghours: jsonb("openinghours"),
  additionalopeninghours: jsonb("additionalopeninghours"),
  openinghoursbusinessconfirmationtext: text("openinghoursbusinessconfirmationtext"),
  additionalinfo: jsonb("additionalinfo"),
  amenities: jsonb("amenities"),
  accessibility: jsonb("accessibility"),
  planning: jsonb("planning"),
  
  // Reservations and booking
  reservetableurl: text("reservetableurl"),
  tablereservationlinks: jsonb("tablereservationlinks"),
  bookinglinks: jsonb("bookinglinks"),
  orderby: jsonb("orderby"),
  
  // Restaurant specific
  restaurantdata: jsonb("restaurantdata"),
  menu: text("menu"),
  
  // Hotel specific
  hotelads: jsonb("hotelads"),
  hotelstars: integer("hotelstars"),
  hoteldescription: text("hoteldescription"),
  checkindate: text("checkindate"),
  checkoutdate: text("checkoutdate"),
  similarhotelsnearby: jsonb("similarhotelsnearby"),
  hotelreviewsummary: jsonb("hotelreviewsummary"),
  
  // Additional data
  peoplealsosearch: jsonb("peoplealsosearch"),
  placestags: jsonb("placestags"),
  gasprices: jsonb("gasprices"),
  questionsandanswers: jsonb("questionsandanswers"),
  updatesfromcustomers: jsonb("updatesfromcustomers"),
  ownerupdates: jsonb("ownerupdates"),
  webresults: jsonb("webresults"),
  leadsenrichment: jsonb("leadsenrichment"),
  userplacenote: text("userplacenote"),
  faq: jsonb("faq"),
  
  // Metadata
  scrapedat: timestamp("scrapedat"),
  searchstring: text("searchstring"),
  language: varchar("language"),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  title: varchar("title"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Site customization table
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  category: varchar("category").notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema validations
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
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const csvBusinessSchema = insertBusinessSchema.partial().extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
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

// Extended types for API responses
export type BusinessWithCategory = Business & {
  category: Category;
  owner: Pick<User, 'firstName' | 'lastName' | 'email'>;
};

export type CategoryWithCount = Category & {
  businessCount: number;
};
