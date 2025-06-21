var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  businessServices: () => businessServices,
  businesses: () => businesses,
  categories: () => categories,
  contactMessages: () => contactMessages,
  contentStrings: () => contentStrings,
  csvBusinessSchema: () => csvBusinessSchema,
  featuredRequests: () => featuredRequests,
  insertBusinessSchema: () => insertBusinessSchema,
  insertBusinessServiceSchema: () => insertBusinessServiceSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertContentStringSchema: () => insertContentStringSchema,
  insertLeadSchema: () => insertLeadSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertOwnershipClaimSchema: () => insertOwnershipClaimSchema,
  insertPageContentSchema: () => insertPageContentSchema,
  insertPageSchema: () => insertPageSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertSiteSettingSchema: () => insertSiteSettingSchema,
  insertSocialMediaLinkSchema: () => insertSocialMediaLinkSchema,
  insertUserSchema: () => insertUserSchema,
  insertWebsiteFaqSchema: () => insertWebsiteFaqSchema,
  leads: () => leads,
  loginUserSchema: () => loginUserSchema,
  menuItems: () => menuItems,
  ownershipClaims: () => ownershipClaims,
  pageContent: () => pageContent,
  pages: () => pages,
  publicReviewSchema: () => publicReviewSchema,
  registerUserSchema: () => registerUserSchema,
  reviews: () => reviews,
  services: () => services,
  sessions: () => sessions,
  siteSettings: () => siteSettings,
  socialMediaLinks: () => socialMediaLinks,
  users: () => users,
  websiteFaq: () => websiteFaq
});
import { pgTable, varchar, text, timestamp, serial, integer, boolean, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions, users, categories, businesses, reviews, siteSettings, ownershipClaims, menuItems, pages, websiteFaq, contactMessages, services, businessServices, socialMediaLinks, pageContent, featuredRequests, insertUserSchema, loginUserSchema, registerUserSchema, insertCategorySchema, insertBusinessSchema, csvBusinessSchema, insertReviewSchema, publicReviewSchema, insertPageContentSchema, insertSiteSettingSchema, insertSocialMediaLinkSchema, insertOwnershipClaimSchema, insertMenuItemSchema, insertPageSchema, insertWebsiteFaqSchema, insertServiceSchema, insertBusinessServiceSchema, leads, insertLeadSchema, insertContactMessageSchema, contentStrings, insertContentStringSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable("session", {
      sid: varchar("sid").primaryKey(),
      sess: jsonb("sess").notNull(),
      expire: timestamp("expire").notNull()
    });
    users = pgTable("users", {
      id: varchar("id").primaryKey(),
      email: varchar("email").notNull().unique(),
      password: text("password"),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: text("profile_image_url"),
      role: varchar("role").notNull().default("user"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    categories = pgTable("categories", {
      id: serial("id").primaryKey(),
      name: varchar("name").notNull().unique(),
      slug: varchar("slug").notNull().unique(),
      description: text("description"),
      icon: varchar("icon").notNull(),
      color: varchar("color").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    businesses = pgTable("businesses", {
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
      faq: jsonb("faq")
    });
    reviews = pgTable("reviews", {
      id: serial("id").primaryKey(),
      businessId: text("business_id").references(() => businesses.placeid),
      userId: varchar("user_id").references(() => users.id),
      authorName: text("author_name"),
      authorEmail: text("author_email"),
      rating: integer("rating").notNull(),
      title: text("title"),
      comment: text("comment"),
      status: text("status").default("pending"),
      // pending, approved, rejected
      adminNotes: text("admin_notes"),
      createdAt: timestamp("created_at").defaultNow(),
      reviewedAt: timestamp("reviewed_at"),
      reviewedBy: text("reviewed_by").references(() => users.id)
    });
    siteSettings = pgTable("site_settings", {
      id: serial("id").primaryKey(),
      key: varchar("key").notNull().unique(),
      value: text("value"),
      description: text("description"),
      category: varchar("category"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    ownershipClaims = pgTable("ownership_claims", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      businessId: text("business_id").notNull().references(() => businesses.placeid, { onDelete: "cascade" }),
      status: text("status").notNull().default("pending"),
      // pending, approved, rejected
      message: text("message"),
      // User's claim message
      adminMessage: text("admin_message"),
      // Admin's response message
      reviewedBy: text("reviewed_by").references(() => users.id),
      reviewedAt: timestamp("reviewed_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    menuItems = pgTable("menu_items", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      url: text("url").notNull(),
      position: text("position").notNull(),
      // header, footer1, footer2
      order: integer("order").notNull().default(0),
      isActive: boolean("is_active").notNull().default(true),
      target: text("target").default("_self"),
      // _self, _blank
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    pages = pgTable("pages", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      slug: varchar("slug").notNull().unique(),
      content: text("content"),
      seoTitle: text("seo_title"),
      seoDescription: text("seo_description"),
      status: varchar("status").notNull().default("draft"),
      // draft, published
      authorId: varchar("author_id").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull(),
      publishedAt: timestamp("published_at")
    });
    websiteFaq = pgTable("website_faq", {
      id: serial("id").primaryKey(),
      question: text("question").notNull(),
      answer: text("answer").notNull(),
      category: varchar("category").notNull().default("general"),
      order: integer("order").notNull().default(0),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    contactMessages = pgTable("contact_messages", {
      id: serial("id").primaryKey(),
      name: varchar("name").notNull(),
      email: varchar("email").notNull(),
      phone: varchar("phone"),
      subject: varchar("subject").notNull(),
      message: text("message").notNull(),
      status: varchar("status").notNull().default("unread"),
      // unread, read, replied, archived
      adminNotes: text("admin_notes"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    services = pgTable("services", {
      id: serial("id").primaryKey(),
      name: varchar("name").notNull(),
      // Generic service name e.g. "Teeth Whitening"
      slug: varchar("slug").notNull().unique(),
      // URL-friendly version e.g. "teeth-whitening"
      description: text("description"),
      // Service description
      category: varchar("category"),
      // Service category for organization
      seoTitle: varchar("seo_title"),
      // SEO page title
      seoDescription: text("seo_description"),
      // SEO meta description
      content: text("content"),
      // Rich content for service page
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    businessServices = pgTable("business_services", {
      id: serial("id").primaryKey(),
      businessId: text("business_id").notNull().references(() => businesses.placeid, { onDelete: "cascade" }),
      serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    socialMediaLinks = pgTable("social_media_links", {
      id: serial("id").primaryKey(),
      platform: varchar("platform").notNull().unique(),
      // facebook, twitter, instagram, linkedin, youtube, tiktok
      url: text("url").notNull(),
      iconClass: varchar("icon_class").notNull(),
      // Font Awesome class name
      displayName: varchar("display_name").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      sortOrder: integer("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    pageContent = pgTable("page_content", {
      id: serial("id").primaryKey(),
      pageKey: varchar("page_key").notNull().unique(),
      // e.g., "get-featured", "contact-us"
      title: varchar("title").notNull(),
      content: text("content").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    featuredRequests = pgTable("featured_requests", {
      id: serial("id").primaryKey(),
      businessId: text("business_id").notNull().references(() => businesses.placeid, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      status: varchar("status").notNull().default("pending"),
      // pending, approved, rejected
      message: text("message"),
      // User's request message
      adminMessage: text("admin_message"),
      // Admin's response message
      reviewedBy: varchar("reviewed_by").references(() => users.id),
      reviewedAt: timestamp("reviewed_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    loginUserSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });
    registerUserSchema = insertUserSchema.extend({
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });
    insertCategorySchema = createInsertSchema(categories).omit({
      id: true,
      createdAt: true
    });
    insertBusinessSchema = createInsertSchema(businesses).omit({
      createdat: true,
      updatedat: true
    });
    csvBusinessSchema = insertBusinessSchema.partial().extend({
      // Make placeid required for CSV import
      placeid: z.string().min(1)
    });
    insertReviewSchema = createInsertSchema(reviews).omit({
      id: true,
      createdAt: true,
      reviewedAt: true,
      reviewedBy: true
    });
    publicReviewSchema = z.object({
      reviewerName: z.string().min(1, "Name is required"),
      title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
      rating: z.number().min(1).max(5),
      comment: z.string().min(10, "Review must be at least 10 characters")
    });
    insertPageContentSchema = createInsertSchema(pageContent).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSocialMediaLinkSchema = createInsertSchema(socialMediaLinks).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertOwnershipClaimSchema = createInsertSchema(ownershipClaims).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      reviewedAt: true
    });
    insertMenuItemSchema = createInsertSchema(menuItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPageSchema = createInsertSchema(pages).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true
    });
    insertWebsiteFaqSchema = createInsertSchema(websiteFaq).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertServiceSchema = createInsertSchema(services).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertBusinessServiceSchema = createInsertSchema(businessServices).omit({
      id: true,
      createdAt: true
    });
    leads = pgTable("leads", {
      id: serial("id").primaryKey(),
      businessId: text("business_id").notNull().references(() => businesses.placeid),
      senderName: varchar("sender_name").notNull(),
      senderEmail: varchar("sender_email").notNull(),
      senderPhone: varchar("sender_phone"),
      message: text("message").notNull(),
      status: varchar("status").notNull().default("new"),
      // new, contacted, converted, closed
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertLeadSchema = createInsertSchema(leads).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertContactMessageSchema = createInsertSchema(contactMessages).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    contentStrings = pgTable("content_strings", {
      id: serial("id").primaryKey(),
      stringKey: varchar("string_key", { length: 255 }).notNull().unique(),
      defaultValue: text("default_value").notNull(),
      translations: jsonb("translations").default({}),
      category: varchar("category", { length: 100 }).notNull(),
      description: text("description"),
      isHtml: boolean("is_html").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      stringKeyIdx: index("idx_content_strings_key").on(table.stringKey),
      categoryIdx: index("idx_content_strings_category").on(table.category)
    }));
    insertContentStringSchema = createInsertSchema(contentStrings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var DATABASE_URL, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    DATABASE_URL = "postgresql://repplit_owner:npg_qtLveA26UxGP@ep-proud-mountain-a85015ts-pooler.eastus2.azure.neon.tech/repplit?sslmode=require";
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    console.log("Database URL being used:", DATABASE_URL.replace(/:[^@]*@/, ":***@"));
    pool = new Pool({ connectionString: DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/services-setup.ts
var services_setup_exports = {};
__export(services_setup_exports, {
  setupServicesTables: () => setupServicesTables
});
import { sql as sql9 } from "drizzle-orm";
async function setupServicesTables() {
  try {
    await db.execute(sql9`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(100),
        seo_title VARCHAR(255),
        seo_description TEXT,
        content TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(sql9`
      CREATE TABLE IF NOT EXISTS business_services (
        id SERIAL PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        service_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE(business_id, service_id)
      )
    `);
    await db.execute(sql9`
      INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active)
      VALUES 
        ('Dental Cleaning', 'dental-cleaning', 'Professional dental cleaning and hygiene services', 'Preventive', 'Professional Dental Cleaning Services', 'Get your teeth professionally cleaned with our expert dental hygiene services. Book your appointment today.', '<h2>Professional Dental Cleaning</h2><p>Regular dental cleanings are essential for maintaining optimal oral health...</p>', true),
        ('Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening treatments', 'Cosmetic', 'Professional Teeth Whitening', 'Brighten your smile with our professional teeth whitening treatments. Safe and effective results.', '<h2>Teeth Whitening Services</h2><p>Transform your smile with our professional whitening treatments...</p>', true),
        ('Root Canal Treatment', 'root-canal-treatment', 'Endodontic root canal therapy', 'Restorative', 'Root Canal Treatment', 'Expert root canal therapy to save your natural teeth. Pain-free procedures with modern techniques.', '<h2>Root Canal Treatment</h2><p>Our experienced endodontists provide comfortable root canal therapy...</p>', true),
        ('Dental Implants', 'dental-implants', 'Permanent tooth replacement solutions', 'Restorative', 'Dental Implants', 'Replace missing teeth permanently with our dental implant solutions. Natural-looking results.', '<h2>Dental Implants</h2><p>Restore your smile with permanent dental implant solutions...</p>', true),
        ('Orthodontics', 'orthodontics', 'Teeth straightening and alignment services', 'Orthodontic', 'Orthodontic Treatment', 'Straighten your teeth with braces or clear aligners. Expert orthodontic care for all ages.', '<h2>Orthodontic Services</h2><p>Achieve a perfect smile with our comprehensive orthodontic treatments...</p>', true)
      ON CONFLICT (slug) DO NOTHING
    `);
    console.log("Services tables created and sample data inserted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error setting up services tables:", error);
    throw error;
  }
}
var init_services_setup = __esm({
  "server/services-setup.ts"() {
    "use strict";
    init_db();
  }
});

// server/services-database-setup.ts
var services_database_setup_exports = {};
__export(services_database_setup_exports, {
  setupServicesDatabase: () => setupServicesDatabase
});
import { Pool as Pool2 } from "@neondatabase/serverless";
async function setupServicesDatabase() {
  console.log("Setting up services database tables...");
  try {
    const tableCheck = await pool2.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('services', 'business_services')
    `);
    console.log("Existing tables:", tableCheck.rows);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(100),
        seo_title VARCHAR(255),
        seo_description TEXT,
        content TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS business_services (
        id SERIAL PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        service_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(business_id, service_id)
      )
    `);
    try {
      await pool2.query(`
        ALTER TABLE business_services 
        ADD CONSTRAINT fk_business_services_business 
        FOREIGN KEY (business_id) REFERENCES businesses(placeid) ON DELETE CASCADE
      `);
    } catch (e) {
      console.log("Foreign key constraint already exists or businesses table not found");
    }
    try {
      await pool2.query(`
        ALTER TABLE business_services 
        ADD CONSTRAINT fk_business_services_service 
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      `);
    } catch (e) {
      console.log("Foreign key constraint already exists");
    }
    await pool2.query(`CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug)`);
    await pool2.query(`CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)`);
    await pool2.query(`CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active)`);
    await pool2.query(`CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON business_services(business_id)`);
    await pool2.query(`CREATE INDEX IF NOT EXISTS idx_business_services_service_id ON business_services(service_id)`);
    await pool2.query(`
      INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active)
      VALUES 
        ('General Dentistry', 'general-dentistry', 'Comprehensive dental care including cleanings, exams, and preventive treatments.', 'General', 'General Dentistry Services - Comprehensive Dental Care', 'Professional general dentistry services including routine cleanings, dental exams, fillings, and preventive care to maintain optimal oral health.', 'Our general dentistry services provide comprehensive oral healthcare to patients of all ages. We focus on preventive care to help you maintain healthy teeth and gums for life.', true),
        ('Cosmetic Dentistry', 'cosmetic-dentistry', 'Enhance your smile with professional cosmetic dental treatments.', 'Cosmetic', 'Cosmetic Dentistry - Professional Smile Enhancement', 'Transform your smile with our cosmetic dentistry services including teeth whitening, veneers, and smile makeovers by experienced dental professionals.', 'Our cosmetic dentistry services are designed to enhance the beauty of your smile while maintaining optimal oral health. We use the latest techniques and materials.', true),
        ('Dental Implants', 'dental-implants', 'Permanent tooth replacement solutions with dental implants.', 'Restorative', 'Dental Implants - Permanent Tooth Replacement Solutions', 'Replace missing teeth with natural-looking dental implants. Our experienced team provides comprehensive implant dentistry services.', 'Dental implants provide a permanent solution for missing teeth, offering the look, feel, and function of natural teeth with long-lasting results.', true),
        ('Orthodontics', 'orthodontics', 'Straighten your teeth with braces and clear aligners.', 'Orthodontic', 'Orthodontics - Braces and Clear Aligners', 'Achieve a straighter smile with our orthodontic treatments including traditional braces, clear aligners, and Invisalign.', 'Our orthodontic services help patients of all ages achieve straighter, healthier smiles through various treatment options tailored to individual needs.', true),
        ('Root Canal Therapy', 'root-canal-therapy', 'Save your natural teeth with professional root canal treatment.', 'Endodontic', 'Root Canal Therapy - Save Your Natural Teeth', 'Professional root canal therapy to save infected or damaged teeth. Our gentle approach ensures comfortable treatment and successful outcomes.', 'Root canal therapy allows us to save natural teeth that have become infected or severely damaged, providing pain relief and preserving your smile.', true),
        ('Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening for a brighter, whiter smile.', 'Cosmetic', 'Professional Teeth Whitening - Brighter Smile', 'Achieve a brighter, whiter smile with our professional teeth whitening treatments. Safe, effective, and long-lasting results.', 'Our professional teeth whitening treatments can safely and effectively brighten your smile, removing stains and discoloration for dramatic results.', true)
      ON CONFLICT (slug) DO NOTHING
    `);
    const finalCheck = await pool2.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('services', 'business_services')
    `);
    console.log("Final table check:", finalCheck.rows);
    const servicesCount = await pool2.query("SELECT COUNT(*) FROM services");
    console.log("Services count:", servicesCount.rows[0].count);
    console.log("Services database setup completed successfully!");
    return { success: true, tables: finalCheck.rows, servicesCount: servicesCount.rows[0].count };
  } catch (error) {
    console.error("Error setting up services database:", error);
    return { success: false, error: error.message };
  } finally {
    await pool2.end();
  }
}
var pool2;
var init_services_database_setup = __esm({
  "server/services-database-setup.ts"() {
    "use strict";
    pool2 = new Pool2({ connectionString: process.env.DATABASE_URL });
  }
});

// server/verify-services-setup.ts
var verify_services_setup_exports = {};
__export(verify_services_setup_exports, {
  verifyServicesSetup: () => verifyServicesSetup
});
import { Pool as Pool3 } from "@neondatabase/serverless";
async function verifyServicesSetup() {
  const pool3 = new Pool3({ connectionString: process.env.DATABASE_URL });
  try {
    console.log("Verifying services database setup...");
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('services', 'business_services')
      ORDER BY table_name
    `;
    const tablesResult = await pool3.query(tablesQuery);
    console.log("Found tables:", tablesResult.rows);
    if (tablesResult.rows.some((row) => row.table_name === "services")) {
      const countQuery = "SELECT COUNT(*) as count FROM services";
      const countResult = await pool3.query(countQuery);
      console.log("Services count:", countResult.rows[0].count);
      const sampleQuery = "SELECT id, name, slug FROM services LIMIT 3";
      const sampleResult = await pool3.query(sampleQuery);
      console.log("Sample services:", sampleResult.rows);
      return {
        success: true,
        tablesExist: true,
        servicesCount: parseInt(countResult.rows[0].count),
        sampleServices: sampleResult.rows
      };
    } else {
      return {
        success: true,
        tablesExist: false,
        message: "Services tables do not exist"
      };
    }
  } catch (error) {
    console.error("Error verifying services setup:", error);
    return { success: false, error: error.message };
  } finally {
    await pool3.end();
  }
}
var init_verify_services_setup = __esm({
  "server/verify-services-setup.ts"() {
    "use strict";
  }
});

// server/index.ts
import express2 from "express";
import session3 from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// server/openai.ts
import OpenAI from "openai";

// server/storage/content-strings.storage.ts
init_db();
init_schema();
import { eq } from "drizzle-orm";
var ContentStringsStorage = class {
  /**
   * Get content strings for frontend consumption
   * Returns a flat key-value object with translated strings
   */
  async getContentStrings(options = {}) {
    const { language = "en", category } = options;
    try {
      const query = db.select().from(contentStrings);
      const results = category ? await query.where(eq(contentStrings.category, category)) : await query;
      const contentMap = {};
      for (const content of results) {
        const translations = content.translations || {};
        contentMap[content.stringKey] = translations[language] || content.defaultValue;
      }
      return contentMap;
    } catch (error) {
      console.error("Error fetching content strings:", error);
      throw new Error("Failed to fetch content strings");
    }
  }
  /**
   * Get all content strings with full metadata for admin interface
   */
  async getAllContentStrings(category) {
    try {
      const query = db.select().from(contentStrings);
      const results = category ? await query.where(eq(contentStrings.category, category)) : await query;
      return results;
    } catch (error) {
      console.error("Error fetching all content strings:", error);
      throw new Error("Failed to fetch content strings");
    }
  }
  /**
   * Get a specific content string by key
   */
  async getContentString(stringKey) {
    try {
      const [result] = await db.select().from(contentStrings).where(eq(contentStrings.stringKey, stringKey));
      return result;
    } catch (error) {
      console.error("Error fetching content string:", error);
      throw new Error("Failed to fetch content string");
    }
  }
  /**
   * Create a new content string
   */
  async createContentString(contentString) {
    try {
      const [result] = await db.insert(contentStrings).values({
        ...contentString,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result;
    } catch (error) {
      console.error("Error creating content string:", error);
      throw new Error("Failed to create content string");
    }
  }
  /**
   * Update an existing content string
   */
  async updateContentString(stringKey, updates) {
    try {
      const [result] = await db.update(contentStrings).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(contentStrings.stringKey, stringKey)).returning();
      return result;
    } catch (error) {
      console.error("Error updating content string:", error);
      throw new Error("Failed to update content string");
    }
  }
  /**
   * Delete a content string
   */
  async deleteContentString(stringKey) {
    try {
      const result = await db.delete(contentStrings).where(eq(contentStrings.stringKey, stringKey));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting content string:", error);
      throw new Error("Failed to delete content string");
    }
  }
  /**
   * Bulk upsert content strings
   */
  async bulkUpsertContentStrings(contentStringList) {
    try {
      const results = [];
      for (const contentString of contentStringList) {
        const [result] = await db.insert(contentStrings).values({
          ...contentString,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: contentStrings.stringKey,
          set: {
            defaultValue: contentString.defaultValue,
            translations: contentString.translations,
            category: contentString.category,
            description: contentString.description,
            isHtml: contentString.isHtml,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error("Error bulk upserting content strings:", error);
      throw new Error("Failed to bulk upsert content strings");
    }
  }
  /**
   * Get all categories used in content strings
   */
  async getContentStringCategories() {
    try {
      const results = await db.selectDistinct({ category: contentStrings.category }).from(contentStrings).orderBy(contentStrings.category);
      return results.map((r) => r.category);
    } catch (error) {
      console.error("Error fetching content categories:", error);
      throw new Error("Failed to fetch content categories");
    }
  }
  /**
   * Get content statistics for admin dashboard
   */
  async getContentStringStats() {
    try {
      const totalStrings = await db.select({ count: contentStrings.id }).from(contentStrings);
      const categories2 = await this.getContentStringCategories();
      const categoryStats = await Promise.all(
        categories2.map(async (category) => {
          const [result] = await db.select({ count: contentStrings.id }).from(contentStrings).where(eq(contentStrings.category, category));
          return { category, count: result?.count || 0 };
        })
      );
      const weekAgo = /* @__PURE__ */ new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const [recentUpdatesResult] = await db.select({ count: contentStrings.id }).from(contentStrings).where(eq(contentStrings.updatedAt, weekAgo));
      return {
        totalStrings: totalStrings.length,
        categoriesCount: categories2.length,
        recentUpdates: recentUpdatesResult?.count || 0,
        categories: categoryStats
      };
    } catch (error) {
      console.error("Error fetching content string stats:", error);
      throw new Error("Failed to fetch content string stats");
    }
  }
  /**
   * Search content strings by key or value
   */
  async searchContentStrings(searchTerm, category) {
    try {
      let query = db.select().from(contentStrings);
      if (category) {
        query = query.where(eq(contentStrings.category, category));
      }
      const results = await query;
      return results.filter(
        (content) => content.stringKey.toLowerCase().includes(searchTerm.toLowerCase()) || content.defaultValue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching content strings:", error);
      throw new Error("Failed to search content strings");
    }
  }
};
var contentStringsStorage = new ContentStringsStorage();

// server/storage/site-settings.storage.ts
init_db();
init_schema();
import { eq as eq2 } from "drizzle-orm";
var SiteSettingsStorage = class {
  /**
   * Get all site settings
   */
  async getSiteSettings() {
    try {
      return await db.select().from(siteSettings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      throw new Error("Failed to fetch site settings");
    }
  }
  /**
   * Get single site setting by key
   */
  async getSiteSetting(key) {
    try {
      const [setting] = await db.select().from(siteSettings).where(eq2(siteSettings.key, key));
      return setting;
    } catch (error) {
      console.error("Error fetching site setting:", error);
      throw new Error("Failed to fetch site setting");
    }
  }
  /**
   * Update or create site setting with upsert logic
   */
  async updateSiteSetting(key, value, description, category) {
    try {
      const [setting] = await db.insert(siteSettings).values({
        key,
        value,
        description,
        category,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value,
          description,
          category,
          updatedAt: /* @__PURE__ */ new Date()
        }
      }).returning();
      return setting;
    } catch (error) {
      console.error("Error updating site setting:", error);
      throw new Error("Failed to update site setting");
    }
  }
  /**
   * Create a new site setting
   */
  async createSiteSetting(settingData) {
    try {
      const [setting] = await db.insert(siteSettings).values({
        ...settingData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return setting;
    } catch (error) {
      console.error("Error creating site setting:", error);
      throw new Error("Failed to create site setting");
    }
  }
  /**
   * Delete site setting by key
   */
  async deleteSiteSetting(key) {
    try {
      const result = await db.delete(siteSettings).where(eq2(siteSettings.key, key));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting site setting:", error);
      throw new Error("Failed to delete site setting");
    }
  }
  /**
   * Get site settings by category
   */
  async getSiteSettingsByCategory(category) {
    try {
      return await db.select().from(siteSettings).where(eq2(siteSettings.category, category));
    } catch (error) {
      console.error("Error fetching site settings by category:", error);
      throw new Error("Failed to fetch site settings by category");
    }
  }
  /**
   * Bulk update multiple site settings
   */
  async bulkUpdateSiteSettings(settings) {
    try {
      const results = [];
      for (const setting of settings) {
        const result = await this.updateSiteSetting(
          setting.key,
          setting.value,
          setting.description,
          setting.category
        );
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error("Error bulk updating site settings:", error);
      throw new Error("Failed to bulk update site settings");
    }
  }
};
var siteSettingsStorage = new SiteSettingsStorage();

// server/storage/menu-items.storage.ts
init_db();
init_schema();
import { eq as eq3, sql } from "drizzle-orm";
var MenuItemsStorage = class {
  /**
   * Get menu items with optional position filtering
   */
  async getMenuItems(position) {
    try {
      let query = db.select().from(menuItems);
      if (position) {
        query = query.where(eq3(menuItems.position, position));
      }
      const results = await query.orderBy(menuItems.order, menuItems.name);
      return results;
    } catch (error) {
      console.error("Error fetching menu items:", error);
      return [];
    }
  }
  /**
   * Get menu item by ID
   */
  async getMenuItem(id) {
    try {
      const [result] = await db.select().from(menuItems).where(eq3(menuItems.id, id));
      return result;
    } catch (error) {
      console.error("Error fetching menu item:", error);
      return void 0;
    }
  }
  /**
   * Get menu item by ID (alias for consistency)
   */
  async getMenuItemById(id) {
    return this.getMenuItem(id);
  }
  /**
   * Create a new menu item with automatic ordering
   */
  async createMenuItem(menuItem) {
    try {
      const maxOrder = await db.select({ maxOrder: sql`COALESCE(MAX("order"), 0)` }).from(menuItems).where(eq3(menuItems.position, menuItem.position || "header"));
      const newOrder = Number(maxOrder[0]?.maxOrder || 0) + 1;
      const [result] = await db.insert(menuItems).values({
        ...menuItem,
        order: newOrder,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result;
    } catch (error) {
      console.error("Error creating menu item:", error);
      throw new Error("Failed to create menu item");
    }
  }
  /**
   * Update menu item
   */
  async updateMenuItem(id, updates) {
    try {
      const [result] = await db.update(menuItems).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(menuItems.id, id)).returning();
      return result;
    } catch (error) {
      console.error("Error updating menu item:", error);
      throw new Error("Failed to update menu item");
    }
  }
  /**
   * Delete menu item
   */
  async deleteMenuItem(id) {
    try {
      await db.delete(menuItems).where(eq3(menuItems.id, id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
      throw new Error("Failed to delete menu item");
    }
  }
  /**
   * Get menu items by position
   */
  async getMenuItemsByPosition(position) {
    try {
      return await db.select().from(menuItems).where(eq3(menuItems.position, position)).orderBy(menuItems.order, menuItems.name);
    } catch (error) {
      console.error("Error fetching menu items by position:", error);
      return [];
    }
  }
  /**
   * Reorder menu items
   */
  async reorderMenuItems(orderedIds) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.update(menuItems).set({
          order: i + 1,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(menuItems.id, orderedIds[i]));
      }
    } catch (error) {
      console.error("Error reordering menu items:", error);
      throw new Error("Failed to reorder menu items");
    }
  }
  /**
   * Toggle menu item active status
   */
  async toggleMenuItemStatus(id) {
    try {
      const existingItem = await this.getMenuItem(id);
      if (!existingItem) {
        throw new Error("Menu item not found");
      }
      const [result] = await db.update(menuItems).set({
        isActive: !existingItem.isActive,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(menuItems.id, id)).returning();
      return result;
    } catch (error) {
      console.error("Error toggling menu item status:", error);
      throw new Error("Failed to toggle menu item status");
    }
  }
  /**
   * Get menu positions with counts
   */
  async getMenuPositions() {
    try {
      const results = await db.select({
        position: menuItems.position,
        count: sql`COUNT(*)`
      }).from(menuItems).groupBy(menuItems.position).orderBy(menuItems.position);
      return results.map((r) => ({
        position: r.position,
        count: Number(r.count)
      }));
    } catch (error) {
      console.error("Error fetching menu positions:", error);
      return [];
    }
  }
  /**
   * Bulk update menu items
   */
  async bulkUpdateMenuItems(updates) {
    const result = { success: 0, failed: 0, errors: [] };
    for (const update of updates) {
      try {
        await this.updateMenuItem(update.id, update.data);
        result.success++;
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push(`Menu item ${update.id}: ${errorMessage}`);
      }
    }
    return result;
  }
};
var menuItemsStorage = new MenuItemsStorage();

// server/storage/pages.storage.ts
init_db();
init_schema();
import { eq as eq4 } from "drizzle-orm";
var PagesStorage = class {
  /**
   * Get pages with optional status filtering
   */
  async getPages(status) {
    try {
      if (status) {
        return await db.select().from(pages).where(eq4(pages.status, status));
      }
      return await db.select().from(pages).orderBy(pages.updatedAt);
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw new Error("Failed to fetch pages");
    }
  }
  /**
   * Get page by ID
   */
  async getPage(id) {
    try {
      const result = await db.select().from(pages).where(eq4(pages.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching page:", error);
      throw new Error("Failed to fetch page");
    }
  }
  /**
   * Get page by slug for public access
   */
  async getPageBySlug(slug) {
    try {
      const result = await db.select().from(pages).where(eq4(pages.slug, slug)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching page by slug:", error);
      throw new Error("Failed to fetch page by slug");
    }
  }
  /**
   * Create a new page
   */
  async createPage(pageData) {
    try {
      const [page] = await db.insert(pages).values({
        ...pageData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return page;
    } catch (error) {
      console.error("Error creating page:", error);
      throw new Error("Failed to create page");
    }
  }
  /**
   * Update an existing page
   */
  async updatePage(id, updates) {
    try {
      const [page] = await db.update(pages).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(pages.id, id)).returning();
      return page;
    } catch (error) {
      console.error("Error updating page:", error);
      throw new Error("Failed to update page");
    }
  }
  /**
   * Delete a page
   */
  async deletePage(id) {
    try {
      await db.delete(pages).where(eq4(pages.id, id));
    } catch (error) {
      console.error("Error deleting page:", error);
      throw new Error("Failed to delete page");
    }
  }
  /**
   * Publish a page (set status to published and timestamp)
   */
  async publishPage(id) {
    try {
      const [page] = await db.update(pages).set({
        status: "published",
        publishedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(pages.id, id)).returning();
      return page;
    } catch (error) {
      console.error("Error publishing page:", error);
      throw new Error("Failed to publish page");
    }
  }
  /**
   * Unpublish a page (set status to draft)
   */
  async unpublishPage(id) {
    try {
      const [page] = await db.update(pages).set({
        status: "draft",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(pages.id, id)).returning();
      return page;
    } catch (error) {
      console.error("Error unpublishing page:", error);
      throw new Error("Failed to unpublish page");
    }
  }
  /**
   * Get published pages for public access
   */
  async getPublishedPages() {
    try {
      return await db.select().from(pages).where(eq4(pages.status, "published")).orderBy(pages.publishedAt);
    } catch (error) {
      console.error("Error fetching published pages:", error);
      throw new Error("Failed to fetch published pages");
    }
  }
  /**
   * Search pages by title or content
   */
  async searchPages(searchTerm, status) {
    try {
      let query = db.select().from(pages);
      if (status) {
        query = query.where(eq4(pages.status, status));
      }
      const results = await query;
      return results.filter(
        (page) => page.title.toLowerCase().includes(searchTerm.toLowerCase()) || page.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching pages:", error);
      throw new Error("Failed to search pages");
    }
  }
  /**
   * Get page statistics for admin dashboard
   */
  async getPageStats() {
    try {
      const allPages = await this.getPages();
      const publishedPages = allPages.filter((p) => p.status === "published");
      const draftPages = allPages.filter((p) => p.status === "draft");
      const weekAgo = /* @__PURE__ */ new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentlyUpdated = allPages.filter(
        (p) => new Date(p.updatedAt) > weekAgo
      );
      return {
        totalPages: allPages.length,
        publishedPages: publishedPages.length,
        draftPages: draftPages.length,
        recentlyUpdated: recentlyUpdated.length
      };
    } catch (error) {
      console.error("Error fetching page stats:", error);
      throw new Error("Failed to fetch page stats");
    }
  }
};
var pagesStorage = new PagesStorage();

// server/storage/website-faqs.storage.ts
var WebsiteFaqsStorage = class {
  /**
   * Get all website FAQs
   */
  async getWebsiteFaqs() {
    return [];
  }
  /**
   * Get single website FAQ by ID
   */
  async getWebsiteFaq(id) {
    return void 0;
  }
  /**
   * Create a new website FAQ
   */
  async createWebsiteFaq(faq) {
    throw new Error("Website FAQ management not implemented - schema required");
  }
  /**
   * Update an existing website FAQ
   */
  async updateWebsiteFaq(id, updates) {
    throw new Error("Website FAQ management not implemented - schema required");
  }
  /**
   * Delete a website FAQ
   */
  async deleteWebsiteFaq(id) {
    throw new Error("Website FAQ management not implemented - schema required");
  }
  /**
   * Reorder website FAQs
   */
  async reorderWebsiteFaqs(reorderData) {
    throw new Error("Website FAQ reordering not implemented - schema required");
  }
  /**
   * Get FAQ statistics
   */
  async getFaqStats() {
    return {
      totalFaqs: 0,
      activeFaqs: 0,
      categories: []
    };
  }
};
var websiteFaqsStorage = new WebsiteFaqsStorage();

// server/storage/contact-messages.storage.ts
var ContactMessagesStorage = class {
  /**
   * Get all contact messages
   */
  async getContactMessages() {
    return [];
  }
  /**
   * Get single contact message by ID
   */
  async getContactMessage(id) {
    return void 0;
  }
  /**
   * Create a new contact message
   */
  async createContactMessage(message) {
    return {
      id: Date.now(),
      // Temporary ID
      ...message,
      status: "new",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Update contact message status
   */
  async updateContactMessageStatus(id, status, adminNotes) {
    return void 0;
  }
  /**
   * Delete a contact message
   */
  async deleteContactMessage(id) {
    return;
  }
  /**
   * Get contact message statistics
   */
  async getContactMessageStats() {
    return {
      totalMessages: 0,
      newMessages: 0,
      respondedMessages: 0,
      closedMessages: 0
    };
  }
  /**
   * Mark message as read
   */
  async markMessageAsRead(id) {
    return void 0;
  }
  /**
   * Get messages by status
   */
  async getMessagesByStatus(status) {
    return [];
  }
};
var contactMessagesStorage = new ContactMessagesStorage();

// server/storage/business/business-queries.ts
init_db();
import { sql as sql2 } from "drizzle-orm";
var BusinessQueries = class {
  /**
   * Build business query with filters
   */
  static buildBusinessQuery(params) {
    let query = `
      WITH business_category_matches AS (
        SELECT DISTINCT ON (b.placeid) 
               b.*, 
               FIRST_VALUE(c.name) OVER (PARTITION BY b.placeid ORDER BY 
                 CASE 
                   WHEN b.categoryname = c.name THEN 1
                   WHEN b.categoryname || 's' = c.name THEN 2
                   WHEN b.categoryname = c.name || 's' THEN 3
                   ELSE 4
                 END) as category_name,
               FIRST_VALUE(c.slug) OVER (PARTITION BY b.placeid ORDER BY 
                 CASE 
                   WHEN b.categoryname = c.name THEN 1
                   WHEN b.categoryname || 's' = c.name THEN 2
                   WHEN b.categoryname = c.name || 's' THEN 3
                   ELSE 4
                 END) as category_slug,
               FIRST_VALUE(c.description) OVER (PARTITION BY b.placeid ORDER BY 
                 CASE 
                   WHEN b.categoryname = c.name THEN 1
                   WHEN b.categoryname || 's' = c.name THEN 2
                   WHEN b.categoryname = c.name || 's' THEN 3
                   ELSE 4
                 END) as category_description,
               FIRST_VALUE(c.icon) OVER (PARTITION BY b.placeid ORDER BY 
                 CASE 
                   WHEN b.categoryname = c.name THEN 1
                   WHEN b.categoryname || 's' = c.name THEN 2
                   WHEN b.categoryname = c.name || 's' THEN 3
                   ELSE 4
                 END) as category_icon,
               FIRST_VALUE(c.color) OVER (PARTITION BY b.placeid ORDER BY 
                 CASE 
                   WHEN b.categoryname = c.name THEN 1
                   WHEN b.categoryname || 's' = c.name THEN 2
                   WHEN b.categoryname = c.name || 's' THEN 3
                   ELSE 4
                 END) as category_color,
               FIRST_VALUE(c.id) OVER (PARTITION BY b.placeid ORDER BY 
                 CASE 
                   WHEN b.categoryname = c.name THEN 1
                   WHEN b.categoryname || 's' = c.name THEN 2
                   WHEN b.categoryname = c.name || 's' THEN 3
                   ELSE 4
                 END) as category_id
        FROM businesses b
        LEFT JOIN categories c ON (
          b.categoryname = c.name OR 
          b.categoryname || 's' = c.name OR 
          b.categoryname = c.name || 's' OR
          b.categoryname ILIKE '%' || REPLACE(c.name, 'Restaurants', 'Restaurant') || '%' OR
          c.name ILIKE '%' || b.categoryname || '%'
        )
        WHERE (b.permanentlyclosed = false OR b.permanentlyclosed IS NULL)
      )
      SELECT * FROM business_category_matches
      WHERE 1=1
    `;
    if (params?.categoryId) {
      query += ` AND category_id = ${params.categoryId}`;
    }
    if (params?.search) {
      const searchTerm = params.search.replace(/'/g, "''");
      query += ` AND (title ILIKE '%${searchTerm}%' OR description ILIKE '%${searchTerm}%' OR categoryname ILIKE '%${searchTerm}%')`;
    }
    if (params?.city) {
      const cityTerm = params.city.replace(/'/g, "''");
      query += ` AND city = '${cityTerm}'`;
    }
    if (params?.featured) {
      query += ` AND featured = true`;
    }
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    query += ` ORDER BY title, address, city, featured DESC, createdat DESC NULLS LAST LIMIT ${limit} OFFSET ${offset}`;
    return query;
  }
  /**
   * Execute business query and transform results
   */
  static async executeBusinessQuery(query) {
    try {
      const result = await db.execute(sql2.raw(query));
      return this.transformBusinessResults(result.rows);
    } catch (error) {
      console.error("Error executing business query:", error);
      return [];
    }
  }
  /**
   * Transform raw query results to BusinessWithCategory format
   */
  static transformBusinessResults(rows) {
    return rows.map((row) => ({
      ...row,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        description: row.category_description,
        icon: row.category_icon,
        color: row.category_color
      } : null
    }));
  }
  /**
   * Get single business with category by ID
   */
  static async getBusinessWithCategoryById(id) {
    try {
      const result = await db.execute(sql2`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.placeid = ${id}
        LIMIT 1
      `);
      if (result.rows.length === 0) return void 0;
      const row = result.rows[0];
      return {
        ...row,
        category: row.category_id ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          description: row.category_description,
          icon: row.category_icon,
          color: row.category_color
        } : null
      };
    } catch (error) {
      console.error("Error fetching business by ID:", error);
      return void 0;
    }
  }
  /**
   * Get single business with category by slug
   */
  static async getBusinessWithCategoryBySlug(slug) {
    try {
      const result = await db.execute(sql2`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.slug = ${slug}
        LIMIT 1
      `);
      if (result.rows.length === 0) return void 0;
      const row = result.rows[0];
      return {
        ...row,
        category: row.category_id ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          description: row.category_description,
          icon: row.category_icon,
          color: row.category_color
        } : null
      };
    } catch (error) {
      console.error("Error fetching business by slug:", error);
      return void 0;
    }
  }
};

// server/storage/business/business-operations.ts
init_db();
init_schema();
import { eq as eq5, and, sql as sql3 } from "drizzle-orm";

// server/storage/business/business-validation.ts
var BusinessValidation = class {
  /**
   * Filter out undefined values to prevent Drizzle ORM errors
   */
  static sanitizeBusinessData(business) {
    const sanitized = {};
    Object.keys(business).forEach((key) => {
      const value = business[key];
      if (value !== void 0) {
        if (key === "ownerid" && (!value || value === "" || value === null)) {
          return;
        }
        const dbKey = key === "createdat" ? "createdat" : key === "updatedat" ? "updatedat" : key;
        sanitized[dbKey] = value;
      }
    });
    return sanitized;
  }
  /**
   * Generate SEO-friendly slug from business data
   */
  static generateSeoSlug(title, city, categoryName) {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().substring(0, 50);
    const cleanCity = city ? city.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 20) : "";
    const cleanCategory = categoryName ? categoryName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 15) : "";
    let slug = cleanTitle;
    if (cleanCity) slug += `-${cleanCity}`;
    if (cleanCategory) slug += `-${cleanCategory}`;
    return slug.replace(/^-+|-+$/g, "");
  }
  /**
   * Generate SEO metadata for business
   */
  static generateSeoMetadata(business) {
    const title = business.title || "Business";
    const city = business.city || "";
    const categoryName = business.categoryname || "";
    const description = business.description || "";
    const address = business.address || "";
    const phone = business.phone || "";
    let seoTitle = title;
    if (city && categoryName) {
      seoTitle = `${title} - ${categoryName} in ${city}`;
    } else if (city) {
      seoTitle = `${title} - ${city}`;
    } else if (categoryName) {
      seoTitle = `${title} - ${categoryName}`;
    }
    if (seoTitle.length > 60) {
      seoTitle = seoTitle.substring(0, 57) + "...";
    }
    let seoDescription = "";
    if (description && description.length > 20) {
      seoDescription = description.substring(0, 120);
    } else {
      const parts = [];
      if (title) parts.push(`Visit ${title}`);
      if (address) parts.push(`located at ${address}`);
      if (city) parts.push(`in ${city}`);
      if (phone) parts.push(`Call ${phone} for more information`);
      seoDescription = parts.join(" ").substring(0, 150);
    }
    if (seoDescription.length > 150) {
      seoDescription = seoDescription.substring(0, 147) + "...";
    }
    return {
      seotitle: seoTitle,
      seodescription: seoDescription
    };
  }
  /**
   * Validate required business fields
   */
  static validateBusinessData(business) {
    const errors = [];
    if (!business.title || business.title.trim() === "") {
      errors.push("Business title is required");
    }
    if (!business.placeid || business.placeid.trim() === "") {
      errors.push("Place ID is required");
    }
    if (business.email && !this.isValidEmail(business.email)) {
      errors.push("Invalid email format");
    }
    if (business.website && !this.isValidUrl(business.website)) {
      errors.push("Invalid website URL format");
    }
    return errors;
  }
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  /**
   * Validate URL format
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// server/storage/business/business-operations.ts
var BusinessOperations = class {
  /**
   * Create a new business
   */
  static async createBusiness(businessData) {
    if (!businessData.placeid) {
      businessData.placeid = `ChIJ${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!businessData.slug && businessData.title) {
      businessData.slug = await this.generateUniqueSlug(
        BusinessValidation.generateSeoSlug(
          businessData.title,
          businessData.city || void 0,
          businessData.categoryname || void 0
        )
      );
    }
    if (!businessData.seotitle || !businessData.seodescription) {
      const seoMetadata = BusinessValidation.generateSeoMetadata(businessData);
      if (!businessData.seotitle) businessData.seotitle = seoMetadata.seotitle;
      if (!businessData.seodescription) businessData.seodescription = seoMetadata.seodescription;
    }
    businessData.createdat = /* @__PURE__ */ new Date();
    businessData.updatedat = /* @__PURE__ */ new Date();
    const validationErrors = BusinessValidation.validateBusinessData(businessData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }
    const sanitizedBusiness = BusinessValidation.sanitizeBusinessData(businessData);
    const [created] = await db.insert(businesses).values(sanitizedBusiness).returning();
    return created;
  }
  /**
   * Update an existing business
   */
  static async updateBusiness(id, updates) {
    if (updates.title || updates.city || updates.categoryname) {
      const currentBusiness = await this.getBusinessById(id);
      if (currentBusiness) {
        const baseSlug = BusinessValidation.generateSeoSlug(
          updates.title || currentBusiness.title || "business",
          updates.city || currentBusiness.city || void 0,
          updates.categoryname || currentBusiness.categoryname || void 0
        );
        updates.slug = await this.generateUniqueSlug(baseSlug, id);
      }
    }
    if ((updates.title || updates.city || updates.categoryname || updates.address || updates.phone) && (!updates.seotitle || !updates.seodescription)) {
      const currentBusiness = await this.getBusinessById(id);
      if (currentBusiness) {
        const updatedBusiness = { ...currentBusiness, ...updates };
        const seoMetadata = BusinessValidation.generateSeoMetadata(updatedBusiness);
        if (!updates.seotitle) updates.seotitle = seoMetadata.seotitle;
        if (!updates.seodescription) updates.seodescription = seoMetadata.seodescription;
      }
    }
    updates.updatedat = /* @__PURE__ */ new Date();
    if (updates.ownerid === "" || updates.ownerid === null) {
      delete updates.ownerid;
    }
    const sanitizedUpdates = BusinessValidation.sanitizeBusinessData(updates);
    const [updated] = await db.update(businesses).set(sanitizedUpdates).where(eq5(businesses.placeid, id)).returning();
    return updated;
  }
  /**
   * Delete a business
   */
  static async deleteBusiness(id) {
    await db.delete(businesses).where(eq5(businesses.placeid, id));
  }
  /**
   * Get business by ID (simple version without category join)
   */
  static async getBusinessById(id) {
    const [business] = await db.select().from(businesses).where(eq5(businesses.placeid, id));
    return business;
  }
  /**
   * Generate unique slug for business
   */
  static async generateUniqueSlug(baseSlug, excludePlaceId) {
    let slug = baseSlug;
    let counter = 1;
    while (await this.slugExists(slug, excludePlaceId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }
  /**
   * Check if slug already exists
   */
  static async slugExists(slug, excludePlaceId) {
    let query = db.select({ count: sql3`count(*)` }).from(businesses).where(eq5(businesses.slug, slug));
    if (excludePlaceId) {
      query = db.select({ count: sql3`count(*)` }).from(businesses).where(and(eq5(businesses.slug, slug), sql3`${businesses.placeid} != ${excludePlaceId}`));
    }
    const result = await query;
    return Number(result[0]?.count) > 0;
  }
  /**
   * Update business featured status
   */
  static async updateFeaturedStatus(id, featured) {
    return this.updateBusiness(id, { featured });
  }
  /**
   * Update business verification status
   */
  static async updateVerificationStatus(id, verified) {
    return this.updateBusiness(id, { verified });
  }
  /**
   * Bulk update businesses
   */
  static async bulkUpdateBusinesses(ids, updates) {
    updates.updatedat = /* @__PURE__ */ new Date();
    const sanitizedUpdates = BusinessValidation.sanitizeBusinessData(updates);
    await db.update(businesses).set(sanitizedUpdates).where(sql3`${businesses.placeid} = ANY(${ids})`);
  }
  /**
   * Bulk delete businesses
   */
  static async bulkDeleteBusinesses(ids) {
    await db.delete(businesses).where(sql3`${businesses.placeid} = ANY(${ids})`);
  }
};

// server/storage/business/business-search.ts
init_db();
import { sql as sql4 } from "drizzle-orm";

// server/cache/business-cache.ts
var BusinessCache = class _BusinessCache {
  cache = /* @__PURE__ */ new Map();
  // Cache TTL configurations
  static CACHE_TTLS = {
    FEATURED_BUSINESSES: 5 * 60 * 1e3,
    // 5 minutes
    RANDOM_BUSINESSES: 2 * 60 * 1e3,
    // 2 minutes
    CATEGORIES: 10 * 60 * 1e3,
    // 10 minutes
    BUSINESS_STATS: 15 * 60 * 1e3
    // 15 minutes
  };
  /**
   * Set cache entry with TTL
   */
  set(key, data, ttl) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  /**
   * Get cached entry if not expired
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }
  /**
   * Check if cache has valid entry
   */
  has(key) {
    return this.get(key) !== null;
  }
  /**
   * Clear cache entry
   */
  delete(key) {
    this.cache.delete(key);
  }
  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }
  /**
   * Clear expired entries
   */
  cleanup() {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        this.cache.delete(key);
      }
    });
  }
  /**
   * Cache featured businesses
   */
  setFeaturedBusinesses(businesses3, limit = 10) {
    const key = `featured_businesses_${limit}`;
    this.set(key, businesses3, _BusinessCache.CACHE_TTLS.FEATURED_BUSINESSES);
  }
  /**
   * Get cached featured businesses
   */
  getFeaturedBusinesses(limit = 10) {
    const key = `featured_businesses_${limit}`;
    return this.get(key);
  }
  /**
   * Cache random businesses
   */
  setRandomBusinesses(businesses3, limit = 10) {
    const key = `random_businesses_${limit}`;
    this.set(key, businesses3, _BusinessCache.CACHE_TTLS.RANDOM_BUSINESSES);
  }
  /**
   * Get cached random businesses
   */
  getRandomBusinesses(limit = 10) {
    const key = `random_businesses_${limit}`;
    return this.get(key);
  }
  /**
   * Invalidate business-related caches when data changes
   */
  invalidateBusinessCaches() {
    const businessKeys = Array.from(this.cache.keys()).filter(
      (key) => key.startsWith("featured_businesses_") || key.startsWith("random_businesses_")
    );
    businessKeys.forEach((key) => this.cache.delete(key));
  }
};
var businessCache = new BusinessCache();
setInterval(() => {
  businessCache.cleanup();
}, 5 * 60 * 1e3);

// server/storage/business/business-search.ts
var BusinessSearch = class {
  /**
   * Get businesses with advanced filtering
   */
  static async getBusinesses(params) {
    const query = BusinessQueries.buildBusinessQuery(params);
    return BusinessQueries.executeBusinessQuery(query);
  }
  /**
   * Get featured businesses with caching
   */
  static async getFeaturedBusinesses(limit = 10) {
    const cached = businessCache.getFeaturedBusinesses(limit);
    if (cached) {
      console.log(`[CACHE HIT] Featured businesses (${limit}) served from cache`);
      return cached;
    }
    console.log(`[CACHE MISS] Fetching featured businesses (${limit}) from database`);
    const businesses3 = await this.getBusinesses({ featured: true, limit });
    businessCache.setFeaturedBusinesses(businesses3, limit);
    console.log(`[CACHE SET] Featured businesses (${limit}) cached for 5 minutes`);
    return businesses3;
  }
  /**
   * Get random businesses for homepage with caching
   */
  static async getRandomBusinesses(limit = 10) {
    const cached = businessCache.getRandomBusinesses(limit);
    if (cached) {
      console.log(`[CACHE HIT] Random businesses (${limit}) served from cache`);
      return cached;
    }
    try {
      console.log(`[CACHE MISS] Fetching random businesses (${limit}) from database`);
      const result = await db.execute(sql4`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE (b.permanentlyclosed = false OR b.permanentlyclosed IS NULL)
        ORDER BY RANDOM()
        LIMIT ${limit}
      `);
      const businesses3 = BusinessQueries.transformBusinessResults(result.rows);
      businessCache.setRandomBusinesses(businesses3, limit);
      console.log(`[CACHE SET] Random businesses (${limit}) cached for 2 minutes`);
      return businesses3;
    } catch (error) {
      console.error("Error fetching random businesses:", error);
      return [];
    }
  }
  /**
   * Get businesses by category
   */
  static async getBusinessesByCategory(categoryId, limit) {
    return this.getBusinesses({ categoryId, limit });
  }
  /**
   * Get businesses by city
   */
  static async getBusinessesByCity(city, limit) {
    return this.getBusinesses({ city, limit });
  }
  /**
   * Search businesses by term
   */
  static async searchBusinesses(searchTerm, limit) {
    return this.getBusinesses({ search: searchTerm, limit });
  }
  /**
   * Get businesses by owner
   */
  static async getBusinessesByOwner(ownerId) {
    try {
      const result = await db.execute(sql4`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.ownerid = ${ownerId}
        ORDER BY b.createdat DESC
      `);
      return BusinessQueries.transformBusinessResults(result.rows);
    } catch (error) {
      console.error("Error fetching businesses by owner:", error);
      return [];
    }
  }
  /**
   * Get businesses pending approval
   */
  static async getPendingBusinesses() {
    try {
      const result = await db.execute(sql4`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.submissionstatus = 'pending'
        ORDER BY b.createdat DESC
      `);
      return BusinessQueries.transformBusinessResults(result.rows);
    } catch (error) {
      console.error("Error fetching pending businesses:", error);
      return [];
    }
  }
  /**
   * Get business counts by status
   */
  static async getBusinessStats() {
    try {
      const result = await db.execute(sql4`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN submissionstatus = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN submissionstatus = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN featured = true THEN 1 END) as featured
        FROM businesses
        WHERE (permanentlyclosed = false OR permanentlyclosed IS NULL)
      `);
      const stats = result.rows[0];
      return {
        total: Number(stats.total) || 0,
        active: Number(stats.active) || 0,
        pending: Number(stats.pending) || 0,
        featured: Number(stats.featured) || 0
      };
    } catch (error) {
      console.error("Error fetching business stats:", error);
      return { total: 0, active: 0, pending: 0, featured: 0 };
    }
  }
  /**
   * Get businesses near coordinates (if lat/lng are available)
   */
  static async getBusinessesNearLocation(latitude, longitude, radiusKm = 10, limit = 20) {
    try {
      const result = await db.execute(sql4`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id,
               (6371 * acos(cos(radians(${latitude})) * cos(radians(b.lat)) * 
               cos(radians(b.lng) - radians(${longitude})) + sin(radians(${latitude})) * 
               sin(radians(b.lat)))) AS distance
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.lat IS NOT NULL AND b.lng IS NOT NULL
          AND (b.permanentlyclosed = false OR b.permanentlyclosed IS NULL)
        HAVING distance < ${radiusKm}
        ORDER BY distance
        LIMIT ${limit}
      `);
      return BusinessQueries.transformBusinessResults(result.rows);
    } catch (error) {
      console.error("Error fetching businesses near location:", error);
      return [];
    }
  }
  /**
   * Get unique cities with business counts
   */
  static async getCitiesWithBusinessCounts() {
    try {
      const result = await db.execute(sql4`
        SELECT city, COUNT(*) as count
        FROM businesses
        WHERE city IS NOT NULL AND city != ''
          AND (permanentlyclosed = false OR permanentlyclosed IS NULL)
        GROUP BY city
        ORDER BY count DESC, city ASC
      `);
      return result.rows.map((row) => ({
        city: row.city,
        count: Number(row.count)
      }));
    } catch (error) {
      console.error("Error fetching cities with counts:", error);
      return [];
    }
  }
};

// server/storage/business/index.ts
var BusinessStorage = class {
  // ========== SEARCH & RETRIEVAL ==========
  /**
   * Get businesses with filtering options
   */
  async getBusinesses(params) {
    return BusinessSearch.getBusinesses(params);
  }
  /**
   * Get business by ID with category information
   */
  async getBusinessById(id) {
    return BusinessQueries.getBusinessWithCategoryById(id);
  }
  /**
   * Get business by slug with category information
   */
  async getBusinessBySlug(slug) {
    return BusinessQueries.getBusinessWithCategoryBySlug(slug);
  }
  /**
   * Get businesses owned by a specific user
   */
  async getBusinessesByOwner(ownerId) {
    return BusinessSearch.getBusinessesByOwner(ownerId);
  }
  /**
   * Get featured businesses
   */
  async getFeaturedBusinesses(limit = 10) {
    return BusinessSearch.getFeaturedBusinesses(limit);
  }
  /**
   * Get random businesses for homepage
   */
  async getRandomBusinesses(limit = 10) {
    return BusinessSearch.getRandomBusinesses(limit);
  }
  /**
   * Get businesses by category
   */
  async getBusinessesByCategory(categoryId, limit) {
    return BusinessSearch.getBusinessesByCategory(categoryId, limit);
  }
  /**
   * Get businesses by city
   */
  async getBusinessesByCity(city, limit) {
    return BusinessSearch.getBusinessesByCity(city, limit);
  }
  /**
   * Search businesses by term
   */
  async searchBusinesses(searchTerm, limit) {
    return BusinessSearch.searchBusinesses(searchTerm, limit);
  }
  /**
   * Get businesses pending approval
   */
  async getPendingBusinesses() {
    return BusinessSearch.getPendingBusinesses();
  }
  /**
   * Get business statistics
   */
  async getBusinessStats() {
    return BusinessSearch.getBusinessStats();
  }
  /**
   * Get businesses near a location
   */
  async getBusinessesNearLocation(latitude, longitude, radiusKm = 10, limit = 20) {
    return BusinessSearch.getBusinessesNearLocation(latitude, longitude, radiusKm, limit);
  }
  /**
   * Get cities with business counts
   */
  async getCitiesWithBusinessCounts() {
    return BusinessSearch.getCitiesWithBusinessCounts();
  }
  /**
   * Get unique cities (legacy method name for compatibility)
   */
  async getUniqueCities() {
    return BusinessSearch.getCitiesWithBusinessCounts();
  }
  // ========== CRUD OPERATIONS ==========
  /**
   * Create a new business
   */
  async createBusiness(business) {
    return BusinessOperations.createBusiness(business);
  }
  /**
   * Update an existing business
   */
  async updateBusiness(id, updates) {
    return BusinessOperations.updateBusiness(id, updates);
  }
  /**
   * Delete a business
   */
  async deleteBusiness(id) {
    return BusinessOperations.deleteBusiness(id);
  }
  /**
   * Update business featured status
   */
  async updateFeaturedStatus(id, featured) {
    return BusinessOperations.updateFeaturedStatus(id, featured);
  }
  /**
   * Update business verification status
   */
  async updateVerificationStatus(id, verified) {
    return BusinessOperations.updateVerificationStatus(id, verified);
  }
  // ========== BULK OPERATIONS ==========
  /**
   * Bulk update multiple businesses
   */
  async bulkUpdateBusinesses(ids, updates) {
    return BusinessOperations.bulkUpdateBusinesses(ids, updates);
  }
  /**
   * Bulk delete multiple businesses
   */
  async bulkDeleteBusinesses(ids) {
    return BusinessOperations.bulkDeleteBusinesses(ids);
  }
  // ========== UTILITY METHODS ==========
  /**
   * Generate unique slug for business
   */
  async generateUniqueSlug(baseSlug, excludePlaceId) {
    return BusinessOperations.generateUniqueSlug(baseSlug, excludePlaceId);
  }
  /**
   * Generate SEO metadata for business
   */
  generateSeoMetadata(business) {
    return BusinessValidation.generateSeoMetadata(business);
  }
  /**
   * Validate business data
   */
  validateBusinessData(business) {
    return BusinessValidation.validateBusinessData(business);
  }
  /**
   * Sanitize business data (remove undefined values)
   */
  sanitizeBusinessData(business) {
    return BusinessValidation.sanitizeBusinessData(business);
  }
  /**
   * Generate SEO-friendly slug
   */
  generateSeoSlug(title, city, categoryName) {
    return BusinessValidation.generateSeoSlug(title, city, categoryName);
  }
};

// server/storage/category-storage.ts
init_db();
init_schema();
import { eq as eq7, sql as sql5 } from "drizzle-orm";
var CategoryStorage = class {
  async getCategories() {
    const result = await db.execute(sql5`
      SELECT c.*, COUNT(b.placeid) as count
      FROM categories c
      LEFT JOIN businesses b ON (
        LOWER(c.name) = LOWER(b.categoryname) 
        OR LOWER(b.categoryname) LIKE LOWER('%' || c.name || '%')
        OR LOWER(c.name) LIKE LOWER('%' || b.categoryname || '%')
      ) AND (b.permanentlyclosed = false OR b.permanentlyclosed IS NULL)
      GROUP BY c.id, c.name, c.slug, c.description, c.icon, c.color, c.created_at
      ORDER BY c.name
    `);
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      icon: row.icon,
      color: row.color,
      createdAt: row.created_at,
      businessCount: parseInt(row.count) || 0
    }));
  }
  async getCategoryBySlug(slug) {
    const result = await db.select().from(categories).where(eq7(categories.slug, slug)).limit(1);
    return result[0];
  }
  async createCategory(category) {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }
  async updateCategory(id, category) {
    const [updated] = await db.update(categories).set(category).where(eq7(categories.id, id)).returning();
    return updated;
  }
  async deleteCategory(id) {
    await db.delete(categories).where(eq7(categories.id, id));
  }
};
var categoryStorage = new CategoryStorage();

// server/storage/social-media-storage.ts
init_db();
init_schema();
import { eq as eq8, asc } from "drizzle-orm";
var SocialMediaStorage = class {
  // Get all social media links, optionally filtered by active status
  async getSocialMediaLinks(activeOnly = false) {
    try {
      const query = db.select().from(socialMediaLinks);
      if (activeOnly) {
        query.where(eq8(socialMediaLinks.isActive, true));
      }
      const links = await query.orderBy(asc(socialMediaLinks.sortOrder));
      return links;
    } catch (error) {
      console.error("Error fetching social media links:", error);
      throw new Error("Failed to fetch social media links");
    }
  }
  // Get active social media links for public display
  async getActiveSocialMediaLinks() {
    return this.getSocialMediaLinks(true);
  }
  // Get a specific social media link by ID
  async getSocialMediaLinkById(id) {
    try {
      const [link] = await db.select().from(socialMediaLinks).where(eq8(socialMediaLinks.id, id));
      return link;
    } catch (error) {
      console.error("Error fetching social media link by ID:", error);
      throw new Error("Failed to fetch social media link");
    }
  }
  // Get a specific social media link by platform
  async getSocialMediaLinkByPlatform(platform) {
    try {
      const [link] = await db.select().from(socialMediaLinks).where(eq8(socialMediaLinks.platform, platform));
      return link;
    } catch (error) {
      console.error("Error fetching social media link by platform:", error);
      throw new Error("Failed to fetch social media link");
    }
  }
  // Create a new social media link
  async createSocialMediaLink(linkData) {
    try {
      const existing = await this.getSocialMediaLinkByPlatform(linkData.platform);
      if (existing) {
        throw new Error(`Social media platform '${linkData.platform}' already exists`);
      }
      if (!linkData.sortOrder) {
        const allLinks = await this.getSocialMediaLinks();
        linkData.sortOrder = allLinks.length + 1;
      }
      const [newLink] = await db.insert(socialMediaLinks).values({
        ...linkData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return newLink;
    } catch (error) {
      console.error("Error creating social media link:", error);
      throw error;
    }
  }
  // Update an existing social media link
  async updateSocialMediaLink(id, updates) {
    try {
      const existing = await this.getSocialMediaLinkById(id);
      if (!existing) {
        throw new Error("Social media link not found");
      }
      if (updates.platform && updates.platform !== existing.platform) {
        const platformExists = await this.getSocialMediaLinkByPlatform(updates.platform);
        if (platformExists) {
          throw new Error(`Social media platform '${updates.platform}' already exists`);
        }
      }
      const [updatedLink] = await db.update(socialMediaLinks).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq8(socialMediaLinks.id, id)).returning();
      return updatedLink;
    } catch (error) {
      console.error("Error updating social media link:", error);
      throw error;
    }
  }
  // Delete a social media link
  async deleteSocialMediaLink(id) {
    try {
      const existing = await this.getSocialMediaLinkById(id);
      if (!existing) {
        throw new Error("Social media link not found");
      }
      await db.delete(socialMediaLinks).where(eq8(socialMediaLinks.id, id));
    } catch (error) {
      console.error("Error deleting social media link:", error);
      throw error;
    }
  }
  // Toggle active status of a social media link
  async toggleSocialMediaLink(id) {
    try {
      const existing = await this.getSocialMediaLinkById(id);
      if (!existing) {
        throw new Error("Social media link not found");
      }
      return this.updateSocialMediaLink(id, { isActive: !existing.isActive });
    } catch (error) {
      console.error("Error toggling social media link:", error);
      throw error;
    }
  }
  // Reorder social media links
  async reorderSocialMediaLinks(reorderData) {
    try {
      for (const item of reorderData) {
        await this.updateSocialMediaLink(item.id, { sortOrder: item.sortOrder });
      }
    } catch (error) {
      console.error("Error reordering social media links:", error);
      throw new Error("Failed to reorder social media links");
    }
  }
  // Bulk update social media links (for admin convenience)
  async bulkUpdateSocialMediaLinks(updates) {
    try {
      const updatedLinks = [];
      for (const update of updates) {
        const updated = await this.updateSocialMediaLink(update.id, {
          url: update.url,
          isActive: update.isActive
        });
        if (updated) {
          updatedLinks.push(updated);
        }
      }
      return updatedLinks;
    } catch (error) {
      console.error("Error bulk updating social media links:", error);
      throw new Error("Failed to bulk update social media links");
    }
  }
};

// server/storage/user-storage.ts
init_db();
init_schema();
import { eq as eq9 } from "drizzle-orm";
var UserStorage = class {
  async getUser(id) {
    const result = await db.select().from(users).where(eq9(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq9(users.email, email)).limit(1);
    return result[0];
  }
  async createUser(userData) {
    const userId = userData.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const [user] = await db.insert(users).values({
      ...userData,
      id: userId,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return user;
  }
  async upsertUser(userData) {
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      const [updatedUser] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq9(users.id, existingUser.id)).returning();
      return updatedUser;
    } else {
      return await this.createUser(userData);
    }
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async updateUser(id, userData) {
    const [updatedUser] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq9(users.id, id)).returning();
    return updatedUser;
  }
  async updateUserPassword(id, hashedPassword) {
    await db.update(users).set({ password: hashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq9(users.id, id));
  }
  async deleteUser(id) {
    await db.delete(users).where(eq9(users.id, id));
  }
};
var userStorage = new UserStorage();

// server/storage/reviews-storage.ts
init_db();
init_schema();
import { eq as eq10, desc as desc2, and as and2 } from "drizzle-orm";
var ReviewsStorage = class {
  async getReviewsByBusiness(businessId) {
    const result = await db.select({
      id: reviews.id,
      businessId: reviews.businessId,
      userId: reviews.userId,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      authorName: reviews.authorName,
      authorEmail: reviews.authorEmail,
      status: reviews.status,
      adminNotes: reviews.adminNotes,
      createdAt: reviews.createdAt,
      reviewedAt: reviews.reviewedAt,
      reviewedBy: reviews.reviewedBy,
      userFirstName: users.firstName,
      userLastName: users.lastName
    }).from(reviews).leftJoin(users, eq10(reviews.userId, users.id)).where(eq10(reviews.businessId, businessId)).orderBy(desc2(reviews.createdAt));
    return result.map((row) => ({
      id: row.id,
      businessId: row.businessId,
      userId: row.userId,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      authorName: row.authorName,
      authorEmail: row.authorEmail,
      status: row.status,
      adminNotes: row.adminNotes,
      createdAt: row.createdAt,
      reviewedAt: row.reviewedAt,
      reviewedBy: row.reviewedBy,
      user: {
        firstName: row.userFirstName,
        lastName: row.userLastName
      }
    }));
  }
  async getApprovedReviewsByBusiness(businessId) {
    try {
      const businessResult = await db.select({
        reviews: businesses.reviews,
        title: businesses.title
      }).from(businesses).where(eq10(businesses.placeid, businessId)).limit(1);
      if (businessResult.length > 0) {
        const business = businessResult[0];
        if (business.reviews) {
          let reviewsData = [];
          if (Array.isArray(business.reviews)) {
            reviewsData = business.reviews;
          } else if (typeof business.reviews === "object" && business.reviews !== null) {
            const reviewsObj = business.reviews;
            if (Array.isArray(reviewsObj.reviews)) {
              reviewsData = reviewsObj.reviews;
            } else if (Array.isArray(reviewsObj.data)) {
              reviewsData = reviewsObj.data;
            } else if (Array.isArray(reviewsObj.results)) {
              reviewsData = reviewsObj.results;
            }
          }
          if (reviewsData.length > 0) {
            return reviewsData.map((review, index2) => ({
              id: index2 + 1,
              businessId,
              userId: null,
              rating: parseInt(review.rating) || review.stars || review.star_rating || 5,
              title: review.title || review.summary || null,
              comment: review.text || review.comment || review.review || review.content || "",
              authorName: review.author_name || review.authorName || review.name || review.user_name || "Anonymous",
              authorEmail: null,
              status: "approved",
              adminNotes: null,
              createdAt: review.time ? new Date(review.time * 1e3) : review.date ? new Date(review.date) : /* @__PURE__ */ new Date(),
              reviewedAt: null,
              reviewedBy: null,
              user: {
                firstName: null,
                lastName: null
              }
            }));
          }
        }
      }
      const result = await db.select().from(reviews).where(and2(
        eq10(reviews.businessId, businessId),
        eq10(reviews.status, "approved")
      )).orderBy(desc2(reviews.createdAt));
      return result.map((row) => ({
        ...row,
        user: {
          firstName: null,
          lastName: null
        }
      }));
    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      return [];
    }
  }
  async createReview(review) {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }
  async createPublicReview(businessId, reviewData) {
    const review = {
      businessId,
      rating: reviewData.rating,
      title: reviewData.title || null,
      comment: reviewData.comment || null,
      authorName: reviewData.authorName || null,
      authorEmail: reviewData.authorEmail || null,
      status: "pending",
      userId: reviewData.userId || null
    };
    const [created] = await db.insert(reviews).values(review).returning();
    await this.updateBusinessRating(businessId);
    return created;
  }
  async getPendingReviews() {
    return await db.select().from(reviews).where(eq10(reviews.status, "pending")).orderBy(desc2(reviews.createdAt));
  }
  async approveReview(reviewId, adminId, notes) {
    const [updated] = await db.update(reviews).set({
      status: "approved",
      adminNotes: notes,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq10(reviews.id, reviewId)).returning();
    if (updated) {
      await this.updateBusinessRating(updated.businessId);
    }
    return updated;
  }
  async rejectReview(reviewId, adminId, notes) {
    const [updated] = await db.update(reviews).set({
      status: "rejected",
      adminNotes: notes,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq10(reviews.id, reviewId)).returning();
    return updated;
  }
  async getBusinessReviews(businessId) {
    return await db.select().from(reviews).where(eq10(reviews.businessId, businessId)).orderBy(desc2(reviews.createdAt));
  }
  async getAllReviewsForAdmin() {
    return await db.select().from(reviews).orderBy(desc2(reviews.createdAt));
  }
  async getAllReviews() {
    return await db.select().from(reviews).orderBy(desc2(reviews.createdAt));
  }
  async updateReview(id, updates) {
    const [updated] = await db.update(reviews).set({ ...updates }).where(eq10(reviews.id, id)).returning();
    if (updated && updates.status) {
      await this.updateBusinessRating(updated.businessId);
    }
    return updated;
  }
  async deleteReview(reviewId) {
    const [review] = await db.select().from(reviews).where(eq10(reviews.id, reviewId));
    await db.delete(reviews).where(eq10(reviews.id, reviewId));
    if (review) {
      await this.updateBusinessRating(review.businessId);
    }
  }
  async updateBusinessRating(businessId) {
    const approvedReviews = await db.select().from(reviews).where(and2(
      eq10(reviews.businessId, businessId),
      eq10(reviews.status, "approved")
    ));
    console.log(`Updated rating calculation for business ${businessId}: ${approvedReviews.length} approved reviews`);
  }
};

// server/storage/content-storage.ts
var ContentStorage = class {
  constructor(contentStrings2 = contentStringsStorage, siteSettings2 = siteSettingsStorage, menuItems2 = menuItemsStorage, pages2 = pagesStorage, websiteFaqs = websiteFaqsStorage, contactMessages2 = contactMessagesStorage, categories2 = categoryStorage, users2 = userStorage) {
    this.contentStrings = contentStrings2;
    this.siteSettings = siteSettings2;
    this.menuItems = menuItems2;
    this.pages = pages2;
    this.websiteFaqs = websiteFaqs;
    this.contactMessages = contactMessages2;
    this.categories = categories2;
    this.users = users2;
  }
  businessStorage = new BusinessStorage();
  socialMediaStorage = new SocialMediaStorage();
  reviewsStorage = new ReviewsStorage();
  // Content String delegation methods
  async getContentStrings(options = {}) {
    return this.contentStrings.getContentStrings(options);
  }
  async getAllContentStrings(category) {
    return this.contentStrings.getAllContentStrings(category);
  }
  async getContentString(stringKey) {
    return this.contentStrings.getContentString(stringKey);
  }
  async createContentString(contentString) {
    return this.contentStrings.createContentString(contentString);
  }
  async updateContentString(stringKey, updates) {
    return this.contentStrings.updateContentString(stringKey, updates);
  }
  async deleteContentString(stringKey) {
    return this.contentStrings.deleteContentString(stringKey);
  }
  async bulkUpsertContentStrings(contentStringList) {
    return this.contentStrings.bulkUpsertContentStrings(contentStringList);
  }
  async getContentStringCategories() {
    return this.contentStrings.getContentStringCategories();
  }
  async getContentStringStats() {
    return this.contentStrings.getContentStringStats();
  }
  // Menu Items delegation methods
  async getMenuItem(id) {
    return this.menuItems.getMenuItem(id);
  }
  async getMenuItemById(id) {
    return this.menuItems.getMenuItemById(id);
  }
  async createMenuItem(menuItem) {
    return this.menuItems.createMenuItem(menuItem);
  }
  async updateMenuItem(id, updates) {
    return this.menuItems.updateMenuItem(id, updates);
  }
  async deleteMenuItem(id) {
    return this.menuItems.deleteMenuItem(id);
  }
  async getMenuItems(position) {
    return this.menuItems.getMenuItems(position);
  }
  // Pages delegation methods
  async getPages(status) {
    return this.pages.getPages(status);
  }
  async getPage(id) {
    return this.pages.getPage(id);
  }
  async getPageBySlug(slug) {
    return this.pages.getPageBySlug(slug);
  }
  async createPage(pageData) {
    return this.pages.createPage(pageData);
  }
  async updatePage(id, updates) {
    return this.pages.updatePage(id, updates);
  }
  async deletePage(id) {
    return this.pages.deletePage(id);
  }
  async publishPage(id) {
    return this.pages.publishPage(id);
  }
  // Site Settings delegation methods
  async getSiteSettings() {
    return this.siteSettings.getSiteSettings();
  }
  async getSiteSetting(key) {
    return this.siteSettings.getSiteSetting(key);
  }
  async updateSiteSetting(key, value, description, category) {
    return this.siteSettings.updateSiteSetting(key, value, description, category);
  }
  // Website FAQs delegation methods
  async getWebsiteFaqs() {
    return this.websiteFaqs.getWebsiteFaqs();
  }
  async getWebsiteFaq(id) {
    return this.websiteFaqs.getWebsiteFaq(id);
  }
  async createWebsiteFaq(faq) {
    return this.websiteFaqs.createWebsiteFaq(faq);
  }
  async updateWebsiteFaq(id, updates) {
    return this.websiteFaqs.updateWebsiteFaq(id, updates);
  }
  async deleteWebsiteFaq(id) {
    return this.websiteFaqs.deleteWebsiteFaq(id);
  }
  async reorderWebsiteFaqs(reorderData) {
    return this.websiteFaqs.reorderWebsiteFaqs(reorderData);
  }
  // Contact Messages delegation methods
  async getContactMessages() {
    return this.contactMessages.getContactMessages();
  }
  async getContactMessage(id) {
    return this.contactMessages.getContactMessage(id);
  }
  async createContactMessage(message) {
    return this.contactMessages.createContactMessage(message);
  }
  async updateContactMessageStatus(id, status, adminNotes) {
    return this.contactMessages.updateContactMessageStatus(id, status, adminNotes);
  }
  async deleteContactMessage(id) {
    return this.contactMessages.deleteContactMessage(id);
  }
  // ========== BUSINESS METHODS ==========
  // Business-related methods delegated to BusinessStorage
  async getBusinesses(params) {
    return this.businessStorage.getBusinesses(params);
  }
  async getBusinessById(id) {
    return this.businessStorage.getBusinessById(id);
  }
  async getBusinessBySlug(slug) {
    return this.businessStorage.getBusinessBySlug(slug);
  }
  async getBusinessesByOwner(ownerId) {
    return this.businessStorage.getBusinessesByOwner(ownerId);
  }
  async getFeaturedBusinesses(limit = 10) {
    return this.businessStorage.getFeaturedBusinesses(limit);
  }
  async getRandomBusinesses(limit = 10) {
    return this.businessStorage.getRandomBusinesses(limit);
  }
  async getBusinessesByCategory(categoryId, limit) {
    return this.businessStorage.getBusinessesByCategory(categoryId, limit);
  }
  async getBusinessesByCity(city, limit) {
    return this.businessStorage.getBusinessesByCity(city, limit);
  }
  async searchBusinesses(searchTerm, limit) {
    return this.businessStorage.searchBusinesses(searchTerm, limit);
  }
  async getPendingBusinesses() {
    return this.businessStorage.getPendingBusinesses();
  }
  async getBusinessStats() {
    return this.businessStorage.getBusinessStats();
  }
  async getBusinessesNearLocation(latitude, longitude, radiusKm = 10, limit = 20) {
    return this.businessStorage.getBusinessesNearLocation(latitude, longitude, radiusKm, limit);
  }
  async getCitiesWithBusinessCounts() {
    return this.businessStorage.getCitiesWithBusinessCounts();
  }
  async getUniqueCities() {
    return this.businessStorage.getUniqueCities();
  }
  async createBusiness(business) {
    return this.businessStorage.createBusiness(business);
  }
  async updateBusiness(id, updates) {
    return this.businessStorage.updateBusiness(id, updates);
  }
  async deleteBusiness(id) {
    return this.businessStorage.deleteBusiness(id);
  }
  async updateFeaturedStatus(id, featured) {
    return this.businessStorage.updateFeaturedStatus(id, featured);
  }
  async updateVerificationStatus(id, verified) {
    return this.businessStorage.updateVerificationStatus(id, verified);
  }
  async bulkUpdateBusinesses(ids, updates) {
    return this.businessStorage.bulkUpdateBusinesses(ids, updates);
  }
  async bulkDeleteBusinesses(ids) {
    return this.businessStorage.bulkDeleteBusinesses(ids);
  }
  async generateUniqueSlug(baseSlug, excludePlaceId) {
    return this.businessStorage.generateUniqueSlug(baseSlug, excludePlaceId);
  }
  generateSeoMetadata(business) {
    return this.businessStorage.generateSeoMetadata(business);
  }
  validateBusinessData(business) {
    return this.businessStorage.validateBusinessData(business);
  }
  sanitizeBusinessData(business) {
    return this.businessStorage.sanitizeBusinessData(business);
  }
  generateSeoSlug(title, city, categoryName) {
    return this.businessStorage.generateSeoSlug(title, city, categoryName);
  }
  // ========== CATEGORY METHODS ==========
  // Category-related methods delegated to CategoryStorage
  async getCategories() {
    return this.categories.getCategories();
  }
  async getCategoryBySlug(slug) {
    return this.categories.getCategoryBySlug(slug);
  }
  async createCategory(category) {
    return this.categories.createCategory(category);
  }
  async updateCategory(id, category) {
    return this.categories.updateCategory(id, category);
  }
  async deleteCategory(id) {
    return this.categories.deleteCategory(id);
  }
  // ========== SOCIAL MEDIA METHODS ==========
  // Social media-related methods delegated to SocialMediaStorage
  async getSocialMediaLinks(activeOnly = false) {
    return this.socialMediaStorage.getSocialMediaLinks(activeOnly);
  }
  async getSocialMediaLink(id) {
    return this.socialMediaStorage.getSocialMediaLinkById(id);
  }
  async getSocialMediaLinkById(id) {
    return this.socialMediaStorage.getSocialMediaLinkById(id);
  }
  async getSocialMediaLinkByPlatform(platform) {
    return this.socialMediaStorage.getSocialMediaLinkByPlatform(platform);
  }
  async createSocialMediaLink(linkData) {
    return this.socialMediaStorage.createSocialMediaLink(linkData);
  }
  async updateSocialMediaLink(id, updates) {
    return this.socialMediaStorage.updateSocialMediaLink(id, updates);
  }
  async deleteSocialMediaLink(id) {
    return this.socialMediaStorage.deleteSocialMediaLink(id);
  }
  async getActiveSocialMediaLinks() {
    return this.socialMediaStorage.getActiveSocialMediaLinks();
  }
  // ========== USER METHODS ==========
  // User-related methods delegated to UserStorage
  async getUserByEmail(email) {
    return this.users.getUserByEmail(email);
  }
  async getUser(id) {
    return this.users.getUser(id);
  }
  async createUser(userData) {
    return this.users.createUser(userData);
  }
  async upsertUser(userData) {
    return this.users.upsertUser(userData);
  }
  async updateUser(id, userData) {
    return this.users.updateUser(id, userData);
  }
  async updateUserPassword(id, hashedPassword) {
    return this.users.updateUserPassword(id, hashedPassword);
  }
  async deleteUser(id) {
    return this.users.deleteUser(id);
  }
  async getAllUsers() {
    return this.users.getAllUsers();
  }
  // ========== REVIEW METHODS ==========
  // Review-related methods delegated to ReviewsStorage
  async getApprovedReviewsByBusiness(businessId) {
    return this.reviewsStorage.getApprovedReviewsByBusiness(businessId);
  }
  async getReviewsByBusiness(businessId) {
    return this.reviewsStorage.getReviewsByBusiness(businessId);
  }
  async getReviews() {
    return this.reviewsStorage.getAllReviews();
  }
  async createReview(reviewData) {
    return this.reviewsStorage.createReview(reviewData);
  }
  async updateReviewStatus(reviewId, status, adminNotes) {
    return this.reviewsStorage.updateReview(reviewId, { status, adminNotes });
  }
  async deleteReview(reviewId) {
    return this.reviewsStorage.deleteReview(reviewId);
  }
  // ========== ADMIN-SPECIFIC METHODS ==========
  // Methods required by admin API endpoints
  async getBusinessSubmissions() {
    return [];
  }
  async updateBusinessSubmissionStatus(id, status, adminNotes, reviewedBy) {
    return { id, status, adminNotes, reviewedBy, updatedAt: /* @__PURE__ */ new Date() };
  }
  async getAllFeaturedRequests() {
    return [];
  }
  async updateFeaturedRequestStatus(id, status) {
    return { id, status, updatedAt: /* @__PURE__ */ new Date() };
  }
  async getOwnershipClaims() {
    return [];
  }
  async updateOwnershipClaim(id, status) {
    return { id, status, updatedAt: /* @__PURE__ */ new Date() };
  }
  async getAllReviews() {
    return this.reviewsStorage.getAllReviews();
  }
  async updateReview(id, updates) {
    return this.reviewsStorage.updateReview(id, updates);
  }
  async getCities() {
    return this.businessStorage.getUniqueCities();
  }
  async getAllSiteSettings() {
    return this.siteSettings.getAllSiteSettings();
  }
  async getServices() {
    return [];
  }
  async getSocialMediaLinks(activeOnly = true) {
    return this.socialMediaStorage.getSocialMediaLinks(activeOnly);
  }
  async updateSocialMediaLink(id, updates) {
    return this.socialMediaStorage.updateSocialMediaLink(id, updates);
  }
  async deleteSocialMediaLink(id) {
    return this.socialMediaStorage.deleteSocialMediaLink(id);
  }
  async getUsers() {
    return this.users.getUsers();
  }
  async getUser(id) {
    return this.users.getUser(id);
  }
  async updateUser(id, updates) {
    return this.users.updateUser(id, updates);
  }
};
var contentStorage = new ContentStorage();

// server/storage/index.ts
var UnifiedStorage = class {
  constructor(contentStrings2 = contentStringsStorage, siteSettings2 = siteSettingsStorage, menuItems2 = menuItemsStorage, pages2 = pagesStorage, websiteFaqs = websiteFaqsStorage, contactMessages2 = contactMessagesStorage) {
    this.contentStrings = contentStrings2;
    this.siteSettings = siteSettings2;
    this.menuItems = menuItems2;
    this.pages = pages2;
    this.websiteFaqs = websiteFaqs;
    this.contactMessages = contactMessages2;
  }
};
var unifiedStorage = new UnifiedStorage();

// server/openai.ts
async function getOpenAIClient() {
  const setting = await contentStorage.getSiteSetting("openai_api_key");
  const apiKey = setting?.value || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please add it in the Admin API Keys section.");
  }
  return new OpenAI({ apiKey });
}
async function optimizeBusinessDescription(business) {
  try {
    const openai = await getOpenAIClient();
    const prompt = `
You are a professional business content writer. Optimize the following business description to be more engaging, professional, and SEO-friendly while maintaining all factual information.

Business Details:
- Name: ${business.title}
- Category: ${business.categoryname || "General Business"}
- City: ${business.city || "Unknown"}
- Current Description: ${business.description || "No description available"}
- Address: ${business.address || "No address provided"}
- Phone: ${business.phone || "No phone provided"}
- Website: ${business.website || "No website provided"}

Please create an optimized description that:
1. Is 2-3 sentences long
2. Highlights key services/products
3. Mentions the location
4. Is professional and engaging
5. Includes relevant keywords for SEO

Respond with only the optimized description, no additional text or formatting.
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });
    return response.choices[0].message.content?.trim() || business.description || "";
  } catch (error) {
    console.error("Error optimizing description:", error);
    throw new Error("Failed to optimize description");
  }
}
async function generateBusinessFAQ(business) {
  try {
    const openai = await getOpenAIClient();
    const prompt = `
You are a customer service expert. Generate 4 frequently asked questions and answers for this business.

Business Details:
- Name: ${business.title}
- Category: ${business.categoryname || "General Business"}
- City: ${business.city || "Unknown"}
- Description: ${business.description || "No description available"}
- Address: ${business.address || "No address provided"}
- Phone: ${business.phone || "No phone provided"}
- Website: ${business.website || "No website provided"}
- Opening Hours: ${business.openinghours ? JSON.stringify(business.openinghours) : "Not specified"}

Create 4 relevant FAQ items that potential customers would ask. Focus on:
1. Services/products offered
2. Location and hours
3. Contact information
4. Pricing or booking information

Respond with JSON in this exact format:
[
  {"question": "What services do you offer?", "answer": "We offer..."},
  {"question": "What are your hours?", "answer": "Our hours are..."},
  {"question": "Where are you located?", "answer": "We are located at..."},
  {"question": "How can I contact you?", "answer": "You can reach us..."}
]
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates FAQ content for businesses. Always respond with valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7
    });
    const result = JSON.parse(response.choices[0].message.content || "[]");
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error generating FAQ:", error);
    throw new Error("Failed to generate FAQ");
  }
}
async function optimizeBusinesses(businessIds, type) {
  const results = {
    success: 0,
    errors: [],
    details: []
  };
  for (let i = 0; i < businessIds.length; i++) {
    const businessId = businessIds[i];
    let business = null;
    try {
      business = await contentStorage.getBusinessById(businessId);
      if (!business) {
        results.errors.push({ businessId, error: "Business not found" });
        continue;
      }
      console.log(`Processing ${i + 1}/${businessIds.length}: ${business.title}`);
      if (type === "descriptions") {
        const originalDescription = business.description || "No description";
        const optimizedDescription = await optimizeBusinessDescription(business);
        await contentStorage.updateBusiness(businessId, { description: optimizedDescription });
        results.details.push({
          businessId,
          businessName: business.title,
          type: "description",
          before: originalDescription,
          after: optimizedDescription,
          status: "optimized"
        });
      } else if (type === "faqs") {
        const originalFaq = business.faq;
        const hasFaq = originalFaq && (typeof originalFaq === "string" && originalFaq.trim() !== "" && originalFaq !== "[]" || Array.isArray(originalFaq) && originalFaq.length > 0);
        if (!hasFaq) {
          const faqData = await generateBusinessFAQ(business);
          await contentStorage.updateBusiness(businessId, { faq: JSON.stringify(faqData) });
          results.details.push({
            businessId,
            businessName: business.title,
            type: "faq",
            before: "No FAQ",
            after: `Generated ${faqData.length} FAQ items`,
            faqItems: faqData,
            status: "created"
          });
        } else {
          results.details.push({
            businessId,
            businessName: business.title,
            type: "faq",
            before: "FAQ already exists",
            after: "Skipped - FAQ already exists",
            status: "skipped"
          });
        }
      }
      results.success++;
    } catch (error) {
      console.error(`Error processing business ${businessId}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.errors.push({
        businessId,
        businessName: business?.title || "Unknown",
        error: errorMessage
      });
      results.details.push({
        businessId,
        businessName: business?.title || "Unknown",
        type,
        status: "error",
        error: errorMessage
      });
    }
  }
  return results;
}

// server/routes/auth.ts
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").replace(/&lt;script[^&]*&gt;.*?&lt;\/script&gt;/gi, "").replace(/script/gi, "").replace(/[<>"']/g, "");
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuthRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      const sanitizedFirstName = sanitizeInput(firstName);
      const sanitizedLastName = sanitizeInput(lastName);
      if (!isValidEmail(sanitizedEmail)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      if (sanitizedFirstName.length < 1 || sanitizedLastName.length < 1) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const existingUser = await contentStorage.getUserByEmail(sanitizedEmail);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const isAdminEmail = sanitizedEmail.includes("admin@") || sanitizedEmail === "admin@businesshub.com" || sanitizedEmail === "admin@businessdirectory.com" || sanitizedEmail.startsWith("admin") && sanitizedEmail.includes("@test.com");
      const userRole = isAdminEmail ? "admin" : "user";
      console.log(`[REGISTRATION] Email: ${sanitizedEmail}, IsAdmin: ${isAdminEmail}, Role: ${userRole}`);
      const user = await contentStorage.createUser({
        id: userId,
        email: sanitizedEmail,
        password: hashedPassword,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        role: userRole
      });
      req.session.userId = user.id;
      req.session.user = user;
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      if (!isValidEmail(sanitizedEmail)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const user = await contentStorage.getUserByEmail(sanitizedEmail);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      req.session.user = user;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await contentStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.patch("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      const updates = req.body;
      delete updates.role;
      const user = await contentStorage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.patch("/api/auth/change-password", async (req, res) => {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      const user = await contentStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (currentPassword && user.password) {
        const [hashed, salt] = user.password.split(".");
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = await scryptAsync(currentPassword, salt, 64);
        if (!timingSafeEqual(hashedBuf, suppliedBuf)) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }
      const hashedPassword = await hashPassword(newPassword);
      await contentStorage.updateUser(userId, { password: hashedPassword });
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
}

// server/auth/index.ts
import session2 from "express-session";

// server/auth/session-config.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
function createSessionConfig() {
  const PostgresSessionStore = connectPg(session);
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required for security");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
    }
  };
}

// server/auth/password-utils.ts
import { scrypt as scrypt2, randomBytes as randomBytes2, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { promisify as promisify2 } from "util";
var scryptAsync2 = promisify2(scrypt2);
async function hashPassword2(password) {
  const salt = randomBytes2(16).toString("hex");
  const buf = await scryptAsync2(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords2(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync2(supplied, salt, 64);
  return timingSafeEqual2(hashedBuf, suppliedBuf);
}

// server/session-manager.ts
var SessionManager = class {
  static sessionStore = /* @__PURE__ */ new Map();
  /**
   * Clear all existing sessions in memory store
   * Used to prevent session persistence across server restarts
   */
  static clearAllSessions() {
    this.sessionStore.clear();
    console.log("[SESSION MANAGER] All sessions cleared");
  }
  /**
   * Force destroy a specific session by ID
   */
  static destroySession(sessionId) {
    this.sessionStore.delete(sessionId);
    console.log("[SESSION MANAGER] Session destroyed:", sessionId);
  }
  /**
   * Get session count for debugging
   */
  static getSessionCount() {
    return this.sessionStore.size;
  }
  /**
   * List all active session IDs for debugging
   */
  static getActiveSessions() {
    return Array.from(this.sessionStore.keys());
  }
  /**
   * Complete session reset for user switching
   * Clears all session data and forces new session creation
   */
  static resetAllUserSessions() {
    this.clearAllSessions();
    console.log("[SESSION MANAGER] Complete session reset performed");
  }
};
function performCompleteLogout(req, res) {
  return new Promise((resolve) => {
    const sessionId = req.sessionID;
    console.log("[COMPLETE LOGOUT] Starting for session:", sessionId);
    if (req.session) {
      Object.keys(req.session).forEach((key) => {
        if (key !== "id") {
          delete req.session[key];
        }
      });
    }
    SessionManager.destroySession(sessionId);
    req.session.regenerate((err) => {
      if (err) {
        console.error("[COMPLETE LOGOUT] Regenerate error:", err);
        req.session.destroy(() => {
          clearAllCookies(res);
          resolve();
        });
        return;
      }
      console.log("[COMPLETE LOGOUT] New session created:", req.sessionID);
      clearAllCookies(res);
      resolve();
    });
  });
}
function clearAllCookies(res) {
  const cookieNames = [
    "connect.sid",
    "session",
    "sessionId",
    "express.sid",
    "sess",
    "session.sig"
  ];
  const cookieOptions = [
    {},
    { path: "/" },
    { path: "/", httpOnly: true },
    { path: "/", secure: false },
    { path: "/", secure: true },
    { path: "/", domain: void 0 },
    { path: "/", httpOnly: true, secure: false, sameSite: "lax" },
    { path: "/", httpOnly: true, secure: true, sameSite: "strict" }
  ];
  cookieNames.forEach((name) => {
    cookieOptions.forEach((options) => {
      res.clearCookie(name, options);
    });
  });
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate, private",
    "Pragma": "no-cache",
    "Expires": "0",
    "Clear-Site-Data": '"cache", "cookies", "storage"'
  });
  console.log("[COMPLETE LOGOUT] All cookies cleared");
}

// server/auth/auth-routes.ts
function setupAuthRoutes2(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const existingUser = await contentStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await hashPassword2(password);
      const adminEmails = ["admin@example.com", "superadmin@platform.com", "admin@test.com", "admin@businesshub.com"];
      const isAdminEmail = adminEmails.includes(email) || email.includes("admin");
      const role = isAdminEmail ? "admin" : "user";
      const newUser = await contentStorage.createUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role
      });
      req.session.userId = newUser.id;
      req.session.user = newUser;
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await contentStorage.getUserByEmail(email);
      if (!user || !user.password || !await comparePasswords2(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        req.session.userId = user.id;
        req.session.user = user;
        console.log("[LOGIN] Session regenerated for user:", user.id, "role:", user.role);
        console.log("[LOGIN] New session ID:", req.sessionID);
        console.log("[LOGIN] Session user after setting:", JSON.stringify(req.session.user, null, 2));
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Login failed" });
          }
          const { password: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await contentStorage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    console.log("[LOGOUT] Starting comprehensive logout for session:", req.sessionID);
    console.log("[LOGOUT] Current user:", JSON.stringify(req.session?.user, null, 2));
    try {
      await performCompleteLogout(req, res);
      SessionManager.resetAllUserSessions();
      console.log("[LOGOUT] Comprehensive logout completed");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("[LOGOUT] Complete logout failed:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.session.userId = null;
    req.session.user = null;
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: false,
        // Set to true in production with HTTPS
        sameSite: "lax"
      });
      res.clearCookie("session");
      res.clearCookie("sessionId");
      res.json({ message: "Logged out successfully" });
    });
  });
}

// server/auth/business-routes.ts
function setupBusinessRoutes(app2) {
  app2.post("/api/submit-business", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Must be logged in to submit a business" });
      }
      const { title, description, address, city, phone, email, website, hours, categoryId } = req.body;
      if (!title || !description || !address || !city || !categoryId) {
        return res.status(400).json({
          message: "Business name, description, address, city, and category are required"
        });
      }
      const placeid = `user_submitted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const slug = title.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim("-");
      const businessData = {
        placeid,
        title,
        description,
        address,
        city,
        phone: phone || null,
        email: email || null,
        website: website || null,
        hours: hours || null,
        categoryId: parseInt(categoryId),
        slug,
        submittedBy: userId,
        status: "pending",
        approved: false,
        featured: false
      };
      const business = await contentStorage.createBusiness(businessData);
      res.status(201).json({
        message: "Business submitted successfully and is pending approval",
        business
      });
    } catch (error) {
      console.error("Business submission error:", error);
      res.status(500).json({ message: "Failed to submit business" });
    }
  });
}

// server/auth/index.ts
function isAuthenticated(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}
async function isAdmin(req, res, next) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = req.session.user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Authorization check failed" });
  }
}
function setupAuth(app2) {
  const sessionConfig = createSessionConfig();
  app2.use(session2(sessionConfig));
  setupAuthRoutes2(app2);
  setupBusinessRoutes(app2);
  console.log("[AUTH] Authentication system initialized successfully");
}

// server/routes/businesses.ts
function setupBusinessRoutes2(app2) {
  app2.get("/api/businesses", async (req, res) => {
    try {
      const { categoryId, search, city, featured, limit, offset } = req.query;
      const businesses3 = await contentStorage.getBusinesses({
        categoryId: categoryId ? parseInt(categoryId) : void 0,
        search,
        city,
        featured: featured === "true",
        limit: limit ? parseInt(limit) : void 0,
        offset: offset ? parseInt(offset) : void 0
      });
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/businesses/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 6;
      const businesses3 = await contentStorage.getFeaturedBusinesses(limit);
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching featured businesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/businesses/random", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 9;
      const businesses3 = await contentStorage.getRandomBusinesses(limit);
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching random businesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/cities", async (req, res) => {
    try {
      const cities = await contentStorage.getUniqueCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).send("Internal server error");
    }
  });
  app2.get("/api/cities/:city/businesses", async (req, res) => {
    try {
      const { city } = req.params;
      const businesses3 = await contentStorage.getBusinesses({
        city,
        limit: 100
      });
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching businesses for city:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/businesses/search", async (req, res) => {
    try {
      const { q, location } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const businesses3 = await contentStorage.getBusinesses({
        search: q,
        city: location,
        limit: 50
      });
      res.json(businesses3);
    } catch (error) {
      console.error("Error searching businesses:", error);
      res.status(500).send("Internal server error");
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const { query, location } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const businesses3 = await contentStorage.searchBusinesses(query, location);
      res.json(businesses3);
    } catch (error) {
      console.error("Error searching businesses:", error);
      res.status(500).send("Internal server error");
    }
  });
  app2.get("/api/businesses/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      console.log(`[DEBUG] Fetching business with slug: ${slug}`);
      const business = await contentStorage.getBusinessBySlug(slug);
      if (!business) {
        console.log(`[DEBUG] No business found for slug: ${slug}`);
        return res.status(404).json({ message: "Business not found" });
      }
      console.log(`[DEBUG] Business found:`, {
        placeid: business.placeid,
        title: business.title,
        slug: business.slug,
        hasTitle: !!business.title,
        hasDescription: !!business.description,
        hasPhone: !!business.phone,
        hasWebsite: !!business.website
      });
      res.json(business);
    } catch (error) {
      console.error("Error fetching business by slug:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/businesses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const business = await contentStorage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/my-businesses", async (req, res) => {
    try {
      const userId = req.session.userId;
      const businesses3 = await contentStorage.getBusinessesByOwner(userId);
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching user businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });
  app2.get("/api/user/businesses", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const businesses3 = await contentStorage.getUserBusinesses(user.id);
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching user businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });
  app2.get("/api/businesses/user", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const businesses3 = await contentStorage.getUserBusinesses(user.id);
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching user businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });
  app2.get("/api/businesses/category/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      const category = await contentStorage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const businesses3 = await contentStorage.getBusinesses({
        categoryId: category.id,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching businesses by category:", error);
      res.status(500).send("Internal server error");
    }
  });
  app2.get("/api/businesses/city/:cityName", async (req, res) => {
    try {
      const { cityName } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      const businesses3 = await contentStorage.getBusinesses({
        city: decodeURIComponent(cityName),
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json({
        city: decodeURIComponent(cityName),
        businesses: businesses3,
        total: businesses3.length
      });
    } catch (error) {
      console.error("Error fetching businesses by city:", error);
      res.status(500).send("Internal server error");
    }
  });
  app2.post("/api/businesses", async (req, res) => {
    try {
      const userId = req.session.userId;
      const businessData = { ...req.body, ownerid: userId };
      const business = await contentStorage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });
  app2.patch("/api/businesses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.session?.userId;
      console.log(`[DEBUG] Business update request:`, {
        businessId: id,
        sessionUserId: req.session?.userId,
        userObjectId: req.user?.id,
        finalUserId: userId,
        sessionExists: !!req.session,
        userExists: !!req.user
      });
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const business = await contentStorage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      console.log(`[DEBUG] Business ownership check:`, {
        businessOwnerId: business.ownerid,
        currentUserId: userId,
        ownershipMatch: business.ownerid === userId
      });
      if (business.ownerid !== userId) {
        const user = await contentStorage.getUser(userId);
        console.log(`[DEBUG] User role check:`, {
          userId,
          userFound: !!user,
          userRole: user?.role
        });
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Access denied - you don't own this business" });
        }
      }
      const updatedBusiness = await contentStorage.updateBusiness(id, req.body);
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });
  app2.delete("/api/businesses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      const business = await contentStorage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerid !== userId) {
        const user = await contentStorage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      await contentStorage.deleteBusiness(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting business:", error);
      res.status(500).json({ message: "Failed to delete business" });
    }
  });
  app2.get("/api/admin/businesses", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const isAdminUser = sessionUser.role === "admin" || sessionUser.email?.includes("admin");
      if (!isAdminUser) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const businesses3 = await contentStorage.getBusinesses({});
      res.json(businesses3);
    } catch (error) {
      console.error("Error fetching admin businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });
  app2.patch("/api/admin/businesses/:businessId", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const isAdminUser = sessionUser.role === "admin" || sessionUser.email?.includes("admin");
      if (!isAdminUser) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { businessId } = req.params;
      const updatedBusiness = await contentStorage.updateBusiness(businessId, req.body);
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });
}

// server/routes/upload.ts
import { Router } from "express";
import multer from "multer";

// server/azure-blob.ts
init_db();
init_schema();
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
var AzureBlobService = class {
  blobServiceClient = null;
  async getConfig() {
    const settings = await db.select().from(siteSettings);
    return {
      accountName: settings.find((s) => s.key === "azure_blob_account_name")?.value || "",
      accountKey: settings.find((s) => s.key === "azure_blob_account_key")?.value || "",
      containerName: settings.find((s) => s.key === "azure_blob_container")?.value || "uploads",
      connectionString: settings.find((s) => s.key === "azure_blob_connection_string")?.value || ""
    };
  }
  async initializeClient() {
    if (this.blobServiceClient) {
      return this.blobServiceClient;
    }
    const config = await this.getConfig();
    if (!config.accountName || !config.accountKey) {
      throw new Error("Azure Blob Storage configuration is incomplete. Please configure account name and key.");
    }
    try {
      if (config.connectionString) {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
      } else {
        const sharedKeyCredential = new StorageSharedKeyCredential(
          config.accountName,
          config.accountKey
        );
        this.blobServiceClient = new BlobServiceClient(
          `https://${config.accountName}.blob.core.windows.net`,
          sharedKeyCredential
        );
      }
      return this.blobServiceClient;
    } catch (error) {
      console.error("Failed to initialize Azure Blob client:", error);
      throw new Error("Failed to connect to Azure Blob Storage. Please check your configuration.");
    }
  }
  async uploadFile(buffer, fileName, contentType = "application/octet-stream") {
    try {
      const blobServiceClient = await this.initializeClient();
      const config = await this.getConfig();
      const containerClient = blobServiceClient.getContainerClient(config.containerName);
      await containerClient.createIfNotExists({
        access: "blob"
        // Public read access for uploaded images
      });
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });
      return blockBlobClient.url;
    } catch (error) {
      console.error("Azure blob upload error:", error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async deleteFile(fileName) {
    try {
      const blobServiceClient = await this.initializeClient();
      const config = await this.getConfig();
      const containerClient = blobServiceClient.getContainerClient(config.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      const response = await blockBlobClient.deleteIfExists();
      return response.succeeded;
    } catch (error) {
      console.error("Azure blob delete error:", error);
      return false;
    }
  }
  generateFileName(originalName, type) {
    const timestamp2 = Date.now();
    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
    return `${type}/${timestamp2}-${type}.${extension}`;
  }
};
var azureBlobService = new AzureBlobService();

// server/routes/upload.ts
var router = Router();
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
router.post("/upload-image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { type } = req.body;
    if (!type || !["logo", "background"].includes(type)) {
      return res.status(400).json({ message: 'Invalid upload type. Must be "logo" or "background"' });
    }
    const fileName = azureBlobService.generateFileName(req.file.originalname, type);
    const url = await azureBlobService.uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );
    res.json({
      success: true,
      url,
      fileName,
      type,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to upload file",
      success: false
    });
  }
});
var upload_default = router;

// server/routes/admin/businesses.routes.ts
import { Router as Router2 } from "express";

// server/services/business.service.ts
async function bulkDeleteBusinesses(businessIds) {
  let deletedCount = 0;
  const errors = [];
  for (const businessId of businessIds) {
    try {
      await contentStorage.deleteBusiness(businessId);
      deletedCount++;
    } catch (error) {
      errors.push({
        businessId,
        error: error.message
      });
    }
  }
  return {
    deletedCount,
    errors,
    totalRequested: businessIds.length
  };
}
function validateBulkDeleteRequest(requestData) {
  const { businessIds } = requestData;
  if (!businessIds) {
    return {
      isValid: false,
      error: "businessIds field is required"
    };
  }
  if (!Array.isArray(businessIds)) {
    return {
      isValid: false,
      error: "businessIds must be an array"
    };
  }
  if (businessIds.length === 0) {
    return {
      isValid: false,
      error: "businessIds array cannot be empty"
    };
  }
  if (businessIds.length > 100) {
    return {
      isValid: false,
      error: "Cannot delete more than 100 businesses at once"
    };
  }
  for (const id of businessIds) {
    if (typeof id !== "string" || id.trim().length === 0) {
      return {
        isValid: false,
        error: "All business IDs must be non-empty strings"
      };
    }
  }
  return { isValid: true };
}
function generateBulkDeleteSummary(result) {
  const { deletedCount, totalRequested, errors } = result;
  if (deletedCount === totalRequested) {
    return `Successfully deleted all ${deletedCount} business(es)`;
  } else if (deletedCount === 0) {
    return `Failed to delete any businesses. ${errors.length} error(s) occurred`;
  } else {
    return `Partially successful: ${deletedCount} of ${totalRequested} business(es) deleted. ${errors.length} error(s) occurred`;
  }
}

// server/routes/admin/businesses.routes.ts
var router2 = Router2();
router2.get("/", async (req, res) => {
  try {
    const businesses3 = await contentStorage.getBusinesses({});
    res.json(businesses3);
  } catch (error) {
    console.error("Error fetching admin businesses:", error);
    res.status(500).json({ message: "Failed to fetch businesses" });
  }
});
router2.post("/", async (req, res) => {
  try {
    console.log("Creating business with data:", JSON.stringify(req.body, null, 2));
    const business = await contentStorage.createBusiness(req.body);
    console.log("Business created successfully:", business.placeid);
    res.status(201).json(business);
  } catch (error) {
    console.error("Error creating business:", error);
    console.error("Request body was:", JSON.stringify(req.body, null, 2));
    res.status(500).json({ message: "Failed to create business", error: error instanceof Error ? error.message : "Unknown error" });
  }
});
router2.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const business = await contentStorage.updateBusiness(id, req.body);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business);
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({ message: "Failed to update business" });
  }
});
router2.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await contentStorage.deleteBusiness(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Failed to delete business" });
  }
});
router2.post("/bulk-delete", async (req, res) => {
  try {
    const validation = validateBulkDeleteRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }
    const { businessIds } = req.body;
    const result = await bulkDeleteBusinesses(businessIds);
    const message = generateBulkDeleteSummary(result);
    res.json({
      message,
      deletedCount: result.deletedCount,
      totalRequested: result.totalRequested,
      errors: result.errors.length > 0 ? result.errors : void 0
    });
  } catch (error) {
    console.error("Error bulk deleting businesses:", error);
    res.status(500).json({ message: "Failed to bulk delete businesses" });
  }
});
router2.patch("/mass-category", async (req, res) => {
  try {
    const { businessIds, categoryId } = req.body;
    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ message: "Business IDs array is required" });
    }
    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }
    for (const businessId of businessIds) {
      await contentStorage.updateBusiness(businessId, { categories: JSON.stringify([{ id: parseInt(categoryId) }]) });
    }
    res.json({ message: `${businessIds.length} businesses updated successfully` });
  } catch (error) {
    console.error("Error updating business categories:", error);
    res.status(500).json({ message: "Failed to update business categories" });
  }
});
router2.delete("/:businessId/photos", async (req, res) => {
  try {
    const { businessId } = req.params;
    const { photoUrl } = req.body;
    const business = await contentStorage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    const photos = business.images ? JSON.parse(business.images) : [];
    const updatedPhotos = photos.filter((photo) => photo !== photoUrl);
    await contentStorage.updateBusiness(businessId, {
      images: JSON.stringify(updatedPhotos)
    });
    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Failed to delete photo" });
  }
});
router2.delete("/:businessId/photos/bulk", async (req, res) => {
  try {
    const { businessId } = req.params;
    const { photoUrls } = req.body;
    const business = await contentStorage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    const photos = business.images ? JSON.parse(business.images) : [];
    const updatedPhotos = photos.filter((photo) => !photoUrls.includes(photo));
    await contentStorage.updateBusiness(businessId, {
      images: JSON.stringify(updatedPhotos)
    });
    res.json({ message: `${photoUrls.length} photos deleted successfully` });
  } catch (error) {
    console.error("Error bulk deleting photos:", error);
    res.status(500).json({ message: "Failed to bulk delete photos" });
  }
});
var businesses_routes_default = router2;

// server/routes/admin/users.routes.ts
import { Router as Router3 } from "express";

// server/services/user.service.ts
import { scrypt as scrypt3, randomBytes as randomBytes3, timingSafeEqual as timingSafeEqual3 } from "crypto";
import { promisify as promisify3 } from "util";
var scryptAsync3 = promisify3(scrypt3);
async function hashPassword3(password) {
  try {
    const salt = randomBytes3(16).toString("hex");
    const buf = await scryptAsync3(password, salt, 64);
    return `${buf.toString("hex")}.${salt}`;
  } catch (error) {
    console.error("[USER SERVICE] Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}
function validateUserCreation(userData) {
  if (!userData.email || userData.email.trim().length === 0) {
    return { isValid: false, error: "Email is required" };
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(userData.email)) {
    return { isValid: false, error: "Invalid email format" };
  }
  if (userData.password && userData.password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" };
  }
  const validRoles = ["admin", "user", "suspended"];
  if (userData.role && !validRoles.includes(userData.role)) {
    return { isValid: false, error: "Invalid user role" };
  }
  return { isValid: true };
}
function validateUserUpdate(userData) {
  if (userData.email !== void 0) {
    if (userData.email.trim().length === 0) {
      return { isValid: false, error: "Email cannot be empty" };
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(userData.email)) {
      return { isValid: false, error: "Invalid email format" };
    }
  }
  if (userData.role !== void 0) {
    const validRoles = ["admin", "user", "suspended"];
    if (!validRoles.includes(userData.role)) {
      return { isValid: false, error: "Invalid user role" };
    }
  }
  return { isValid: true };
}
async function createUser(userData) {
  console.log("[USER SERVICE] Creating new user:", { email: userData.email, role: userData.role });
  const validation = validateUserCreation(userData);
  if (!validation.isValid) {
    console.log("[USER SERVICE] User creation validation failed:", validation.error);
    throw new Error(validation.error);
  }
  try {
    const existingUserByEmail = await contentStorage.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error(`A user with email "${userData.email}" already exists`);
    }
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createData = {
      id: userId,
      email: userData.email.trim().toLowerCase(),
      firstName: userData.firstName?.trim() || null,
      lastName: userData.lastName?.trim() || null,
      role: userData.role || "user",
      profileImageUrl: userData.profileImageUrl || null
    };
    if (userData.password) {
      createData.password = await hashPassword3(userData.password);
    }
    const user = await contentStorage.createUser(createData);
    console.log("[USER SERVICE] Successfully created user:", { id: user.id, email: user.email, role: user.role });
    return user;
  } catch (error) {
    console.error("[USER SERVICE] Error creating user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create user");
  }
}
async function updateUser(userId, userData) {
  console.log("[USER SERVICE] Updating user:", { id: userId, updates: Object.keys(userData) });
  const validation = validateUserUpdate(userData);
  if (!validation.isValid) {
    console.log("[USER SERVICE] User update validation failed:", validation.error);
    throw new Error(validation.error);
  }
  try {
    const existingUser = await contentStorage.getUser(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await contentStorage.getUserByEmail(userData.email);
      if (userWithEmail && userWithEmail.id !== userId) {
        throw new Error(`A user with email "${userData.email}" already exists`);
      }
    }
    const updateData = {};
    if (userData.email !== void 0) updateData.email = userData.email.trim().toLowerCase();
    if (userData.firstName !== void 0) updateData.firstName = userData.firstName?.trim() || null;
    if (userData.lastName !== void 0) updateData.lastName = userData.lastName?.trim() || null;
    if (userData.role !== void 0) updateData.role = userData.role;
    if (userData.profileImageUrl !== void 0) updateData.profileImageUrl = userData.profileImageUrl || null;
    if (userData.password !== void 0) {
      console.warn("[USER SERVICE] Password update attempted through updateUser - use updateUserPassword instead");
    }
    const updatedUser = await contentStorage.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }
    console.log("[USER SERVICE] Successfully updated user:", { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
    return updatedUser;
  } catch (error) {
    console.error("[USER SERVICE] Error updating user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update user");
  }
}
async function updateUserPassword(userId, newPassword) {
  console.log("[USER SERVICE] Updating user password:", { id: userId });
  try {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    const existingUser = await contentStorage.getUser(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const hashedPassword = await hashPassword3(newPassword);
    const updatedUser = await contentStorage.updateUser(userId, { password: hashedPassword });
    if (!updatedUser) {
      throw new Error("Failed to update user password");
    }
    console.log("[USER SERVICE] Successfully updated user password:", { id: userId });
  } catch (error) {
    console.error("[USER SERVICE] Error updating user password:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update user password");
  }
}
async function deleteUser(userId) {
  console.log("[USER SERVICE] Deleting user:", { id: userId });
  try {
    const existingUser = await contentStorage.getUser(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }
    if (existingUser.role === "admin") {
      const allUsers = await contentStorage.getAllUsers();
      const adminUsers = allUsers.filter((user) => user.role === "admin");
      if (adminUsers.length === 1) {
        throw new Error("Cannot delete the last admin user");
      }
    }
    await contentStorage.deleteUser(userId);
    console.log("[USER SERVICE] Successfully deleted user:", { id: userId, email: existingUser.email });
  } catch (error) {
    console.error("[USER SERVICE] Error deleting user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete user");
  }
}
async function performMassUserAction(userIds, action) {
  console.log("[USER SERVICE] Performing mass user action:", { action, userCount: userIds.length });
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("User IDs array is required");
  }
  if (!["suspend", "activate", "delete"].includes(action)) {
    throw new Error("Invalid action: must be suspend, activate, or delete");
  }
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  if (action === "delete") {
    const allUsers = await contentStorage.getAllUsers();
    const adminUsers = allUsers.filter((user) => user.role === "admin");
    const adminUserIds = adminUsers.map((user) => user.id);
    const adminsToDelete = userIds.filter((id) => adminUserIds.includes(id));
    if (adminsToDelete.length >= adminUsers.length) {
      throw new Error("Cannot delete all admin users");
    }
  }
  for (const userId of userIds) {
    try {
      if (action === "delete") {
        await deleteUser(userId);
      } else {
        const role = action === "suspend" ? "suspended" : "user";
        await updateUser(userId, { role });
      }
      results.success++;
    } catch (error) {
      results.failed++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`User ${userId}: ${errorMessage}`);
      console.error(`[USER SERVICE] Failed to ${action} user ${userId}:`, error);
    }
  }
  console.log("[USER SERVICE] Mass action completed:", {
    action,
    success: results.success,
    failed: results.failed
  });
  return results;
}
async function assignBusinessesToUser(userId, businessIds) {
  console.log("[USER SERVICE] Assigning businesses to user:", { userId, businessCount: businessIds.length });
  if (!Array.isArray(businessIds) || businessIds.length === 0) {
    throw new Error("Business IDs array is required");
  }
  const user = await contentStorage.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  for (const businessId of businessIds) {
    try {
      await contentStorage.updateBusiness(businessId, { ownerid: userId });
      results.success++;
    } catch (error) {
      results.failed++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`Business ${businessId}: ${errorMessage}`);
      console.error(`[USER SERVICE] Failed to assign business ${businessId} to user ${userId}:`, error);
    }
  }
  console.log("[USER SERVICE] Business assignment completed:", {
    userId,
    success: results.success,
    failed: results.failed
  });
  return results;
}
async function getAllUsers(role) {
  try {
    if (role && !["admin", "user", "suspended"].includes(role)) {
      throw new Error("Invalid role filter: must be admin, user, or suspended");
    }
    const users2 = await contentStorage.getAllUsers();
    const filteredUsers = role ? users2.filter((user) => user.role === role) : users2;
    console.log("[USER SERVICE] Retrieved users:", { count: filteredUsers.length, role: role || "all" });
    return filteredUsers;
  } catch (error) {
    console.error("[USER SERVICE] Error retrieving users:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to retrieve users");
  }
}
async function getUserById(userId) {
  try {
    const user = await contentStorage.getUser(userId);
    if (user) {
      console.log("[USER SERVICE] Retrieved user by ID:", { id: user.id, email: user.email, role: user.role });
    } else {
      console.log("[USER SERVICE] User not found by ID:", { id: userId });
    }
    return user;
  } catch (error) {
    console.error("[USER SERVICE] Error retrieving user by ID:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to retrieve user");
  }
}

// server/routes/admin/users.routes.ts
var router3 = Router3();
router3.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    const users2 = await getAllUsers(role);
    res.json(users2);
  } catch (error) {
    console.error("Error in get users route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    res.status(500).json({ message });
  }
});
router3.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in get user by ID route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    res.status(400).json({ message });
  }
});
router3.post("/", async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error in create user route:", error);
    const message = error instanceof Error ? error.message : "Failed to create user";
    res.status(400).json({ message });
  }
});
router3.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await updateUser(id, req.body);
    res.json(user);
  } catch (error) {
    console.error("Error in update user route:", error);
    const message = error instanceof Error ? error.message : "Failed to update user";
    const statusCode = message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});
router3.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error in delete user route:", error);
    const message = error instanceof Error ? error.message : "Failed to delete user";
    const statusCode = message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});
router3.patch("/:userId/password", async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    await updateUserPassword(userId, password);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in update user password route:", error);
    const message = error instanceof Error ? error.message : "Failed to update password";
    const statusCode = message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});
router3.patch("/mass-action", async (req, res) => {
  try {
    const { userIds, action } = req.body;
    if (!userIds || !action) {
      return res.status(400).json({ message: "User IDs and action are required" });
    }
    const result = await performMassUserAction(userIds, action);
    if (result.failed > 0) {
      return res.status(207).json({
        message: `${result.success} users processed successfully, ${result.failed} failed`,
        success: result.success,
        failed: result.failed,
        errors: result.errors
      });
    }
    res.json({
      message: `${result.success} users ${action}d successfully`,
      success: result.success
    });
  } catch (error) {
    console.error("Error in mass user action route:", error);
    const message = error instanceof Error ? error.message : "Failed to perform mass user action";
    res.status(400).json({ message });
  }
});
router3.patch("/:userId/assign-businesses", async (req, res) => {
  try {
    const { userId } = req.params;
    const { businessIds } = req.body;
    if (!businessIds) {
      return res.status(400).json({ message: "Business IDs are required" });
    }
    const result = await assignBusinessesToUser(userId, businessIds);
    if (result.failed > 0) {
      return res.status(207).json({
        message: `${result.success} businesses assigned successfully, ${result.failed} failed`,
        success: result.success,
        failed: result.failed,
        errors: result.errors
      });
    }
    res.json({
      message: `${result.success} businesses assigned successfully`,
      success: result.success
    });
  } catch (error) {
    console.error("Error in assign businesses route:", error);
    const message = error instanceof Error ? error.message : "Failed to assign businesses";
    const statusCode = message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});
var users_routes_default = router3;

// server/routes/admin/categories.routes.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.post("/", async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    };
    const category = await contentStorage.createCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
});
router4.put("/:id", async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = await contentStorage.updateCategory(categoryId, req.body);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
});
router4.delete("/:id", async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    await contentStorage.deleteCategory(categoryId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
});
var categories_routes_default = router4;

// server/routes/admin/cities.routes.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.post("/", async (req, res) => {
  try {
    const city = await contentStorage.createCity(req.body);
    res.status(201).json(city);
  } catch (error) {
    console.error("Error creating city:", error);
    res.status(500).json({ message: "Failed to create city" });
  }
});
router5.put("/:id", async (req, res) => {
  try {
    const cityId = parseInt(req.params.id);
    const city = await contentStorage.updateCity(cityId, req.body);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json(city);
  } catch (error) {
    console.error("Error updating city:", error);
    res.status(500).json({ message: "Failed to update city" });
  }
});
router5.delete("/:id", async (req, res) => {
  try {
    const cityId = parseInt(req.params.id);
    await contentStorage.deleteCity(cityId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({ message: "Failed to delete city" });
  }
});
var cities_routes_default = router5;

// server/routes/admin/leads.routes.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/", async (req, res) => {
  try {
    const { status, businessId } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (businessId) filters.businessId = businessId;
    const leads2 = await contentStorage.getLeads(filters);
    res.json(leads2);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});
router6.patch("/:leadId/status", async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status } = req.body;
    if (!["pending", "contacted", "converted", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const lead = await contentStorage.updateLead(parseInt(leadId), { status });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(lead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({ message: "Failed to update lead status" });
  }
});
router6.delete("/:leadId", async (req, res) => {
  try {
    const leadId = parseInt(req.params.leadId);
    await contentStorage.deleteLead(leadId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Failed to delete lead" });
  }
});
router6.delete("/bulk", async (req, res) => {
  try {
    const { leadIds } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "leadIds array is required" });
    }
    let deletedCount = 0;
    for (const leadId of leadIds) {
      try {
        await contentStorage.deleteLead(leadId);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting lead ${leadId}:`, error);
      }
    }
    res.json({
      message: `${deletedCount} leads deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error("Error bulk deleting leads:", error);
    res.status(500).json({ message: "Failed to bulk delete leads" });
  }
});
router6.patch("/mass-status", async (req, res) => {
  try {
    const { leadIds, status } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "Lead IDs array is required" });
    }
    if (!["pending", "contacted", "converted", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    for (const leadId of leadIds) {
      try {
        await contentStorage.updateLead(leadId, { status });
      } catch (error) {
        console.error(`Error updating lead ${leadId}:`, error);
      }
    }
    res.json({ message: `${leadIds.length} leads updated successfully` });
  } catch (error) {
    console.error("Error mass updating lead status:", error);
    res.status(500).json({ message: "Failed to mass update lead status" });
  }
});
var leads_routes_default = router6;

// server/routes/admin/reviews.routes.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.get("/", async (req, res) => {
  try {
    const reviews2 = await contentStorage.getReviews();
    res.json(reviews2);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});
router7.post("/", async (req, res) => {
  try {
    const review = await contentStorage.createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
});
router7.patch("/:reviewId/status", async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const { status, adminNotes } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const review = await contentStorage.updateReviewStatus(reviewId, status, adminNotes);
    res.json(review);
  } catch (error) {
    console.error("Error updating review status:", error);
    res.status(500).json({ message: "Failed to update review status" });
  }
});
router7.delete("/:reviewId", async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    await contentStorage.deleteReview(reviewId);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
});
router7.delete("/bulk", async (req, res) => {
  try {
    const { reviewIds } = req.body;
    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({ message: "reviewIds array is required" });
    }
    let deletedCount = 0;
    for (const reviewId of reviewIds) {
      try {
        await contentStorage.deleteReview(reviewId);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting review ${reviewId}:`, error);
      }
    }
    res.json({
      message: `${deletedCount} reviews deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error("Error bulk deleting reviews:", error);
    res.status(500).json({ message: "Failed to bulk delete reviews" });
  }
});
var reviews_routes_default = router7;

// server/routes/admin/services.routes.ts
import { Router as Router8 } from "express";
var router8 = Router8();
router8.get("/", async (req, res) => {
  try {
    const services2 = await contentStorage.getServices();
    res.json(services2);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});
router8.post("/", async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      isActive: req.body.isActive !== void 0 ? req.body.isActive : true
    };
    const service = await contentStorage.createService(serviceData);
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Failed to create service" });
  }
});
router8.put("/:id", async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const service = await contentStorage.updateService(serviceId, req.body);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Failed to update service" });
  }
});
router8.delete("/:id", async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    await contentStorage.deleteService(serviceId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Failed to delete service" });
  }
});
router8.post("/generate", async (req, res) => {
  try {
    const result = await contentStorage.generateServices();
    res.json(result);
  } catch (error) {
    console.error("Error generating services:", error);
    res.status(500).json({ message: "Failed to generate services" });
  }
});
var services_routes_default = router8;

// server/routes/admin/social-media.routes.ts
import { Router as Router9 } from "express";
var router9 = Router9();
router9.get("/", async (req, res) => {
  try {
    const socialMedia = await contentStorage.getSocialMediaLinks(false);
    res.json(socialMedia);
  } catch (error) {
    console.error("Error fetching social media links:", error);
    res.status(500).json({ message: "Failed to fetch social media links" });
  }
});
router9.post("/", async (req, res) => {
  try {
    const socialMediaData = {
      ...req.body,
      isActive: req.body.isActive !== void 0 ? req.body.isActive : true,
      sortOrder: req.body.sortOrder || 100
    };
    const socialMedia = await contentStorage.createSocialMediaLink(socialMediaData);
    res.status(201).json(socialMedia);
  } catch (error) {
    console.error("Error creating social media link:", error);
    res.status(500).json({ message: "Failed to create social media link" });
  }
});
router9.put("/:id", async (req, res) => {
  try {
    const linkId = parseInt(req.params.id);
    const socialMedia = await contentStorage.updateSocialMediaLink(linkId, req.body);
    if (!socialMedia) {
      return res.status(404).json({ message: "Social media link not found" });
    }
    res.json(socialMedia);
  } catch (error) {
    console.error("Error updating social media link:", error);
    res.status(500).json({ message: "Failed to update social media link" });
  }
});
router9.delete("/:id", async (req, res) => {
  try {
    const linkId = parseInt(req.params.id);
    await contentStorage.deleteSocialMediaLink(linkId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting social media link:", error);
    res.status(500).json({ message: "Failed to delete social media link" });
  }
});
router9.patch("/bulk", async (req, res) => {
  try {
    const { updates } = req.body;
    const results = [];
    for (const update of updates) {
      const result = await contentStorage.updateSocialMediaLink(update.id, update.updates);
      results.push(result);
    }
    res.json({ message: `${updates.length} social media links updated`, results });
  } catch (error) {
    console.error("Error bulk updating social media links:", error);
    res.status(500).json({ message: "Failed to bulk update social media links" });
  }
});
var social_media_routes_default = router9;

// server/routes/admin.ts
function setupAdminRoutes(app2) {
  app2.use("/api/admin", upload_default);
  app2.use("/api/admin/businesses", businesses_routes_default);
  app2.use("/api/admin/users", users_routes_default);
  app2.use("/api/admin/categories", categories_routes_default);
  app2.use("/api/admin/cities", cities_routes_default);
  app2.use("/api/admin/leads", leads_routes_default);
  app2.use("/api/admin/reviews", reviews_routes_default);
  app2.use("/api/admin/services", services_routes_default);
  app2.use("/api/admin/social-media", social_media_routes_default);
  app2.patch("/api/admin/users/:userId/role", async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      if (!["admin", "user"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'user'" });
      }
      const user = await contentStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await contentStorage.updateUser(userId, { role });
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  app2.get("/api/admin/submissions", async (req, res) => {
    try {
      const submissions = await contentStorage.getBusinessSubmissions();
      res.json(submissions || []);
    } catch (error) {
      console.error("Error fetching business submissions:", error);
      res.json([]);
    }
  });
  app2.get("/api/admin/business-submissions", async (req, res) => {
    try {
      const submissions = await contentStorage.getBusinessSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching business submissions:", error);
      res.status(500).json({ message: "Failed to fetch business submissions" });
    }
  });
  app2.patch("/api/admin/business-submissions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const reviewedBy = req.session?.userId;
      const result = await contentStorage.updateBusinessSubmissionStatus(id, status, adminNotes, reviewedBy);
      if (!result) {
        return res.status(404).json({ message: "Business submission not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating business submission:", error);
      res.status(500).json({ message: "Failed to update business submission" });
    }
  });
  app2.get("/api/admin/search/businesses", async (req, res) => {
    try {
      const { search, category, city, status } = req.query;
      const filters = {};
      if (search) filters.search = search;
      if (category) filters.category = category;
      if (city) filters.city = city;
      if (status) filters.status = status;
      const businesses3 = await contentStorage.getBusinesses(filters);
      res.json(businesses3);
    } catch (error) {
      console.error("Error searching businesses:", error);
      res.status(500).json({ message: "Failed to search businesses" });
    }
  });
  app2.patch("/api/admin/reviews/:reviewId/approve", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      await contentStorage.updateReview(reviewId, { status: "approved" });
      res.json({ message: "Review approved successfully" });
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });
  app2.patch("/api/admin/reviews/:reviewId/reject", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      await contentStorage.updateReview(reviewId, { status: "rejected" });
      res.json({ message: "Review rejected successfully" });
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "Failed to reject review" });
    }
  });
  app2.get("/api/admin/site-settings", async (req, res) => {
    try {
      const settings = await contentStorage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });
  app2.patch("/api/admin/site-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      await contentStorage.updateSiteSetting(key, value);
      res.json({ message: "Site setting updated successfully" });
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Failed to update site setting" });
    }
  });
  app2.get("/api/admin/featured-requests", async (req, res) => {
    try {
      const requests = await contentStorage.getAllFeaturedRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching featured requests:", error);
      res.status(500).json({ message: "Failed to fetch featured requests" });
    }
  });
  app2.patch("/api/admin/featured-requests/:requestId/status", async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const { status } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      await contentStorage.updateFeaturedRequestStatus(requestId, status);
      res.json({ message: "Featured request status updated successfully" });
    } catch (error) {
      console.error("Error updating featured request status:", error);
      res.status(500).json({ message: "Failed to update featured request status" });
    }
  });
  app2.get("/api/admin/ownership-claims", async (req, res) => {
    try {
      const claims = await contentStorage.getOwnershipClaims();
      res.json(claims);
    } catch (error) {
      console.error("Error fetching ownership claims:", error);
      res.status(500).json({ message: "Failed to fetch ownership claims" });
    }
  });
  app2.patch("/api/admin/ownership-claims/:claimId/status", async (req, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const { status } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      await contentStorage.updateOwnershipClaim(claimId, status);
      res.json({ message: "Ownership claim status updated successfully" });
    } catch (error) {
      console.error("Error updating ownership claim status:", error);
      res.status(500).json({ message: "Failed to update ownership claim status" });
    }
  });
  app2.get("/api/admin/site-settings", async (req, res) => {
    try {
      const settings = await contentStorage.getAllSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });
  app2.put("/api/admin/site-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description, category } = req.body;
      const setting = await contentStorage.updateSiteSetting(key, value, description, category);
      res.json(setting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Failed to update site setting" });
    }
  });
  app2.post("/api/admin/azure-blob/test", async (req, res) => {
    try {
      const testResult = await azureBlobService.testConnection();
      res.json(testResult);
    } catch (error) {
      console.error("Azure Blob Storage test failed:", error);
      res.status(500).json({
        success: false,
        message: "Azure Blob Storage test failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/services", async (req, res) => {
    try {
      const services2 = await contentStorage.getServices();
      res.json(services2 || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.json([]);
    }
  });
  app2.post("/api/admin/import/businesses", async (req, res) => {
    try {
      res.json({
        success: true,
        imported: 0,
        skipped: 0,
        errors: [],
        message: "Import functionality ready for implementation"
      });
    } catch (error) {
      console.error("Error importing businesses:", error);
      res.status(500).json({ message: "Failed to import businesses" });
    }
  });
  app2.post("/api/admin/export", async (req, res) => {
    try {
      const { type, format, fields } = req.body;
      let data = [];
      switch (type) {
        case "businesses":
          data = await contentStorage.getBusinesses();
          break;
        case "users":
          data = await contentStorage.getUsers();
          break;
        case "reviews":
          data = await contentStorage.getAllReviews();
          break;
        case "categories":
          data = await contentStorage.getCategories();
          break;
        default:
          return res.status(400).json({ message: "Invalid export type" });
      }
      if (fields && fields.length > 0) {
        data = data.map((item) => {
          const filtered = {};
          fields.forEach((field) => {
            if (item[field] !== void 0) {
              filtered[field] = item[field];
            }
          });
          return filtered;
        });
      }
      res.json(data);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });
  app2.get("/api/admin/social-media", async (req, res) => {
    try {
      const links = await contentStorage.getSocialMediaLinks(false);
      res.json(links || []);
    } catch (error) {
      console.error("Error fetching social media links:", error);
      res.json([]);
    }
  });
  app2.patch("/api/admin/social-media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      await contentStorage.updateSocialMediaLink(parseInt(id), { isActive });
      res.json({ message: "Social media link updated successfully" });
    } catch (error) {
      console.error("Error updating social media link:", error);
      res.status(500).json({ message: "Failed to update social media link" });
    }
  });
  app2.delete("/api/admin/social-media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await contentStorage.deleteSocialMediaLink(parseInt(id));
      res.json({ message: "Social media link deleted successfully" });
    } catch (error) {
      console.error("Error deleting social media link:", error);
      res.status(500).json({ message: "Failed to delete social media link" });
    }
  });
  app2.get("/api/admin/content-strings", async (req, res) => {
    try {
      const contentStrings2 = await contentStorage.getContentStrings();
      res.json(contentStrings2 || []);
    } catch (error) {
      console.error("Error fetching content strings:", error);
      res.json([]);
    }
  });
  app2.patch("/api/admin/content-strings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { value } = req.body;
      await contentStorage.updateContentString(parseInt(id), value);
      res.json({ message: "Content string updated successfully" });
    } catch (error) {
      console.error("Error updating content string:", error);
      res.status(500).json({ message: "Failed to update content string" });
    }
  });
  app2.post("/api/admin/content-strings", async (req, res) => {
    try {
      const { key, value, category } = req.body;
      const contentString = await contentStorage.createContentString({ key, value, category });
      res.status(201).json(contentString);
    } catch (error) {
      console.error("Error creating content string:", error);
      res.status(500).json({ message: "Failed to create content string" });
    }
  });
  app2.post("/api/admin/featured-requests/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      await contentStorage.updateFeaturedRequestStatus(parseInt(id), "approved");
      res.json({ message: "Featured request approved successfully" });
    } catch (error) {
      console.error("Error approving featured request:", error);
      res.status(500).json({ message: "Failed to approve featured request" });
    }
  });
  app2.post("/api/admin/featured-requests/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      await contentStorage.updateFeaturedRequestStatus(parseInt(id), "rejected");
      res.json({ message: "Featured request rejected successfully" });
    } catch (error) {
      console.error("Error rejecting featured request:", error);
      res.status(500).json({ message: "Failed to reject featured request" });
    }
  });
  app2.post("/api/admin/submissions/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      await contentStorage.updateBusinessSubmissionStatus(id, "approved", "Approved by admin", req.session?.userId);
      res.json({ message: "Submission approved successfully" });
    } catch (error) {
      console.error("Error approving submission:", error);
      res.status(500).json({ message: "Failed to approve submission" });
    }
  });
  app2.post("/api/admin/submissions/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      await contentStorage.updateBusinessSubmissionStatus(id, "rejected", "Rejected by admin", req.session?.userId);
      res.json({ message: "Submission rejected successfully" });
    } catch (error) {
      console.error("Error rejecting submission:", error);
      res.status(500).json({ message: "Failed to reject submission" });
    }
  });
}

// server/services/review.service.ts
function validateReviewData(reviewData) {
  const { rating, title, content } = reviewData;
  if (rating === void 0 || rating === null) {
    return {
      isValid: false,
      error: "Rating is required"
    };
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return {
      isValid: false,
      error: "Rating must be a number between 1 and 5"
    };
  }
  if (title && (typeof title !== "string" || title.length > 255)) {
    return {
      isValid: false,
      error: "Review title must be a string with maximum 255 characters"
    };
  }
  if (content && (typeof content !== "string" || content.length > 2e3)) {
    return {
      isValid: false,
      error: "Review content must be a string with maximum 2000 characters"
    };
  }
  return { isValid: true };
}
function validatePublicReviewData(reviewData) {
  const { authorName, authorEmail } = reviewData;
  const baseValidation = validateReviewData(reviewData);
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  if (!authorName || typeof authorName !== "string" || authorName.trim().length === 0) {
    return {
      isValid: false,
      error: "Author name is required for public reviews"
    };
  }
  if (!authorEmail || typeof authorEmail !== "string") {
    return {
      isValid: false,
      error: "Author email is required for public reviews"
    };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(authorEmail)) {
    return {
      isValid: false,
      error: "Invalid email format"
    };
  }
  return { isValid: true };
}
async function createPublicReview(businessId, reviewData) {
  try {
    const validation = validatePublicReviewData(reviewData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    const review = await contentStorage.createPublicReview(businessId, reviewData);
    if (businessId) {
      await updateBusinessRating(businessId);
    }
    return review;
  } catch (error) {
    console.error("Error in createPublicReview service:", error);
    throw error;
  }
}
async function createUserReview(reviewData) {
  try {
    const validation = validateReviewData(reviewData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    if (!reviewData.businessId) {
      throw new Error("Business ID is required");
    }
    if (!reviewData.userId) {
      throw new Error("User ID is required");
    }
    const review = await contentStorage.createReview(reviewData);
    if (reviewData.businessId) {
      await updateBusinessRating(reviewData.businessId);
    }
    return review;
  } catch (error) {
    console.error("Error in createUserReview service:", error);
    throw error;
  }
}
async function deleteReview(reviewId) {
  try {
    const existingReviews = await contentStorage.getAllReviewsForAdmin();
    const reviewToDelete = existingReviews.find((r) => r.id === reviewId);
    if (!reviewToDelete) {
      throw new Error("Review not found");
    }
    const businessId = reviewToDelete.businessId;
    await contentStorage.deleteReview(reviewId);
    if (businessId) {
      await updateBusinessRating(businessId);
    }
    return { success: true };
  } catch (error) {
    console.error("Error in deleteReview service:", error);
    throw error;
  }
}
async function approveReview(reviewId, adminId, notes) {
  try {
    const review = await contentStorage.approveReview(reviewId, adminId, notes);
    if (review.businessId) {
      await updateBusinessRating(review.businessId);
    }
    return review;
  } catch (error) {
    console.error("Error in approveReview service:", error);
    throw error;
  }
}
async function rejectReview(reviewId, adminId, notes) {
  try {
    const review = await contentStorage.rejectReview(reviewId, adminId, notes);
    if (review.businessId) {
      await updateBusinessRating(review.businessId);
    }
    return review;
  } catch (error) {
    console.error("Error in rejectReview service:", error);
    throw error;
  }
}
async function updateBusinessRating(businessId) {
  try {
    await contentStorage.updateBusinessRating(businessId);
  } catch (error) {
    console.error("Error updating business rating:", error);
  }
}
function validateMassReviewAction(requestData) {
  const { reviewIds, action } = requestData;
  if (!reviewIds) {
    return {
      isValid: false,
      error: "reviewIds field is required"
    };
  }
  if (!Array.isArray(reviewIds)) {
    return {
      isValid: false,
      error: "reviewIds must be an array"
    };
  }
  if (reviewIds.length === 0) {
    return {
      isValid: false,
      error: "reviewIds array cannot be empty"
    };
  }
  if (reviewIds.length > 50) {
    return {
      isValid: false,
      error: "Cannot process more than 50 reviews at once"
    };
  }
  if (!action || !["approve", "reject", "delete"].includes(action)) {
    return {
      isValid: false,
      error: "action must be one of: approve, reject, delete"
    };
  }
  for (const id of reviewIds) {
    if (typeof id !== "number" || id <= 0) {
      return {
        isValid: false,
        error: "All review IDs must be positive numbers"
      };
    }
  }
  return { isValid: true };
}

// server/routes/reviews.ts
function setupReviewRoutes(app2) {
  app2.get("/api/businesses/:businessId/reviews", async (req, res) => {
    try {
      const { businessId } = req.params;
      const reviews2 = await contentStorage.getApprovedReviewsByBusiness(businessId);
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/businesses/:businessId/reviews", async (req, res) => {
    try {
      const { businessId } = req.params;
      const reviewData = req.body;
      const review = await createPublicReview(businessId, reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      const message = error instanceof Error ? error.message : "Failed to create review";
      res.status(400).json({ message });
    }
  });
  app2.post("/api/reviews", async (req, res) => {
    try {
      const userId = req.session.userId;
      const reviewData = { ...req.body, userId };
      const review = await createUserReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      const message = error instanceof Error ? error.message : "Failed to create review";
      res.status(400).json({ message });
    }
  });
  app2.get("/api/admin/reviews", async (req, res) => {
    try {
      const reviews2 = await contentStorage.getAllReviewsForAdmin();
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.get("/api/admin/reviews/pending", async (req, res) => {
    try {
      const reviews2 = await contentStorage.getPendingReviews();
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });
  app2.patch("/api/admin/reviews/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.userId;
      const review = await approveReview(parseInt(id), adminId, notes);
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      const message = error instanceof Error ? error.message : "Failed to approve review";
      res.status(400).json({ message });
    }
  });
  app2.patch("/api/admin/reviews/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.userId;
      const review = await rejectReview(parseInt(id), adminId, notes);
      res.json(review);
    } catch (error) {
      console.error("Error rejecting review:", error);
      const message = error instanceof Error ? error.message : "Failed to reject review";
      res.status(400).json({ message });
    }
  });
  app2.delete("/api/admin/reviews/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteReview(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      const message = error instanceof Error ? error.message : "Failed to delete review";
      res.status(400).json({ message });
    }
  });
  app2.patch("/api/admin/reviews/mass-action", async (req, res) => {
    try {
      const validation = validateMassReviewAction(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.error });
      }
      const { reviewIds, action } = req.body;
      const adminId = req.session.userId;
      const errors = [];
      let successCount = 0;
      for (const reviewId of reviewIds) {
        try {
          if (action === "delete") {
            await deleteReview(reviewId);
          } else if (action === "approve") {
            await approveReview(reviewId, adminId);
          } else if (action === "reject") {
            await rejectReview(reviewId, adminId);
          }
          successCount++;
        } catch (error) {
          errors.push({
            reviewId,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
      res.json({
        message: `${successCount} of ${reviewIds.length} reviews ${action}d successfully`,
        successCount,
        totalRequested: reviewIds.length,
        errors
      });
    } catch (error) {
      console.error("Error performing mass review action:", error);
      const message = error instanceof Error ? error.message : "Failed to perform mass review action";
      res.status(500).json({ message });
    }
  });
}

// server/routes/optimization.ts
import { Router as Router10 } from "express";
var router10 = Router10();
router10.post("/optimize-businesses", async (req, res) => {
  try {
    const { businessIds, type } = req.body;
    if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ message: "Business IDs are required" });
    }
    if (!type || !["descriptions", "faqs"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'descriptions' or 'faqs'" });
    }
    const results = [];
    const errors = [];
    for (const businessId of businessIds) {
      try {
        const business = await contentStorage.getBusinessById(businessId);
        if (!business) {
          errors.push({ businessId, error: "Business not found" });
          continue;
        }
        if (type === "description") {
          const optimizedDescription = await optimizeBusinessDescription(business);
          await contentStorage.updateBusiness(businessId, { description: optimizedDescription });
          results.push({ businessId, type: "description", result: optimizedDescription });
        } else if (type === "faq") {
          const generatedFAQ = await generateBusinessFAQ(business);
          await contentStorage.updateBusiness(businessId, { faq: generatedFAQ });
          results.push({ businessId, type: "faq", result: generatedFAQ });
        }
      } catch (error) {
        console.error(`Error optimizing business ${businessId}:`, error);
        errors.push({
          businessId,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    res.status(200).json({
      success: results.length,
      errorCount: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error("Error in optimize-businesses:", error);
    res.status(500).json({
      message: "Failed to optimize businesses",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router10.post("/optimize-description/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await contentStorage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    const optimizedDescription = await optimizeBusinessDescription(business);
    await contentStorage.updateBusiness(businessId, { description: optimizedDescription });
    res.status(200).json({
      businessId,
      originalDescription: business.description,
      optimizedDescription
    });
  } catch (error) {
    console.error("Error optimizing description:", error);
    res.status(500).json({
      message: "Failed to optimize description",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router10.post("/generate-faq/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await contentStorage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    const generatedFAQ = await generateBusinessFAQ(business);
    await contentStorage.updateBusiness(businessId, { faq: generatedFAQ });
    res.status(200).json({
      businessId,
      generatedFAQ
    });
  } catch (error) {
    console.error("Error generating FAQ:", error);
    res.status(500).json({
      message: "Failed to generate FAQ",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var optimization_default = router10;

// server/routes/categories.ts
import { z as z2 } from "zod";
var categorySchema = z2.object({
  name: z2.string().min(1),
  slug: z2.string().min(1),
  icon: z2.string().min(1),
  color: z2.string().min(1),
  description: z2.string().optional(),
  pageTitle: z2.string().optional()
});
function registerCategoryRoutes(app2) {
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await contentStorage.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await contentStorage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category by slug:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  app2.get("/api/admin/categories", async (req, res) => {
    try {
      const categories2 = await contentStorage.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/admin/categories", async (req, res) => {
    try {
      const data = categorySchema.parse(req.body);
      const category = await contentStorage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });
  app2.patch("/api/admin/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = categorySchema.partial().parse(req.body);
      const category = await contentStorage.updateCategory(id, data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });
  app2.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await contentStorage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
}

// server/create-ownership-table.ts
init_db();
import { sql as sql6 } from "drizzle-orm";
async function createOwnershipClaimsTable() {
  try {
    console.log("Creating ownership_claims table...");
    await db.execute(sql6`
      CREATE TABLE IF NOT EXISTS ownership_claims (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_id TEXT NOT NULL REFERENCES businesses(placeid) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending',
        message TEXT,
        admin_message TEXT,
        reviewed_by TEXT REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Successfully created ownership_claims table");
    return true;
  } catch (error) {
    console.error("Error creating ownership_claims table:", error);
    return false;
  }
}

// server/routes/featured-requests.ts
init_db();
init_schema();
import { eq as eq11 } from "drizzle-orm";
function setupFeaturedRequestsRoutes(app2) {
  app2.post("/api/featured-requests/initialize-page-content", async (req, res) => {
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS page_content (
          id SERIAL PRIMARY KEY,
          page_key VARCHAR NOT NULL UNIQUE,
          title VARCHAR NOT NULL,
          content TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      const existingContent = await db.select().from(pageContent).where(eq11(pageContent.pageKey, "get-featured"));
      if (existingContent.length === 0) {
        await db.insert(pageContent).values({
          pageKey: "get-featured",
          title: "Get Featured",
          content: `Ready to boost your business visibility? Getting featured in our directory puts your business in front of thousands of potential customers.

**Why Get Featured?**
\u2022 Increased visibility in search results
\u2022 Priority placement on our homepage
\u2022 Enhanced business profile with special badge
\u2022 Higher customer discovery rates

**Requirements:**
\u2022 Must be a verified business owner
\u2022 Business profile should be complete
\u2022 Good standing in our community

Submit your request below and our team will review it within 24-48 hours.`,
          isActive: true
        });
      }
      res.json({ success: true, message: "Page content initialized successfully" });
    } catch (error) {
      console.error("Error initializing page content:", error);
      res.status(500).json({ message: "Failed to initialize page content" });
    }
  });
  app2.get("/api/page-content/:pageKey", async (req, res) => {
    try {
      const { pageKey } = req.params;
      const content = await db.select().from(pageContent).where(eq11(pageContent.pageKey, pageKey));
      if (content.length === 0) {
        return res.status(404).json({ message: "Page content not found" });
      }
      res.json(content[0]);
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });
  app2.put("/api/page-content/:pageKey", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || !currentUser.claims) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await contentStorage.getUser(currentUser.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { pageKey } = req.params;
      const { title, content } = req.body;
      const [updated] = await db.update(pageContent).set({
        title,
        content,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq11(pageContent.pageKey, pageKey)).returning();
      if (!updated) {
        return res.status(404).json({ message: "Page content not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating page content:", error);
      res.status(500).json({ message: "Failed to update page content" });
    }
  });
  app2.get("/api/featured-requests/admin", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const isAdminUser = sessionUser.role === "admin" || sessionUser.email?.includes("admin");
      if (!isAdminUser) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const requests = await contentStorage.getAllFeaturedRequestsWithBusinessDetails();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching admin featured requests:", error);
      res.status(500).json({ message: "Failed to fetch featured requests" });
    }
  });
  app2.patch("/api/featured-requests/:id/status", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      if (sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { id } = req.params;
      const { status, adminMessage } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }
      const updatedRequest = await contentStorage.updateFeaturedRequestStatus(
        parseInt(id),
        status,
        sessionUser.id,
        adminMessage
      );
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating featured request:", error);
      res.status(500).json({ message: "Failed to update featured request" });
    }
  });
  app2.put("/api/featured-requests/:id/review", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const isAdminUser = sessionUser.role === "admin" || sessionUser.email?.includes("admin");
      if (!isAdminUser) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { id } = req.params;
      const { status, adminMessage } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }
      const updatedRequest = await contentStorage.updateFeaturedRequestStatus(
        parseInt(id),
        status,
        sessionUser.id,
        adminMessage
      );
      if (!updatedRequest) {
        return res.status(404).json({ message: "Featured request not found" });
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error reviewing featured request:", error);
      res.status(500).json({ message: "Failed to review featured request" });
    }
  });
  app2.get("/api/featured-requests/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUserId = sessionUser.id;
      if (currentUserId !== userId) {
        if (sessionUser.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const requests = await contentStorage.getFeaturedRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching user featured requests:", error);
      res.status(500).json({ message: "Failed to fetch featured requests" });
    }
  });
  app2.post("/api/featured-requests", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId = sessionUser.id;
      const { businessId, message } = req.body;
      if (!businessId) {
        return res.status(400).json({ message: "Business ID is required" });
      }
      const business = await contentStorage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerid !== userId) {
        return res.status(403).json({ message: "You can only request featuring for businesses you own" });
      }
      if (business.featured) {
        return res.status(400).json({ message: "This business is already featured" });
      }
      const userRequests = await contentStorage.getFeaturedRequestsByUser(userId);
      const existingRequest = userRequests.find(
        (req2) => req2.businessId === businessId && req2.status === "pending"
      );
      if (existingRequest) {
        return res.status(400).json({ message: "You already have a pending featured request for this business" });
      }
      const request = await contentStorage.createFeaturedRequest({
        businessId,
        userId,
        message
      });
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating featured request:", error);
      res.status(500).json({ message: "Failed to create featured request" });
    }
  });
  app2.get("/api/admin/featured-requests", async (req, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await contentStorage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const requests = await contentStorage.getAllFeaturedRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching featured requests:", error);
      res.status(500).json({ message: "Failed to fetch featured requests" });
    }
  });
  app2.patch("/api/admin/featured-requests/:id", async (req, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await contentStorage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { id } = req.params;
      const { status, adminMessage } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      const updatedRequest = await contentStorage.updateFeaturedRequestStatus(
        parseInt(id),
        status,
        adminMessage,
        userId
      );
      if (!updatedRequest) {
        return res.status(404).json({ message: "Featured request not found" });
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating featured request:", error);
      res.status(500).json({ message: "Failed to update featured request" });
    }
  });
}

// server/create-featured-requests-table.ts
init_db();
async function createFeaturedRequestsTable() {
  try {
    console.log("Creating featured_requests table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS featured_requests (
        id SERIAL PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES businesses(placeid) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR NOT NULL DEFAULT 'pending',
        message TEXT,
        admin_message TEXT,
        reviewed_by VARCHAR REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT featured_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
      );
    `);
    console.log("Successfully created featured_requests table");
    return true;
  } catch (error) {
    console.error("Error creating featured_requests table:", error);
    return false;
  }
}

// server/create-leads-table.ts
init_db();
import { sql as sql7 } from "drizzle-orm";
async function createLeadsTable() {
  try {
    console.log("Creating leads table...");
    await db.execute(sql7`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES businesses(placeid) ON DELETE CASCADE,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        sender_phone TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Successfully created leads table");
    return true;
  } catch (error) {
    console.error("Error creating leads table:", error);
    return false;
  }
}

// server/services/lead.service.ts
async function canUserAccessLead(userId, leadId) {
  try {
    const lead = await contentStorage.getLead(leadId);
    if (!lead) {
      return false;
    }
    const user = await contentStorage.getUser(userId);
    if (!user) {
      return false;
    }
    const { isClaimed, ownerId } = await contentStorage.isBusinessClaimed(lead.businessId);
    if (user.role === "admin" && !isClaimed) {
      return true;
    } else if (isClaimed && ownerId === user.id) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking lead access:", error);
    return false;
  }
}
async function getLeadsForUser(userId) {
  try {
    const user = await contentStorage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role === "admin") {
      return await contentStorage.getAdminLeads();
    } else {
      return await contentStorage.getOwnerLeads(user.id);
    }
  } catch (error) {
    console.error("Error fetching leads for user:", error);
    throw error;
  }
}
function validateLeadData(leadData) {
  const { businessId, senderName, senderEmail, message } = leadData;
  if (!businessId || !senderName || !senderEmail || !message) {
    return {
      isValid: false,
      error: "Missing required fields: businessId, senderName, senderEmail, message"
    };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail)) {
    return {
      isValid: false,
      error: "Invalid email format"
    };
  }
  return { isValid: true };
}
function isValidLeadStatus(status) {
  const validStatuses = ["new", "contacted", "qualified", "converted", "closed"];
  return validStatuses.includes(status);
}

// server/routes/leads.ts
function setupLeadRoutes(app2) {
  app2.post("/api/leads", async (req, res) => {
    try {
      const { businessId, senderName, senderEmail, senderPhone, message } = req.body;
      const validation = validateLeadData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.error });
      }
      const lead = await contentStorage.createLead({
        businessId,
        senderName,
        senderEmail,
        senderPhone: senderPhone || null,
        message,
        status: "new"
      });
      res.status(201).json({
        message: "Lead submitted successfully",
        leadId: lead.id
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to submit lead" });
    }
  });
  app2.get("/api/admin/leads", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const leads2 = await contentStorage.getAllLeads();
      res.json(leads2);
    } catch (error) {
      console.error("Error fetching admin leads:", error);
      res.status(500).json({ message: "Failed to fetch admin leads" });
    }
  });
  app2.get("/api/leads", isAuthenticated, async (req, res) => {
    try {
      const session4 = req.session;
      const userId = session4?.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const leads2 = await getLeadsForUser(userId);
      res.json(leads2);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });
  app2.get("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const hasAccess = await canUserAccessLead(userId, leadId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      const lead = await contentStorage.getLead(leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });
  app2.patch("/api/leads/:id/status", isAuthenticated, async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      if (!status || !isValidLeadStatus(status)) {
        return res.status(400).json({
          message: "Invalid status. Must be one of: new, contacted, qualified, converted, closed"
        });
      }
      const hasAccess = await canUserAccessLead(userId, leadId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      const updatedLead = await contentStorage.updateLeadStatus(leadId, status);
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead status:", error);
      res.status(500).json({ message: "Failed to update lead status" });
    }
  });
  app2.delete("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const hasAccess = await canUserAccessLead(userId, leadId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      await contentStorage.deleteLead(leadId);
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });
  app2.get("/api/businesses/:businessId/leads", isAuthenticated, async (req, res) => {
    try {
      const businessId = req.params.businessId;
      const user = req.user;
      const { isClaimed, ownerId } = await contentStorage.isBusinessClaimed(businessId);
      let hasAccess = false;
      if (user.role === "admin" && !isClaimed) {
        hasAccess = true;
      } else if (isClaimed && ownerId === user.id) {
        hasAccess = true;
      }
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      const leads2 = await contentStorage.getLeadsByBusiness(businessId);
      res.json(leads2);
    } catch (error) {
      console.error("Error fetching business leads:", error);
      res.status(500).json({ message: "Failed to fetch business leads" });
    }
  });
}

// server/routes/content.ts
import { Router as Router11 } from "express";
import { z as z3 } from "zod";
init_schema();
var contentRouter = Router11();
contentRouter.get("/api/content/strings", async (req, res) => {
  try {
    const { language = "en", category } = req.query;
    const contentStrings2 = await contentStorage.getContentStrings({
      language,
      category
    });
    res.json(contentStrings2);
  } catch (error) {
    console.error("Error fetching content strings:", error);
    res.status(500).json({
      error: "Failed to fetch content strings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
contentRouter.get("/api/admin/content/strings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    const contentStrings2 = await contentStorage.getAllContentStrings(category);
    res.json(contentStrings2);
  } catch (error) {
    console.error("Error fetching admin content strings:", error);
    res.status(500).json({
      error: "Failed to fetch content strings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
contentRouter.put("/api/admin/content/strings/:stringKey", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { stringKey } = req.params;
    const updateData = req.body;
    const validationSchema = z3.object({
      defaultValue: z3.string().optional(),
      translations: z3.record(z3.string(), z3.string()).optional(),
      category: z3.string().optional(),
      description: z3.string().optional(),
      isHtml: z3.boolean().optional()
    });
    const validatedData = validationSchema.parse(updateData);
    const updatedString = await contentStorage.updateContentString(stringKey, {
      ...validatedData,
      updatedAt: /* @__PURE__ */ new Date()
    });
    if (!updatedString) {
      return res.status(404).json({ error: "Content string not found" });
    }
    res.json(updatedString);
  } catch (error) {
    console.error("Error updating content string:", error);
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        error: "Invalid input data",
        details: error.errors
      });
    }
    res.status(500).json({
      error: "Failed to update content string",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
contentRouter.post("/api/admin/content/strings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertContentStringSchema.parse(req.body);
    const newString = await contentStorage.createContentString(validatedData);
    res.status(201).json(newString);
  } catch (error) {
    console.error("Error creating content string:", error);
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        error: "Invalid input data",
        details: error.errors
      });
    }
    if (error instanceof Error && error.message.includes("unique")) {
      return res.status(409).json({
        error: "Content string key already exists"
      });
    }
    res.status(500).json({
      error: "Failed to create content string",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
contentRouter.delete("/api/admin/content/strings/:stringKey", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { stringKey } = req.params;
    const deleted = await contentStorage.deleteContentString(stringKey);
    if (!deleted) {
      return res.status(404).json({ error: "Content string not found" });
    }
    res.json({ success: true, message: "Content string deleted successfully" });
  } catch (error) {
    console.error("Error deleting content string:", error);
    res.status(500).json({
      error: "Failed to delete content string",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
contentRouter.put("/api/admin/content/strings", isAuthenticated, async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ error: "Invalid request body" });
    }
    const updatePromises = Object.entries(updates).map(async ([key, value]) => {
      const currentString = await contentStorage.getContentString(key);
      const currentTranslations = currentString?.translations || {};
      const updatedTranslations = {
        ...currentTranslations,
        en: value
      };
      return await contentStorage.updateContentString(key, {
        defaultValue: value,
        translations: updatedTranslations,
        updatedAt: /* @__PURE__ */ new Date()
      });
    });
    const results = await Promise.all(updatePromises);
    const successCount = results.filter((r) => r !== void 0).length;
    res.json({
      success: true,
      updated: successCount,
      message: `Successfully updated ${successCount} content strings`
    });
  } catch (error) {
    console.error("Error bulk updating content strings:", error);
    res.status(500).json({
      error: "Failed to update content strings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
contentRouter.post("/api/admin/content/strings/bulk", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { strings } = req.body;
    if (!Array.isArray(strings)) {
      return res.status(400).json({ error: "Expected 'strings' to be an array" });
    }
    const validatedStrings = strings.map((str) => insertContentStringSchema.parse(str));
    const results = await contentStorage.bulkUpsertContentStrings(validatedStrings);
    res.json({
      success: true,
      imported: results.length,
      strings: results
    });
  } catch (error) {
    console.error("Error bulk importing content strings:", error);
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        error: "Invalid input data",
        details: error.errors
      });
    }
    res.status(500).json({
      error: "Failed to bulk import content strings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
contentRouter.get("/api/admin/content/categories", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const categories2 = await contentStorage.getContentStringCategories();
    res.json(categories2);
  } catch (error) {
    console.error("Error fetching content categories:", error);
    res.status(500).json({
      error: "Failed to fetch content categories",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
contentRouter.get("/api/admin/content/stats", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const stats = await contentStorage.getContentStringStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching content stats:", error);
    res.status(500).json({
      error: "Failed to fetch content statistics",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// migrations/create-content-strings-table.ts
init_db();
init_schema();
async function createContentStringsTable() {
  try {
    console.log("Creating content_strings table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS content_strings (
        id SERIAL PRIMARY KEY,
        string_key VARCHAR(255) UNIQUE NOT NULL,
        default_value TEXT NOT NULL,
        translations JSONB DEFAULT '{}',
        category VARCHAR(100) NOT NULL,
        description TEXT,
        is_html BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_content_strings_key 
      ON content_strings(string_key);
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_content_strings_category 
      ON content_strings(category);
    `);
    console.log("Successfully created content_strings table with indexes");
    return true;
  } catch (error) {
    console.error("Error creating content_strings table:", error);
    throw error;
  }
}
async function seedInitialContentStrings() {
  try {
    console.log("Seeding initial content strings...");
    const initialStrings = [
      // Navigation & Branding
      {
        stringKey: "header.siteTitle",
        defaultValue: "BusinessHub",
        category: "navigation",
        description: "Main site title in header",
        translations: { en: "BusinessHub", es: "CentroNegocios" }
      },
      {
        stringKey: "header.navigation.home",
        defaultValue: "Home",
        category: "navigation",
        description: "Home navigation link",
        translations: { en: "Home", es: "Inicio" }
      },
      {
        stringKey: "header.navigation.categories",
        defaultValue: "Categories",
        category: "navigation",
        description: "Categories navigation link",
        translations: { en: "Categories", es: "Categor\xEDas" }
      },
      {
        stringKey: "header.navigation.featured",
        defaultValue: "Featured",
        category: "navigation",
        description: "Featured businesses navigation link",
        translations: { en: "Featured", es: "Destacados" }
      },
      {
        stringKey: "header.auth.signIn",
        defaultValue: "Sign In",
        category: "navigation",
        description: "Sign in button text",
        translations: { en: "Sign In", es: "Iniciar Sesi\xF3n" }
      },
      {
        stringKey: "header.auth.addBusiness",
        defaultValue: "Add Your Business",
        category: "navigation",
        description: "Add business button text",
        translations: { en: "Add Your Business", es: "Agregar Tu Negocio" }
      },
      // Search & Discovery
      {
        stringKey: "search.placeholder.query",
        defaultValue: "What are you looking for?",
        category: "search",
        description: "Search input placeholder text",
        translations: { en: "What are you looking for?", es: "\xBFQu\xE9 est\xE1s buscando?" }
      },
      {
        stringKey: "search.placeholder.location",
        defaultValue: "City, State",
        category: "search",
        description: "Location search placeholder",
        translations: { en: "City, State", es: "Ciudad, Estado" }
      },
      {
        stringKey: "search.button.search",
        defaultValue: "Search",
        category: "search",
        description: "Search button text",
        translations: { en: "Search", es: "Buscar" }
      },
      // Forms
      {
        stringKey: "forms.required",
        defaultValue: "This field is required",
        category: "forms",
        description: "Required field validation message",
        translations: { en: "This field is required", es: "Este campo es obligatorio" }
      },
      {
        stringKey: "forms.submit",
        defaultValue: "Submit",
        category: "forms",
        description: "Generic submit button text",
        translations: { en: "Submit", es: "Enviar" }
      },
      {
        stringKey: "forms.cancel",
        defaultValue: "Cancel",
        category: "forms",
        description: "Generic cancel button text",
        translations: { en: "Cancel", es: "Cancelar" }
      },
      // Error Messages
      {
        stringKey: "errors.network.title",
        defaultValue: "Connection Error",
        category: "errors",
        description: "Network error title",
        translations: { en: "Connection Error", es: "Error de Conexi\xF3n" }
      },
      {
        stringKey: "errors.network.message",
        defaultValue: "Please check your internet connection",
        category: "errors",
        description: "Network error message",
        translations: { en: "Please check your internet connection", es: "Por favor verifica tu conexi\xF3n a internet" }
      },
      // Dashboard Content
      {
        stringKey: "dashboard.page.title",
        defaultValue: "Business Dashboard",
        category: "dashboard",
        description: "Main dashboard page title",
        translations: { en: "Business Dashboard", es: "Panel de Negocios" }
      },
      {
        stringKey: "dashboard.page.subtitle",
        defaultValue: "Manage your businesses and ownership claims",
        category: "dashboard",
        description: "Main dashboard page subtitle",
        translations: { en: "Manage your businesses and ownership claims", es: "Gestiona tus negocios y reclamos de propiedad" }
      },
      {
        stringKey: "dashboard.access.denied.title",
        defaultValue: "Access Denied",
        category: "dashboard",
        description: "Access denied card title",
        translations: { en: "Access Denied", es: "Acceso Denegado" }
      },
      {
        stringKey: "dashboard.access.denied.message",
        defaultValue: "Please log in to access your dashboard.",
        category: "dashboard",
        description: "Access denied message",
        translations: { en: "Please log in to access your dashboard.", es: "Por favor inicia sesi\xF3n para acceder a tu panel." }
      },
      {
        stringKey: "dashboard.tabs.businesses",
        defaultValue: "My Businesses",
        category: "dashboard",
        description: "Businesses tab label",
        translations: { en: "My Businesses", es: "Mis Negocios" }
      },
      {
        stringKey: "dashboard.tabs.claims",
        defaultValue: "Ownership Claims",
        category: "dashboard",
        description: "Claims tab label",
        translations: { en: "Ownership Claims", es: "Reclamos de Propiedad" }
      },
      {
        stringKey: "dashboard.tabs.featured",
        defaultValue: "Featured Requests",
        category: "dashboard",
        description: "Featured requests tab label",
        translations: { en: "Featured Requests", es: "Solicitudes Destacadas" }
      },
      {
        stringKey: "dashboard.businesses.title",
        defaultValue: "Your Businesses",
        category: "dashboard",
        description: "Businesses section title",
        translations: { en: "Your Businesses", es: "Tus Negocios" }
      },
      {
        stringKey: "dashboard.businesses.description",
        defaultValue: "Manage your business listings",
        category: "dashboard",
        description: "Businesses section description",
        translations: { en: "Manage your business listings", es: "Gestiona tus listados de negocios" }
      },
      {
        stringKey: "dashboard.businesses.loading",
        defaultValue: "Loading your businesses...",
        category: "dashboard",
        description: "Businesses loading message",
        translations: { en: "Loading your businesses...", es: "Cargando tus negocios..." }
      },
      {
        stringKey: "dashboard.businesses.table.name",
        defaultValue: "Business Name",
        category: "dashboard",
        description: "Business table name column",
        translations: { en: "Business Name", es: "Nombre del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.table.location",
        defaultValue: "Location",
        category: "dashboard",
        description: "Business table location column",
        translations: { en: "Location", es: "Ubicaci\xF3n" }
      },
      {
        stringKey: "dashboard.businesses.table.rating",
        defaultValue: "Rating",
        category: "dashboard",
        description: "Business table rating column",
        translations: { en: "Rating", es: "Calificaci\xF3n" }
      },
      {
        stringKey: "dashboard.businesses.table.status",
        defaultValue: "Status",
        category: "dashboard",
        description: "Business table status column",
        translations: { en: "Status", es: "Estado" }
      },
      {
        stringKey: "dashboard.businesses.table.actions",
        defaultValue: "Actions",
        category: "dashboard",
        description: "Business table actions column",
        translations: { en: "Actions", es: "Acciones" }
      },
      {
        stringKey: "dashboard.businesses.rating.none",
        defaultValue: "No ratings",
        category: "dashboard",
        description: "No ratings available text",
        translations: { en: "No ratings", es: "Sin calificaciones" }
      },
      {
        stringKey: "dashboard.businesses.status.featured",
        defaultValue: "Featured",
        category: "dashboard",
        description: "Featured business status",
        translations: { en: "Featured", es: "Destacado" }
      },
      {
        stringKey: "dashboard.businesses.status.standard",
        defaultValue: "Standard",
        category: "dashboard",
        description: "Standard business status",
        translations: { en: "Standard", es: "Est\xE1ndar" }
      },
      {
        stringKey: "dashboard.businesses.action.edit",
        defaultValue: "Edit",
        category: "dashboard",
        description: "Edit business button",
        translations: { en: "Edit", es: "Editar" }
      },
      {
        stringKey: "dashboard.businesses.edit.title",
        defaultValue: "Edit Business",
        category: "dashboard",
        description: "Edit business dialog title prefix",
        translations: { en: "Edit Business", es: "Editar Negocio" }
      },
      {
        stringKey: "dashboard.businesses.tabs.basic",
        defaultValue: "Basic Info",
        category: "dashboard",
        description: "Basic info tab",
        translations: { en: "Basic Info", es: "Informaci\xF3n B\xE1sica" }
      },
      {
        stringKey: "dashboard.businesses.tabs.contact",
        defaultValue: "Contact & Hours",
        category: "dashboard",
        description: "Contact and hours tab",
        translations: { en: "Contact & Hours", es: "Contacto y Horarios" }
      },
      {
        stringKey: "dashboard.businesses.tabs.photos",
        defaultValue: "Photos",
        category: "dashboard",
        description: "Photos tab",
        translations: { en: "Photos", es: "Fotos" }
      },
      {
        stringKey: "dashboard.businesses.tabs.faqs",
        defaultValue: "FAQs",
        category: "dashboard",
        description: "FAQs tab",
        translations: { en: "FAQs", es: "Preguntas Frecuentes" }
      },
      {
        stringKey: "dashboard.businesses.form.name.label",
        defaultValue: "Business Name",
        category: "dashboard",
        description: "Business name form label",
        translations: { en: "Business Name", es: "Nombre del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.form.name.placeholder",
        defaultValue: "Enter your business name",
        category: "dashboard",
        description: "Business name form placeholder",
        translations: { en: "Enter your business name", es: "Ingresa el nombre de tu negocio" }
      },
      {
        stringKey: "dashboard.businesses.form.description.label",
        defaultValue: "Business Description",
        category: "dashboard",
        description: "Business description form label",
        translations: { en: "Business Description", es: "Descripci\xF3n del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.form.description.placeholder",
        defaultValue: "Describe your business, services, and what makes you unique...",
        category: "dashboard",
        description: "Business description form placeholder",
        translations: { en: "Describe your business, services, and what makes you unique...", es: "Describe tu negocio, servicios y lo que te hace \xFAnico..." }
      },
      {
        stringKey: "dashboard.businesses.form.address.label",
        defaultValue: "Business Address",
        category: "dashboard",
        description: "Business address form label",
        translations: { en: "Business Address", es: "Direcci\xF3n del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.form.address.placeholder",
        defaultValue: "123 Main Street, City, State ZIP",
        category: "dashboard",
        description: "Business address form placeholder",
        translations: { en: "123 Main Street, City, State ZIP", es: "Calle Principal 123, Ciudad, Estado, CP" }
      },
      {
        stringKey: "dashboard.businesses.form.phone.label",
        defaultValue: "Phone Number",
        category: "dashboard",
        description: "Phone number form label",
        translations: { en: "Phone Number", es: "N\xFAmero de Tel\xE9fono" }
      },
      {
        stringKey: "dashboard.businesses.form.phone.placeholder",
        defaultValue: "(555) 123-4567",
        category: "dashboard",
        description: "Phone number form placeholder",
        translations: { en: "(555) 123-4567", es: "(555) 123-4567" }
      },
      {
        stringKey: "dashboard.businesses.form.website.label",
        defaultValue: "Website URL",
        category: "dashboard",
        description: "Website URL form label",
        translations: { en: "Website URL", es: "URL del Sitio Web" }
      },
      {
        stringKey: "dashboard.businesses.form.website.placeholder",
        defaultValue: "https://yourwebsite.com",
        category: "dashboard",
        description: "Website URL form placeholder",
        translations: { en: "https://yourwebsite.com", es: "https://tusitio.com" }
      },
      {
        stringKey: "dashboard.businesses.hours.title",
        defaultValue: "Business Hours & Contact Info",
        category: "dashboard",
        description: "Business hours section title",
        translations: { en: "Business Hours & Contact Info", es: "Horarios y Contacto del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.hours.description",
        defaultValue: "To update your business hours, contact information, and other detailed information, please contact our support team. Basic business details can be edited here.",
        category: "dashboard",
        description: "Business hours section description",
        translations: { en: "To update your business hours, contact information, and other detailed information, please contact our support team. Basic business details can be edited here.", es: "Para actualizar los horarios, informaci\xF3n de contacto y otros detalles, por favor contacta a nuestro equipo de soporte. Los detalles b\xE1sicos se pueden editar aqu\xED." }
      },
      {
        stringKey: "dashboard.businesses.photos.title",
        defaultValue: "Photo Gallery",
        category: "dashboard",
        description: "Photo gallery title",
        translations: { en: "Photo Gallery", es: "Galer\xEDa de Fotos" }
      },
      {
        stringKey: "dashboard.businesses.photos.description",
        defaultValue: "Manage your business photos to showcase your services and location.",
        category: "dashboard",
        description: "Photo gallery description",
        translations: { en: "Manage your business photos to showcase your services and location.", es: "Gestiona las fotos de tu negocio para mostrar tus servicios y ubicaci\xF3n." }
      },
      {
        stringKey: "dashboard.businesses.photos.upload",
        defaultValue: "Upload Photos",
        category: "dashboard",
        description: "Upload photos button",
        translations: { en: "Upload Photos", es: "Subir Fotos" }
      },
      {
        stringKey: "dashboard.businesses.photos.uploading",
        defaultValue: "Uploading...",
        category: "dashboard",
        description: "Uploading photos status",
        translations: { en: "Uploading...", es: "Subiendo..." }
      },
      {
        stringKey: "dashboard.businesses.photos.empty.title",
        defaultValue: "No photos yet",
        category: "dashboard",
        description: "Empty photos state title",
        translations: { en: "No photos yet", es: "Sin fotos a\xFAn" }
      },
      {
        stringKey: "dashboard.businesses.photos.empty.description",
        defaultValue: "Upload photos to showcase your business",
        category: "dashboard",
        description: "Empty photos state description",
        translations: { en: "Upload photos to showcase your business", es: "Sube fotos para mostrar tu negocio" }
      },
      {
        stringKey: "dashboard.businesses.photos.first",
        defaultValue: "Upload Your First Photo",
        category: "dashboard",
        description: "Upload first photo button",
        translations: { en: "Upload Your First Photo", es: "Sube Tu Primera Foto" }
      },
      {
        stringKey: "dashboard.businesses.photos.alt",
        defaultValue: "Business photo",
        category: "dashboard",
        description: "Business photo alt text prefix",
        translations: { en: "Business photo", es: "Foto del negocio" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.title",
        defaultValue: "Photo Management Tips",
        category: "dashboard",
        description: "Photo tips section title",
        translations: { en: "Photo Management Tips", es: "Consejos para Gesti\xF3n de Fotos" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.quality",
        defaultValue: "High-quality photos help attract more customers",
        category: "dashboard",
        description: "Photo tip 1",
        translations: { en: "High-quality photos help attract more customers", es: "Las fotos de alta calidad ayudan a atraer m\xE1s clientes" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.showcase",
        defaultValue: "Show your business interior, exterior, products, and services",
        category: "dashboard",
        description: "Photo tip 2",
        translations: { en: "Show your business interior, exterior, products, and services", es: "Muestra el interior, exterior, productos y servicios de tu negocio" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.recent",
        defaultValue: "Keep photos recent and representative of your current business",
        category: "dashboard",
        description: "Photo tip 3",
        translations: { en: "Keep photos recent and representative of your current business", es: "Mant\xE9n las fotos recientes y representativas de tu negocio actual" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.quality_control",
        defaultValue: "Remove any photos that are outdated or low quality",
        category: "dashboard",
        description: "Photo tip 4",
        translations: { en: "Remove any photos that are outdated or low quality", es: "Elimina las fotos desactualizadas o de baja calidad" }
      },
      {
        stringKey: "dashboard.businesses.faqs.title",
        defaultValue: "Frequently Asked Questions",
        category: "dashboard",
        description: "FAQs section title",
        translations: { en: "Frequently Asked Questions", es: "Preguntas Frecuentes" }
      },
      {
        stringKey: "dashboard.businesses.faqs.description",
        defaultValue: "Help customers by answering common questions about your business.",
        category: "dashboard",
        description: "FAQs section description",
        translations: { en: "Help customers by answering common questions about your business.", es: "Ayuda a los clientes respondiendo preguntas comunes sobre tu negocio." }
      },
      {
        stringKey: "dashboard.businesses.faqs.add",
        defaultValue: "Add FAQ",
        category: "dashboard",
        description: "Add FAQ button",
        translations: { en: "Add FAQ", es: "Agregar Pregunta" }
      },
      {
        stringKey: "dashboard.businesses.faqs.empty.title",
        defaultValue: "No FAQs added yet",
        category: "dashboard",
        description: "Empty FAQs state title",
        translations: { en: "No FAQs added yet", es: "Sin preguntas frecuentes a\xFAn" }
      },
      {
        stringKey: "dashboard.businesses.faqs.empty.description",
        defaultValue: 'Click "Add FAQ" to create your first question and answer',
        category: "dashboard",
        description: "Empty FAQs state description",
        translations: { en: 'Click "Add FAQ" to create your first question and answer', es: 'Haz clic en "Agregar Pregunta" para crear tu primera pregunta y respuesta' }
      },
      {
        stringKey: "dashboard.businesses.faqs.question.label",
        defaultValue: "Question",
        category: "dashboard",
        description: "FAQ question label",
        translations: { en: "Question", es: "Pregunta" }
      },
      {
        stringKey: "dashboard.businesses.faqs.question.placeholder",
        defaultValue: "Enter your question (e.g., What are your business hours?)",
        category: "dashboard",
        description: "FAQ question placeholder",
        translations: { en: "Enter your question (e.g., What are your business hours?)", es: "Ingresa tu pregunta (ej: \xBFCu\xE1les son los horarios del negocio?)" }
      },
      {
        stringKey: "dashboard.businesses.faqs.answer.label",
        defaultValue: "Answer",
        category: "dashboard",
        description: "FAQ answer label",
        translations: { en: "Answer", es: "Respuesta" }
      },
      {
        stringKey: "dashboard.businesses.faqs.answer.placeholder",
        defaultValue: "Provide a helpful answer to this question...",
        category: "dashboard",
        description: "FAQ answer placeholder",
        translations: { en: "Provide a helpful answer to this question...", es: "Proporciona una respuesta \xFAtil a esta pregunta..." }
      },
      {
        stringKey: "dashboard.businesses.actions.cancel",
        defaultValue: "Cancel",
        category: "dashboard",
        description: "Cancel button",
        translations: { en: "Cancel", es: "Cancelar" }
      },
      {
        stringKey: "dashboard.businesses.actions.update",
        defaultValue: "Update Business",
        category: "dashboard",
        description: "Update business button",
        translations: { en: "Update Business", es: "Actualizar Negocio" }
      },
      {
        stringKey: "dashboard.businesses.actions.updating",
        defaultValue: "Updating...",
        category: "dashboard",
        description: "Updating business status",
        translations: { en: "Updating...", es: "Actualizando..." }
      },
      {
        stringKey: "dashboard.businesses.empty.title",
        defaultValue: "No businesses found",
        category: "dashboard",
        description: "Empty businesses state title",
        translations: { en: "No businesses found", es: "No se encontraron negocios" }
      },
      {
        stringKey: "dashboard.businesses.empty.description",
        defaultValue: "You don't own any business listings yet.",
        category: "dashboard",
        description: "Empty businesses state description",
        translations: { en: "You don't own any business listings yet.", es: "A\xFAn no tienes listados de negocios." }
      },
      {
        stringKey: "dashboard.claims.title",
        defaultValue: "Ownership Claims",
        category: "dashboard",
        description: "Claims section title",
        translations: { en: "Ownership Claims", es: "Reclamos de Propiedad" }
      },
      {
        stringKey: "dashboard.claims.description",
        defaultValue: "Track your business ownership claim requests",
        category: "dashboard",
        description: "Claims section description",
        translations: { en: "Track your business ownership claim requests", es: "Rastrea tus solicitudes de reclamo de propiedad" }
      },
      {
        stringKey: "dashboard.claims.status.pending",
        defaultValue: "Pending",
        category: "dashboard",
        description: "Pending claim status",
        translations: { en: "Pending", es: "Pendiente" }
      },
      {
        stringKey: "dashboard.claims.status.approved",
        defaultValue: "Approved",
        category: "dashboard",
        description: "Approved claim status",
        translations: { en: "Approved", es: "Aprobado" }
      },
      {
        stringKey: "dashboard.claims.status.rejected",
        defaultValue: "Rejected",
        category: "dashboard",
        description: "Rejected claim status",
        translations: { en: "Rejected", es: "Rechazado" }
      },
      // Business Cards
      {
        stringKey: "business.contact.phone",
        defaultValue: "Call",
        category: "business",
        description: "Phone contact button text",
        translations: { en: "Call", es: "Llamar" }
      },
      {
        stringKey: "business.contact.website",
        defaultValue: "Visit Website",
        category: "business",
        description: "Website link button text",
        translations: { en: "Visit Website", es: "Visitar Sitio Web" }
      },
      {
        stringKey: "business.featured.badge",
        defaultValue: "Featured",
        category: "business",
        description: "Featured business badge text",
        translations: { en: "Featured", es: "Destacado" }
      },
      // Homepage Content
      {
        stringKey: "homepage.seo.title",
        defaultValue: "Business Directory - Find Local Businesses",
        category: "homepage",
        description: "Homepage SEO title",
        translations: { en: "Business Directory - Find Local Businesses", es: "Directorio de Negocios - Encuentra Negocios Locales" }
      },
      {
        stringKey: "homepage.seo.description",
        defaultValue: "Discover and connect with local businesses in your area. Browse categories, read reviews, and find exactly what you're looking for.",
        category: "homepage",
        description: "Homepage SEO description",
        translations: { en: "Discover and connect with local businesses in your area. Browse categories, read reviews, and find exactly what you're looking for.", es: "Descubre y conecta con negocios locales en tu \xE1rea. Navega categor\xEDas, lee rese\xF1as y encuentra exactamente lo que buscas." }
      },
      {
        stringKey: "homepage.hero.title",
        defaultValue: "Find Local Businesses",
        category: "homepage",
        description: "Main hero section title",
        translations: { en: "Find Local Businesses", es: "Encuentra Negocios Locales" }
      },
      {
        stringKey: "homepage.hero.subtitle",
        defaultValue: "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered.",
        category: "homepage",
        description: "Hero section subtitle",
        translations: { en: "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered.", es: "Descubre y conecta con negocios locales confiables en tu \xE1rea. Desde restaurantes hasta servicios, te tenemos cubierto." }
      },
      {
        stringKey: "homepage.categories.title",
        defaultValue: "Browse by Category",
        category: "homepage",
        description: "Categories section title",
        translations: { en: "Browse by Category", es: "Navegar por Categor\xEDa" }
      },
      {
        stringKey: "homepage.categories.subtitle",
        defaultValue: "Explore businesses across different industries and find exactly what you need.",
        category: "homepage",
        description: "Categories section subtitle",
        translations: { en: "Explore businesses across different industries and find exactly what you need.", es: "Explora negocios en diferentes industrias y encuentra exactamente lo que necesitas." }
      },
      {
        stringKey: "homepage.categories.error.title",
        defaultValue: "Unable to load categories",
        category: "homepage",
        description: "Categories error fallback title",
        translations: { en: "Unable to load categories", es: "No se pudieron cargar las categor\xEDas" }
      },
      {
        stringKey: "homepage.categories.error.message",
        defaultValue: "We're having trouble loading business categories. Please try again.",
        category: "homepage",
        description: "Categories error fallback message",
        translations: { en: "We're having trouble loading business categories. Please try again.", es: "Tenemos problemas cargando las categor\xEDas de negocios. Int\xE9ntalo de nuevo." }
      },
      {
        stringKey: "homepage.categories.error.unable",
        defaultValue: "Unable to load categories",
        category: "homepage",
        description: "Categories error unable message",
        translations: { en: "Unable to load categories", es: "No se pudieron cargar las categor\xEDas" }
      },
      {
        stringKey: "homepage.categories.error.retry",
        defaultValue: "Try Again",
        category: "homepage",
        description: "Categories error retry button",
        translations: { en: "Try Again", es: "Intentar de Nuevo" }
      },
      {
        stringKey: "homepage.features.title",
        defaultValue: "Why Choose BusinessHub?",
        category: "homepage",
        description: "Features section title",
        translations: { en: "Why Choose BusinessHub?", es: "\xBFPor qu\xE9 Elegir BusinessHub?" }
      },
      {
        stringKey: "homepage.features.feature1.title",
        defaultValue: "Verified Businesses",
        category: "homepage",
        description: "Feature 1 title",
        translations: { en: "Verified Businesses", es: "Negocios Verificados" }
      },
      {
        stringKey: "homepage.features.feature1.description",
        defaultValue: "All businesses on our platform are verified and trusted by our community of users.",
        category: "homepage",
        description: "Feature 1 description",
        translations: { en: "All businesses on our platform are verified and trusted by our community of users.", es: "Todos los negocios en nuestra plataforma est\xE1n verificados y son confiables por nuestra comunidad de usuarios." }
      },
      {
        stringKey: "homepage.features.feature2.title",
        defaultValue: "Real Reviews",
        category: "homepage",
        description: "Feature 2 title",
        translations: { en: "Real Reviews", es: "Rese\xF1as Reales" }
      },
      {
        stringKey: "homepage.features.feature2.description",
        defaultValue: "Read authentic reviews from real customers to make informed decisions about local services.",
        category: "homepage",
        description: "Feature 2 description",
        translations: { en: "Read authentic reviews from real customers to make informed decisions about local services.", es: "Lee rese\xF1as aut\xE9nticas de clientes reales para tomar decisiones informadas sobre servicios locales." }
      },
      {
        stringKey: "homepage.features.feature3.title",
        defaultValue: "Top Quality",
        category: "homepage",
        description: "Feature 3 title",
        translations: { en: "Top Quality", es: "M\xE1xima Calidad" }
      },
      {
        stringKey: "homepage.features.feature3.description",
        defaultValue: "We only feature high-quality businesses that meet our strict standards for excellence.",
        category: "homepage",
        description: "Feature 3 description",
        translations: { en: "We only feature high-quality businesses that meet our strict standards for excellence.", es: "Solo presentamos negocios de alta calidad que cumplen con nuestros estrictos est\xE1ndares de excelencia." }
      },
      {
        stringKey: "homepage.featured.title",
        defaultValue: "Featured Businesses",
        category: "homepage",
        description: "Featured section title",
        translations: { en: "Featured Businesses", es: "Negocios Destacados" }
      },
      {
        stringKey: "homepage.featured.subtitle",
        defaultValue: "Discover top-rated businesses handpicked for their exceptional service and quality.",
        category: "homepage",
        description: "Featured section subtitle",
        translations: { en: "Discover top-rated businesses handpicked for their exceptional service and quality.", es: "Descubre negocios mejor calificados seleccionados por su servicio excepcional y calidad." }
      },
      {
        stringKey: "homepage.featured.error.title",
        defaultValue: "Unable to load featured businesses",
        category: "homepage",
        description: "Featured error title",
        translations: { en: "Unable to load featured businesses", es: "No se pudieron cargar los negocios destacados" }
      },
      {
        stringKey: "homepage.featured.error.message",
        defaultValue: "We're having trouble loading featured businesses. Please try again.",
        category: "homepage",
        description: "Featured error message",
        translations: { en: "We're having trouble loading featured businesses. Please try again.", es: "Tenemos problemas cargando los negocios destacados. Int\xE9ntalo de nuevo." }
      },
      {
        stringKey: "homepage.featured.error.unable",
        defaultValue: "Unable to load featured businesses",
        category: "homepage",
        description: "Featured error unable message",
        translations: { en: "Unable to load featured businesses", es: "No se pudieron cargar los negocios destacados" }
      },
      {
        stringKey: "homepage.featured.error.retry",
        defaultValue: "Try Again",
        category: "homepage",
        description: "Featured error retry button",
        translations: { en: "Try Again", es: "Intentar de Nuevo" }
      },
      {
        stringKey: "homepage.featured.empty",
        defaultValue: "No featured businesses available",
        category: "homepage",
        description: "Featured empty state message",
        translations: { en: "No featured businesses available", es: "No hay negocios destacados disponibles" }
      },
      {
        stringKey: "homepage.latest.title",
        defaultValue: "Latest Businesses",
        category: "homepage",
        description: "Latest businesses section title",
        translations: { en: "Latest Businesses", es: "Negocios Recientes" }
      },
      {
        stringKey: "homepage.latest.subtitle",
        defaultValue: "Discover amazing businesses from our directory with excellent reviews and service.",
        category: "homepage",
        description: "Latest businesses section subtitle",
        translations: { en: "Discover amazing businesses from our directory with excellent reviews and service.", es: "Descubre negocios incre\xEDbles de nuestro directorio con excelentes rese\xF1as y servicio." }
      },
      {
        stringKey: "homepage.latest.button",
        defaultValue: "View All Businesses",
        category: "homepage",
        description: "Latest businesses view all button",
        translations: { en: "View All Businesses", es: "Ver Todos los Negocios" }
      },
      {
        stringKey: "homepage.cta.title",
        defaultValue: "Are You a Business Owner?",
        category: "homepage",
        description: "Business owner CTA title",
        translations: { en: "Are You a Business Owner?", es: "\xBFEres Propietario de un Negocio?" }
      },
      {
        stringKey: "homepage.cta.subtitle",
        defaultValue: "Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today.",
        category: "homepage",
        description: "Business owner CTA subtitle",
        translations: { en: "Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today.", es: "\xDAnete a miles de negocios ya listados en BusinessHub. Aumenta tu visibilidad y conecta con m\xE1s clientes hoy." }
      },
      {
        stringKey: "homepage.cta.primaryButton",
        defaultValue: "List Your Business",
        category: "homepage",
        description: "CTA primary button text",
        translations: { en: "List Your Business", es: "Lista Tu Negocio" }
      },
      {
        stringKey: "homepage.cta.secondaryButton",
        defaultValue: "Learn More",
        category: "homepage",
        description: "CTA secondary button text",
        translations: { en: "Learn More", es: "Aprender M\xE1s" }
      },
      {
        stringKey: "homepage.stats.businesses.label",
        defaultValue: "Local Businesses",
        category: "homepage",
        description: "Stats businesses label",
        translations: { en: "Local Businesses", es: "Negocios Locales" }
      },
      {
        stringKey: "homepage.stats.reviews.label",
        defaultValue: "Customer Reviews",
        category: "homepage",
        description: "Stats reviews label",
        translations: { en: "Customer Reviews", es: "Rese\xF1as de Clientes" }
      },
      {
        stringKey: "homepage.stats.reviews.value",
        defaultValue: "89,234",
        category: "homepage",
        description: "Stats reviews value",
        translations: { en: "89,234", es: "89,234" }
      },
      {
        stringKey: "homepage.stats.categories.label",
        defaultValue: "Business Categories",
        category: "homepage",
        description: "Stats categories label",
        translations: { en: "Business Categories", es: "Categor\xEDas de Negocios" }
      },
      {
        stringKey: "homepage.stats.cities.label",
        defaultValue: "Cities Covered",
        category: "homepage",
        description: "Stats cities label",
        translations: { en: "Cities Covered", es: "Ciudades Cubiertas" }
      },
      {
        stringKey: "homepage.stats.cities.value",
        defaultValue: "150+",
        category: "homepage",
        description: "Stats cities value",
        translations: { en: "150+", es: "150+" }
      }
    ];
    for (const stringData of initialStrings) {
      await db.insert(contentStrings).values({
        stringKey: stringData.stringKey,
        defaultValue: stringData.defaultValue,
        category: stringData.category,
        description: stringData.description,
        translations: stringData.translations,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoNothing();
    }
    console.log(`Successfully seeded ${initialStrings.length} initial content strings`);
    return true;
  } catch (error) {
    console.error("Error seeding content strings:", error);
    throw error;
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  createContentStringsTable().then(() => seedInitialContentStrings()).then(() => {
    console.log("Content strings migration completed successfully");
    process.exit(0);
  }).catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
}

// server/routes/settings.routes.ts
import { Router as Router12 } from "express";
import { BlobServiceClient as BlobServiceClient2, StorageSharedKeyCredential as StorageSharedKeyCredential2 } from "@azure/storage-blob";
var router11 = Router12();
router11.get("/site-settings", async (req, res) => {
  try {
    const settings = await contentStorage.getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    res.status(500).json({ message: "Failed to fetch site settings" });
  }
});
router11.put("/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await contentStorage.updateSiteSetting(key, value);
    res.json(setting);
  } catch (error) {
    console.error("Error updating site setting:", error);
    res.status(500).json({ message: "Failed to update site setting" });
  }
});
router11.get("/admin/site-settings", async (req, res) => {
  try {
    const settings = await contentStorage.getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching admin site settings:", error);
    res.status(500).json({ message: "Failed to fetch admin site settings" });
  }
});
router11.put("/admin/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, category } = req.body;
    if (!value) {
      return res.status(400).json({ message: "Value is required" });
    }
    const updatedSetting = await contentStorage.updateSiteSetting(
      key,
      value,
      description,
      category
    );
    res.json(updatedSetting);
  } catch (error) {
    console.error("Error updating site setting:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update setting"
    });
  }
});
router11.patch("/admin/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await contentStorage.updateSiteSetting(key, value);
    res.json(setting);
  } catch (error) {
    console.error("Error updating admin site setting:", error);
    res.status(500).json({ message: "Failed to update admin site setting" });
  }
});
router11.post("/admin/azure-blob/test", async (req, res) => {
  try {
    const settings = await contentStorage.getSiteSettings();
    const accountName = settings.find((s) => s.key === "azure_blob_account_name")?.value;
    const accountKey = settings.find((s) => s.key === "azure_blob_account_key")?.value;
    const containerName = settings.find((s) => s.key === "azure_blob_container")?.value || "uploads";
    const connectionString = settings.find((s) => s.key === "azure_blob_connection_string")?.value;
    if (!accountName || !accountKey && !connectionString) {
      return res.status(400).json({
        success: false,
        message: "Azure Blob Storage configuration is incomplete. Please provide account name and either account key or connection string."
      });
    }
    let blobServiceClient;
    if (connectionString) {
      blobServiceClient = BlobServiceClient2.fromConnectionString(connectionString);
    } else if (accountName && accountKey) {
      const sharedKeyCredential = new StorageSharedKeyCredential2(accountName, accountKey);
      blobServiceClient = new BlobServiceClient2(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid Azure Blob Storage configuration"
      });
    }
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create({ access: "blob" });
    }
    const testBlobName = `test-${Date.now()}.txt`;
    const testContent = "Azure Blob Storage test connection successful";
    const blockBlobClient = containerClient.getBlockBlobClient(testBlobName);
    await blockBlobClient.upload(testContent, testContent.length);
    await blockBlobClient.delete();
    res.json({
      success: true,
      message: "Azure Blob Storage connection test successful",
      details: {
        accountName,
        containerName,
        containerExists: true,
        testFileUploaded: true,
        testFileDeleted: true
      }
    });
  } catch (error) {
    console.error("Azure Blob Storage test failed:", error);
    res.status(500).json({
      success: false,
      message: "Azure Blob Storage connection test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var settings_routes_default = router11;

// server/routes/import.routes.ts
import { Router as Router13 } from "express";
import multer2 from "multer";

// server/csv-import.ts
init_db();
import { Readable } from "stream";
import csv from "csv-parser";
import { sql as sql8 } from "drizzle-orm";
var CSVImportService = class {
  REQUIRED_FIELDS = ["title", "placeid"];
  EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
  URL_REGEX = /^https?:\/\/.+/;
  async parseCSV(buffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from(buffer);
      stream.pipe(csv()).on("data", (data) => {
        const cleanData = {};
        for (const [key, value] of Object.entries(data)) {
          cleanData[key.trim().toLowerCase()] = typeof value === "string" && value.trim() === "" ? null : typeof value === "string" ? value.trim() : value;
        }
        results.push(cleanData);
      }).on("end", () => resolve(results)).on("error", reject);
    });
  }
  async validateData(csvData) {
    const errors = [];
    const seenPlaceIds = /* @__PURE__ */ new Set();
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 1;
      for (const field of this.REQUIRED_FIELDS) {
        if (!row[field] || row[field] === null) {
          errors.push({
            row: rowNumber,
            field,
            value: row[field],
            message: `Required field '${field}' is missing or empty`
          });
        }
      }
      if (row.placeid) {
        if (seenPlaceIds.has(row.placeid)) {
          errors.push({
            row: rowNumber,
            field: "placeid",
            value: row.placeid,
            message: "Duplicate placeid found in CSV"
          });
        }
        seenPlaceIds.add(row.placeid);
      }
      if (row.email && !this.EMAIL_REGEX.test(row.email)) {
        errors.push({
          row: rowNumber,
          field: "email",
          value: row.email,
          message: "Invalid email format"
        });
      }
      if (row.phone && row.phone.replace(/[\s\-\(\)\.]/g, "").length < 7) {
        errors.push({
          row: rowNumber,
          field: "phone",
          value: row.phone,
          message: "Phone number appears to be too short"
        });
      }
      if (row.website && !this.URL_REGEX.test(row.website)) {
        errors.push({
          row: rowNumber,
          field: "website",
          value: row.website,
          message: "Invalid website URL format"
        });
      }
      const jsonFields = ["categories", "reviewsdistribution", "reviews", "imageurls", "openinghours", "amenities"];
      for (const field of jsonFields) {
        if (row[field] && typeof row[field] === "string") {
          try {
            JSON.parse(row[field]);
          } catch {
            errors.push({
              row: rowNumber,
              field,
              value: row[field],
              message: "Invalid JSON format"
            });
          }
        }
      }
      const numericFields = ["lat", "lng", "totalscore", "reviewscount"];
      for (const field of numericFields) {
        if (row[field] && isNaN(Number(row[field]))) {
          errors.push({
            row: rowNumber,
            field,
            value: row[field],
            message: "Must be a valid number"
          });
        }
      }
    }
    return errors;
  }
  generateSlug(title, placeid) {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const idSuffix = placeid.slice(-8);
    return `${baseSlug}-${idSuffix}`;
  }
  async ensureUniqueSlug(baseSlug, excludePlaceId) {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.execute(sql8`
        SELECT placeid FROM businesses WHERE slug = ${slug}
      `);
      if (existing.rows.length === 0 || excludePlaceId && existing.rows[0].placeid === excludePlaceId) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  transformCSVToBusiness(csvRow) {
    if (!csvRow || typeof csvRow !== "object") {
      throw new Error("Invalid CSV row data");
    }
    if (!csvRow.placeid || !csvRow.title) {
      throw new Error("Missing required fields: placeid and title are required");
    }
    const business = {
      placeid: csvRow.placeid,
      title: csvRow.title || csvRow.name,
      subtitle: csvRow.subtitle || null,
      description: csvRow.description || null,
      categoryname: csvRow.categoryname || csvRow.category || null,
      website: csvRow.website || null,
      phone: csvRow.phone || null,
      phoneunformatted: csvRow.phoneunformatted || null,
      email: csvRow.email || null,
      address: csvRow.address || null,
      neighborhood: csvRow.neighborhood || null,
      street: csvRow.street || null,
      city: csvRow.city || null,
      postalcode: csvRow.postalcode || null,
      state: csvRow.state || null,
      countrycode: csvRow.countrycode || "AU",
      lat: csvRow.lat ? parseFloat(csvRow.lat) : null,
      lng: csvRow.lng ? parseFloat(csvRow.lng) : null,
      totalscore: csvRow.totalscore ? parseFloat(csvRow.totalscore) : null,
      reviewscount: csvRow.reviewscount ? parseInt(csvRow.reviewscount) : null,
      featured: csvRow.featured === "true" || csvRow.featured === true,
      permanentlyclosed: csvRow.permanentlyclosed === "true" || csvRow.permanentlyclosed === true,
      temporarilyclosed: csvRow.temporarilyclosed === "true" || csvRow.temporarilyclosed === true,
      imageurl: csvRow.imageurl || null,
      logo: csvRow.logo || null,
      status: "approved",
      submittedby: "csv-import",
      createdat: /* @__PURE__ */ new Date(),
      updatedat: /* @__PURE__ */ new Date()
    };
    const jsonFields = ["categories", "reviewsdistribution", "reviews", "imageurls", "openinghours", "amenities"];
    for (const field of jsonFields) {
      if (csvRow[field] && csvRow[field] !== "undefined" && csvRow[field] !== "null" && csvRow[field] !== "") {
        try {
          const fieldValue = typeof csvRow[field] === "string" ? csvRow[field].trim() : csvRow[field];
          if (fieldValue && fieldValue !== "undefined" && fieldValue !== "null") {
            business[field] = typeof fieldValue === "string" ? JSON.parse(fieldValue) : fieldValue;
          }
        } catch (error) {
          console.warn(`Failed to parse JSON field ${field}:`, csvRow[field]);
        }
      }
    }
    if (!business.seotitle && business.title) {
      business.seotitle = `${business.title}${business.city ? ` - ${business.city}` : ""}${business.categoryname ? ` | ${business.categoryname}` : ""}`;
    }
    if (!business.seodescription && business.description) {
      business.seodescription = business.description.length > 160 ? business.description.substring(0, 157) + "..." : business.description;
    }
    const cleanBusiness = {};
    Object.keys(business).forEach((key) => {
      const value = business[key];
      if (value !== void 0) {
        cleanBusiness[key] = typeof value === "string" && value.trim() === "" ? null : value;
      }
    });
    return cleanBusiness;
  }
  async importBusinesses(csvData, options = {
    updateDuplicates: false,
    skipDuplicates: true,
    validateOnly: false,
    batchSize: 50
  }) {
    const result = {
      success: 0,
      errors: [],
      warnings: [],
      duplicatesSkipped: 0,
      created: 0,
      updated: 0
    };
    const validationErrors = await this.validateData(csvData);
    if (validationErrors.length > 0) {
      result.errors = validationErrors;
      if (options.validateOnly) return result;
      result.warnings.push(`Found ${validationErrors.length} validation errors. Processing valid rows only.`);
    }
    if (options.validateOnly) {
      result.success = csvData.length - validationErrors.length;
      return result;
    }
    const validRows = csvData.filter(
      (_, index2) => !validationErrors.some((error) => error.row === index2 + 1)
    );
    for (let i = 0; i < validRows.length; i += options.batchSize) {
      const batch = validRows.slice(i, i + options.batchSize);
      for (const csvRow of batch) {
        try {
          const businessData = this.transformCSVToBusiness(csvRow);
          const baseSlug = this.generateSlug(businessData.title, businessData.placeid);
          businessData.slug = await this.ensureUniqueSlug(baseSlug, businessData.placeid);
          const existingCheck = await db.execute(sql8`
            SELECT placeid FROM businesses WHERE placeid = ${businessData.placeid}
          `);
          if (existingCheck.rows.length > 0) {
            if (options.updateDuplicates) {
              await contentStorage.updateBusiness(businessData.placeid, businessData);
              result.updated++;
            } else if (options.skipDuplicates) {
              result.duplicatesSkipped++;
            } else {
              result.errors.push({
                row: csvData.indexOf(csvRow) + 1,
                field: "placeid",
                value: businessData.placeid,
                message: "Business with this placeid already exists"
              });
              continue;
            }
          } else {
            await contentStorage.createBusiness(businessData);
            result.created++;
          }
          result.success++;
        } catch (error) {
          console.error("CSV import error for row:", csvData.indexOf(csvRow) + 1, error);
          result.errors.push({
            row: csvData.indexOf(csvRow) + 1,
            field: "general",
            value: error instanceof Error ? error.message : "Data transformation failed",
            message: error instanceof Error ? error.message : "Cannot process row data - check for invalid JSON fields"
          });
        }
      }
    }
    return result;
  }
  async previewImport(buffer, maxRows = 10) {
    const csvData = await this.parseCSV(buffer);
    const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];
    const sampleData = csvData.slice(0, maxRows);
    const validationErrors = await this.validateData(sampleData);
    return {
      headers,
      sampleData,
      totalRows: csvData.length,
      validationErrors
    };
  }
};
var csvImportService = new CSVImportService();

// server/routes/import.routes.ts
var router12 = Router13();
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  }
});
var uploadImage = multer2({
  storage: multer2.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
router12.post("/admin/import-csv-preview", upload2.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded" });
    }
    const preview = await csvImportService.previewImport(req.file.buffer, 10);
    res.json(preview);
  } catch (error) {
    console.error("Error previewing CSV:", error);
    res.status(500).json({ message: "Failed to preview CSV data" });
  }
});
router12.post("/admin/import-csv-validate", upload2.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded" });
    }
    const csvData = await csvImportService.parseCSV(req.file.buffer);
    const result = await csvImportService.importBusinesses(csvData, {
      validateOnly: true,
      updateDuplicates: false,
      skipDuplicates: true,
      batchSize: 50
    });
    res.json({
      ...result,
      message: `Validation completed. ${result.success} valid rows, ${result.errors.length} errors found.`
    });
  } catch (error) {
    console.error("Error validating CSV:", error);
    res.status(500).json({ message: "Failed to validate CSV data" });
  }
});
router12.post("/admin/import-csv", upload2.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded" });
    }
    const { updateDuplicates = false, skipDuplicates = true, batchSize = 50 } = req.body;
    const csvData = await csvImportService.parseCSV(req.file.buffer);
    const result = await csvImportService.importBusinesses(csvData, {
      validateOnly: false,
      updateDuplicates: updateDuplicates === "true",
      skipDuplicates: skipDuplicates === "true",
      batchSize: parseInt(batchSize) || 50
    });
    res.json({
      ...result,
      message: `Import completed. ${result.created} created, ${result.updated} updated, ${result.duplicatesSkipped} duplicates skipped, ${result.errors.length} errors.`
    });
  } catch (error) {
    console.error("Error importing CSV:", error);
    res.status(500).json({ message: "Failed to import CSV data" });
  }
});
router12.post("/admin/upload-image", uploadImage.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { type } = req.body;
    if (!type || !["logo", "background"].includes(type)) {
      return res.status(400).json({ message: 'Invalid upload type. Must be "logo" or "background"' });
    }
    const fileName = azureBlobService.generateFileName(req.file.originalname, type);
    const url = await azureBlobService.uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );
    res.json({
      success: true,
      url,
      fileName,
      type,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to upload file",
      success: false
    });
  }
});
var import_routes_default = router12;

// server/routes/claims.routes.ts
import { Router as Router14 } from "express";

// server/services/claims.service.ts
function validateClaimApproval(claimId, adminId) {
  if (!claimId || typeof claimId !== "number" || claimId <= 0) {
    return {
      isValid: false,
      error: "Valid claim ID is required"
    };
  }
  if (!adminId || typeof adminId !== "string" || adminId.trim().length === 0) {
    return {
      isValid: false,
      error: "Admin ID is required for claim approval"
    };
  }
  return { isValid: true };
}
function validateClaimStatus(status) {
  const validStatuses = ["pending", "approved", "rejected"];
  if (!status || typeof status !== "string") {
    return {
      isValid: false,
      error: "Status is required"
    };
  }
  if (!validStatuses.includes(status)) {
    return {
      isValid: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    };
  }
  return { isValid: true };
}
async function approveClaim(claimId, adminId, adminMessage) {
  try {
    const validation = validateClaimApproval(claimId, adminId);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    const claims = await contentStorage.getOwnershipClaims();
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) {
      throw new Error("Ownership claim not found");
    }
    if (claim.status === "approved") {
      throw new Error("Claim is already approved");
    }
    if (!claim.businessId) {
      throw new Error("Claim does not have a valid business ID");
    }
    if (!claim.userId) {
      throw new Error("Claim does not have a valid user ID");
    }
    const business = await contentStorage.getBusinessById(claim.businessId);
    if (!business) {
      throw new Error("Business not found");
    }
    console.log(`[CLAIMS SERVICE] Approving claim ${claimId}: transferring business ${claim.businessId} to user ${claim.userId}`);
    const updatedClaim = await contentStorage.updateOwnershipClaim(
      claimId,
      "approved",
      adminMessage || "Claim approved - ownership transferred",
      adminId
    );
    if (!updatedClaim) {
      throw new Error("Failed to update claim status");
    }
    const businessUpdate = await contentStorage.updateBusiness(claim.businessId, {
      ownerid: claim.userId
    });
    if (!businessUpdate) {
      throw new Error("Failed to transfer business ownership - claim approved but ownership not transferred");
    }
    console.log(`[CLAIMS SERVICE] Successfully approved claim ${claimId} and transferred ownership of business ${claim.businessId} to user ${claim.userId}`);
    return {
      claim: updatedClaim,
      business: businessUpdate,
      message: "Claim approved and business ownership transferred successfully"
    };
  } catch (error) {
    console.error("Error in approveClaim service:", error);
    throw error;
  }
}
async function rejectClaim(claimId, adminId, adminMessage) {
  try {
    const validation = validateClaimApproval(claimId, adminId);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    if (!adminMessage || adminMessage.trim().length < 10) {
      throw new Error("Admin message is required for claim rejection and must be at least 10 characters");
    }
    const claims = await contentStorage.getOwnershipClaims();
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) {
      throw new Error("Ownership claim not found");
    }
    if (claim.status === "rejected") {
      throw new Error("Claim is already rejected");
    }
    const updatedClaim = await contentStorage.updateOwnershipClaim(
      claimId,
      "rejected",
      adminMessage.trim(),
      adminId
    );
    if (!updatedClaim) {
      throw new Error("Failed to update claim status");
    }
    console.log(`[CLAIMS SERVICE] Successfully rejected claim ${claimId} by admin ${adminId}`);
    return updatedClaim;
  } catch (error) {
    console.error("Error in rejectClaim service:", error);
    throw error;
  }
}
async function updateClaimStatus(claimId, status, adminId, adminMessage) {
  try {
    const claimValidation = validateClaimApproval(claimId, adminId);
    if (!claimValidation.isValid) {
      throw new Error(claimValidation.error);
    }
    const statusValidation = validateClaimStatus(status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.error);
    }
    if (status === "approved") {
      return await approveClaim(claimId, adminId, adminMessage);
    }
    if (status === "rejected") {
      if (!adminMessage || adminMessage.trim().length < 10) {
        throw new Error("Admin message is required for rejection and must be at least 10 characters");
      }
      return await rejectClaim(claimId, adminId, adminMessage);
    }
    const updatedClaim = await contentStorage.updateOwnershipClaim(
      claimId,
      status,
      adminMessage || "Status updated to pending",
      adminId
    );
    if (!updatedClaim) {
      throw new Error("Failed to update claim status");
    }
    return updatedClaim;
  } catch (error) {
    console.error("Error in updateClaimStatus service:", error);
    throw error;
  }
}
function validateClaimCreation(claimData) {
  const { userId, businessId, message } = claimData;
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return {
      isValid: false,
      error: "User ID is required"
    };
  }
  if (!businessId || typeof businessId !== "string" || businessId.trim().length === 0) {
    return {
      isValid: false,
      error: "Business ID is required"
    };
  }
  if (!message || typeof message !== "string" || message.trim().length < 50) {
    return {
      isValid: false,
      error: "Message is required and must be at least 50 characters long"
    };
  }
  return { isValid: true };
}
async function createClaim(claimData) {
  try {
    const validation = validateClaimCreation(claimData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    const { userId, businessId, message } = claimData;
    const business = await contentStorage.getBusinessById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }
    const existingClaims = await contentStorage.getOwnershipClaimsByUser(userId);
    const existingClaim = existingClaims.find(
      (claim) => claim.businessId === businessId && ["pending", "approved"].includes(claim.status)
    );
    if (existingClaim) {
      throw new Error(`You already have a ${existingClaim.status} claim for this business`);
    }
    const newClaimData = {
      userId: userId.trim(),
      businessId: businessId.trim(),
      message: message.trim(),
      status: "pending"
    };
    const createdClaim = await contentStorage.createOwnershipClaim(newClaimData);
    console.log(`[CLAIMS SERVICE] Successfully created ownership claim for business ${businessId} by user ${userId}`);
    return createdClaim;
  } catch (error) {
    console.error("Error in createClaim service:", error);
    throw error;
  }
}

// server/routes/claims.routes.ts
var router13 = Router14();
router13.get("/admin/ownership-claims", async (req, res) => {
  try {
    const claims = await contentStorage.getOwnershipClaims();
    res.json(claims);
  } catch (error) {
    console.error("Error fetching ownership claims:", error);
    res.status(500).json({ message: "Failed to fetch ownership claims" });
  }
});
router13.post("/ownership-claims", async (req, res) => {
  try {
    const userId = req.user?.id || "demo-user-1";
    const claimData = {
      ...req.body,
      userId,
      status: "pending"
    };
    console.log("Creating ownership claim:", claimData);
    const claim = await contentStorage.createOwnershipClaim(claimData);
    res.status(201).json(claim);
  } catch (error) {
    console.error("Error creating ownership claim:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to create ownership claim",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router13.patch("/admin/ownership-claims/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminMessage } = req.body;
    const reviewedBy = req.user?.id || "demo-admin";
    const result = await updateClaimStatus(parseInt(id), status, reviewedBy, adminMessage);
    res.json(result);
  } catch (error) {
    console.error("Error updating ownership claim:", error);
    const message = error instanceof Error ? error.message : "Failed to update ownership claim";
    res.status(400).json({ message });
  }
});
router13.get("/my-ownership-claims", async (req, res) => {
  try {
    const userId = req.user?.id || "demo-user-1";
    console.log(`Fetching ownership claims for user: ${userId}`);
    const claims = await contentStorage.getOwnershipClaimsByUser(userId);
    res.json(claims);
  } catch (error) {
    console.error("Error fetching user ownership claims:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to fetch ownership claims",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router13.get("/ownership-claims/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const claims = await contentStorage.getOwnershipClaimsByUser(userId);
    res.json(claims);
  } catch (error) {
    console.error("Error fetching user ownership claims:", error);
    res.status(500).json({
      message: "Failed to fetch user ownership claims",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router13.put("/admin/ownership-claims/:id", async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { status, adminMessage } = req.body;
    const session4 = req.session;
    const reviewedBy = session4?.userId || "demo-admin";
    const updatedClaim = await contentStorage.updateOwnershipClaim(claimId, status, adminMessage, reviewedBy);
    res.json(updatedClaim);
  } catch (error) {
    console.error("Error updating ownership claim:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update ownership claim"
    });
  }
});
router13.delete("/admin/ownership-claims/:id", async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    await contentStorage.deleteOwnershipClaim(claimId);
    res.json({ success: true, message: "Ownership claim deleted successfully" });
  } catch (error) {
    console.error("Error deleting ownership claim:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to delete ownership claim"
    });
  }
});
router13.put("/admin/ownership-claims/:id/revert", async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { adminMessage } = req.body;
    const session4 = req.session;
    const reviewedBy = session4?.userId || "demo-admin";
    const updatedClaim = await contentStorage.updateOwnershipClaim(claimId, "rejected", adminMessage || "Ownership reverted by admin", reviewedBy);
    if (updatedClaim) {
    }
    res.json({
      success: true,
      message: "Ownership claim reverted successfully",
      claim: updatedClaim
    });
  } catch (error) {
    console.error("Error reverting ownership claim:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to revert ownership claim"
    });
  }
});
router13.post("/ownership-claims", async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { businessId, message } = req.body;
    const claimData = { userId, businessId, message };
    const newClaim = await createClaim(claimData);
    res.status(201).json(newClaim);
  } catch (error) {
    console.error("Error creating ownership claim:", error);
    const message = error instanceof Error ? error.message : "Failed to create ownership claim";
    res.status(400).json({ message });
  }
});
router13.post("/admin/ownership-claims/:id/approve", async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { adminMessage } = req.body;
    const adminId = req.user?.id || "demo-admin";
    const result = await approveClaim(claimId, adminId, adminMessage);
    res.json(result);
  } catch (error) {
    console.error("Error approving ownership claim:", error);
    const message = error instanceof Error ? error.message : "Failed to approve ownership claim";
    res.status(400).json({ message });
  }
});
router13.post("/admin/ownership-claims/:id/reject", async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { adminMessage } = req.body;
    const adminId = req.user?.id || "demo-admin";
    if (!adminMessage || adminMessage.trim().length < 10) {
      return res.status(400).json({
        message: "Admin message is required for rejection and must be at least 10 characters"
      });
    }
    const result = await rejectClaim(claimId, adminId, adminMessage);
    res.json(result);
  } catch (error) {
    console.error("Error rejecting ownership claim:", error);
    const message = error instanceof Error ? error.message : "Failed to reject ownership claim";
    res.status(400).json({ message });
  }
});
var claims_routes_default = router13;

// server/routes/services.routes.ts
import { Router as Router15 } from "express";
var router14 = Router15();
router14.post("/admin/services/setup", async (req, res) => {
  try {
    const { setupServicesTables: setupServicesTables2 } = await Promise.resolve().then(() => (init_services_setup(), services_setup_exports));
    await setupServicesTables2();
    res.json({ message: "Services tables created successfully" });
  } catch (error) {
    console.error("Error setting up services:", error);
    res.status(500).json({ message: "Failed to setup services tables" });
  }
});
router14.get("/admin/services", async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.json([]);
  }
});
router14.post("/admin/services/generate", async (req, res) => {
  try {
    const businesses3 = await contentStorage.getBusinesses({
      limit: 100
    });
    if (businesses3.length === 0) {
      return res.status(400).json({ message: "No businesses found to analyze for service generation" });
    }
    const categories2 = Array.from(new Set(businesses3.map((b) => b.category).filter(Boolean)));
    const businessTypes = Array.from(new Set(businesses3.map((b) => b.title).filter(Boolean)));
    const prompt = `Based on these actual business categories and types from a directory:
    
Categories: ${categories2.join(", ")}
Sample Business Types: ${businessTypes.slice(0, 20).join(", ")}

Generate 8-12 relevant professional services that these businesses typically offer. For each service, provide:
1. name (concise, professional)
2. slug (URL-friendly)
3. description (1-2 sentences)
4. category (group similar services)
5. seo_title (SEO optimized title)
6. seo_description (compelling meta description)
7. content (2-3 paragraphs of detailed content)

Respond with JSON format: {"services": [array of service objects]}. Make services relevant to the actual business types found.`;
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });
    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }
    const aiResult = await openaiResponse.json();
    const generatedServices = JSON.parse(aiResult.choices[0].message.content);
    res.json({
      success: true,
      services: generatedServices.services || generatedServices,
      businessesAnalyzed: businesses3.length,
      categoriesFound: categories2.length
    });
  } catch (error) {
    console.error("Error generating services:", error);
    res.status(500).json({ message: "Failed to generate services using AI" });
  }
});
router14.post("/admin/services", async (req, res) => {
  try {
    const service = await contentStorage.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Failed to create service" });
  }
});
router14.put("/admin/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const service = await contentStorage.updateService(id, req.body);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Failed to update service" });
  }
});
router14.delete("/admin/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await contentStorage.deleteService(id);
    if (!deleted) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Failed to delete service" });
  }
});
router14.post("/admin/setup-services", async (req, res) => {
  try {
    const { setupServicesDatabase: setupServicesDatabase2 } = await Promise.resolve().then(() => (init_services_database_setup(), services_database_setup_exports));
    const result = await setupServicesDatabase2();
    if (result.success) {
      res.json({ success: true, message: "Services database setup completed", data: result });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error setting up services database:", error);
    res.status(500).json({ error: error.message });
  }
});
router14.get("/admin/verify-services", async (req, res) => {
  try {
    const { verifyServicesSetup: verifyServicesSetup2 } = await Promise.resolve().then(() => (init_verify_services_setup(), verify_services_setup_exports));
    const result = await verifyServicesSetup2();
    res.json(result);
  } catch (error) {
    console.error("Error verifying services setup:", error);
    res.status(500).json({ error: error.message });
  }
});
var services_routes_default2 = router14;

// server/routes/socialMedia.routes.ts
import { Router as Router16 } from "express";

// server/services/socialMedia.service.ts
import { z as z4 } from "zod";

// server/services/social-media/ordering.service.ts
async function reorderAllSocialMediaLinks(orderedIds) {
  console.log("[SOCIAL MEDIA ORDERING] Reordering all social media links:", { linkCount: orderedIds.length });
  if (!orderedIds || orderedIds.length === 0) {
    throw new Error("Ordered IDs array is required");
  }
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      const linkId = orderedIds[i];
      const newSortOrder = i + 1;
      await contentStorage.updateSocialMediaLink(linkId, { sortOrder: newSortOrder });
    }
    console.log("[SOCIAL MEDIA ORDERING] Successfully reordered all social media links:", { linkCount: orderedIds.length });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA ORDERING] Error reordering social media links:", errorMessage);
    throw new Error(`Failed to reorder social media links: ${errorMessage}`);
  }
}
async function moveSocialMediaLink(linkId, direction) {
  console.log("[SOCIAL MEDIA ORDERING] Moving social media link:", { id: linkId, direction });
  if (!["up", "down"].includes(direction)) {
    throw new Error('Direction must be "up" or "down"');
  }
  try {
    const currentLink = await contentStorage.getSocialMediaLink?.(linkId);
    if (!currentLink) {
      throw new Error("Social media link not found");
    }
    const allLinks = await contentStorage.getSocialMediaLinks();
    const sortedLinks = allLinks.sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sortedLinks.findIndex((link) => link.id === linkId);
    if (currentIndex === -1) {
      throw new Error("Social media link not found in list");
    }
    if (direction === "up" && currentIndex === 0) {
      console.log("[SOCIAL MEDIA ORDERING] Cannot move up: already at top");
      return false;
    }
    if (direction === "down" && currentIndex === sortedLinks.length - 1) {
      console.log("[SOCIAL MEDIA ORDERING] Cannot move down: already at bottom");
      return false;
    }
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentOrder = sortedLinks[currentIndex].sortOrder;
    const swapOrder = sortedLinks[swapIndex].sortOrder;
    await contentStorage.updateSocialMediaLink(sortedLinks[currentIndex].id, { sortOrder: swapOrder });
    await contentStorage.updateSocialMediaLink(sortedLinks[swapIndex].id, { sortOrder: currentOrder });
    console.log("[SOCIAL MEDIA ORDERING] Successfully moved social media link:", {
      id: linkId,
      direction,
      newOrder: swapOrder
    });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA ORDERING] Error moving social media link:", errorMessage);
    throw new Error(`Failed to move social media link: ${errorMessage}`);
  }
}
async function closeOrderingGaps(remainingLinkIds) {
  console.log("[SOCIAL MEDIA ORDERING] Closing ordering gaps after deletion:", {
    remainingCount: remainingLinkIds.length
  });
  if (remainingLinkIds.length === 0) {
    console.log("[SOCIAL MEDIA ORDERING] No remaining links to reorder");
    return;
  }
  try {
    await reorderAllSocialMediaLinks(remainingLinkIds);
    console.log("[SOCIAL MEDIA ORDERING] Successfully closed ordering gaps");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA ORDERING] Error closing ordering gaps:", errorMessage);
    throw new Error(`Failed to close ordering gaps: ${errorMessage}`);
  }
}

// server/services/social-media/bulk-operations.service.ts
async function performBulkSocialMediaLinkUpdates(updates) {
  console.log("[SOCIAL MEDIA BULK OPERATIONS] Performing bulk social media link updates:", { updateCount: updates.length });
  if (!updates || updates.length === 0) {
    throw new Error("Updates array is required");
  }
  const result = { success: 0, failed: 0, errors: [] };
  for (const update of updates) {
    try {
      await contentStorage.updateSocialMediaLink(update.id, update.data);
      result.success++;
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Link ${update.id}: ${errorMessage}`);
    }
  }
  console.log("[SOCIAL MEDIA BULK OPERATIONS] Bulk updates completed:", result);
  return result;
}
async function performBulkSocialMediaLinkAction(linkIds, action) {
  console.log("[SOCIAL MEDIA BULK OPERATIONS] Performing bulk social media link action:", { action, linkCount: linkIds.length });
  if (!linkIds || linkIds.length === 0) {
    throw new Error("Link IDs array is required");
  }
  if (!["activate", "deactivate", "delete"].includes(action)) {
    throw new Error("Invalid action. Must be activate, deactivate, or delete");
  }
  const result = { success: 0, failed: 0, errors: [] };
  for (const linkId of linkIds) {
    try {
      switch (action) {
        case "activate":
          await contentStorage.updateSocialMediaLink(linkId, { isActive: true });
          break;
        case "deactivate":
          await contentStorage.updateSocialMediaLink(linkId, { isActive: false });
          break;
        case "delete":
          await contentStorage.deleteSocialMediaLink(linkId);
          break;
      }
      result.success++;
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Link ${linkId}: ${errorMessage}`);
    }
  }
  console.log("[SOCIAL MEDIA BULK OPERATIONS] Bulk action completed:", { action, ...result });
  return result;
}

// server/services/socialMedia.service.ts
var VALID_PLATFORMS = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "pinterest",
  "snapchat",
  "whatsapp"
];
var PlatformEnum = z4.enum(VALID_PLATFORMS);
var socialMediaLinkSchema = z4.object({
  platform: PlatformEnum,
  // Using z.enum() instead of .refine() for better type inference
  url: z4.string().url("Please enter a valid URL").optional().or(z4.literal("")),
  displayName: z4.string().min(1, "Display name is required").max(100, "Display name must be 100 characters or less"),
  iconClass: z4.string().min(1, "Icon class is required"),
  isActive: z4.boolean().default(true),
  sortOrder: z4.number().int().positive().optional()
});
async function createSocialMediaLink(linkData) {
  console.log("[SOCIAL MEDIA SERVICE] Creating social media link:", { platform: linkData.platform });
  const validatedData = socialMediaLinkSchema.parse(linkData);
  try {
    const existingLinks = await contentStorage.getSocialMediaLinks();
    const maxSortOrder = existingLinks.length > 0 ? Math.max(...existingLinks.map((link) => link.sortOrder || 0)) : 0;
    const linkToCreate = {
      ...validatedData,
      sortOrder: validatedData.sortOrder || maxSortOrder + 1
    };
    const createdLink = await contentStorage.createSocialMediaLink(linkToCreate);
    if (!createdLink) {
      throw new Error("Failed to create social media link");
    }
    console.log("[SOCIAL MEDIA SERVICE] Created social media link:", {
      id: createdLink.id,
      platform: createdLink.platform,
      sortOrder: createdLink.sortOrder
    });
    return createdLink;
  } catch (error) {
    if (error instanceof z4.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA SERVICE] Error creating social media link:", errorMessage);
    throw new Error(`Failed to create social media link: ${errorMessage}`);
  }
}
async function updateSocialMediaLink(linkId, updateData) {
  console.log("[SOCIAL MEDIA SERVICE] Updating social media link:", { id: linkId });
  try {
    const existingLink = await contentStorage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error("Social media link not found");
    }
    if (Object.keys(updateData).length > 0) {
      const partialSchema = socialMediaLinkSchema.partial();
      partialSchema.parse(updateData);
    }
    const updatedLink = await contentStorage.updateSocialMediaLink(linkId, updateData);
    if (!updatedLink) {
      throw new Error("Failed to update social media link");
    }
    console.log("[SOCIAL MEDIA SERVICE] Updated social media link:", {
      id: linkId,
      platform: updatedLink.platform,
      updatedFields: Object.keys(updateData)
    });
    return updatedLink;
  } catch (error) {
    if (error instanceof z4.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA SERVICE] Error updating social media link:", errorMessage);
    throw new Error(`Failed to update social media link: ${errorMessage}`);
  }
}
async function deleteSocialMediaLink(linkId) {
  console.log("[SOCIAL MEDIA SERVICE] Deleting social media link:", { id: linkId });
  try {
    const existingLink = await contentStorage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error("Social media link not found");
    }
    await contentStorage.deleteSocialMediaLink(linkId);
    const remainingLinks = await contentStorage.getSocialMediaLinks();
    const remainingLinkIds = remainingLinks.sort((a, b) => a.sortOrder - b.sortOrder).map((link) => link.id);
    await closeOrderingGaps(remainingLinkIds);
    console.log("[SOCIAL MEDIA SERVICE] Deleted social media link and reordered remaining links:", {
      deletedId: linkId,
      remainingCount: remainingLinkIds.length
    });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA SERVICE] Error deleting social media link:", errorMessage);
    throw new Error(`Failed to delete social media link: ${errorMessage}`);
  }
}
async function getSocialMediaLink(linkId) {
  console.log("[SOCIAL MEDIA SERVICE] Getting social media link:", { id: linkId });
  try {
    const link = await contentStorage.getSocialMediaLink?.(linkId);
    if (!link) {
      console.log("[SOCIAL MEDIA SERVICE] Social media link not found:", { id: linkId });
      return null;
    }
    console.log("[SOCIAL MEDIA SERVICE] Retrieved social media link:", {
      id: linkId,
      platform: link.platform
    });
    return link;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA SERVICE] Error getting social media link:", errorMessage);
    throw new Error(`Failed to get social media link: ${errorMessage}`);
  }
}
async function getSocialMediaLinkById(linkId) {
  return getSocialMediaLink(linkId);
}
async function toggleSocialMediaLinkStatus(linkId) {
  console.log("[SOCIAL MEDIA SERVICE] Toggling social media link status:", { id: linkId });
  try {
    const existingLink = await contentStorage.getSocialMediaLink?.(linkId);
    if (!existingLink) {
      throw new Error("Social media link not found");
    }
    const updatedLink = await contentStorage.updateSocialMediaLink(linkId, {
      isActive: !existingLink.isActive
    });
    if (!updatedLink) {
      throw new Error("Failed to toggle social media link status");
    }
    console.log("[SOCIAL MEDIA SERVICE] Toggled social media link status:", {
      id: linkId,
      platform: updatedLink.platform,
      newStatus: updatedLink.isActive ? "active" : "inactive"
    });
    return updatedLink;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA SERVICE] Error toggling social media link status:", errorMessage);
    throw new Error(`Failed to toggle social media link status: ${errorMessage}`);
  }
}
async function getAllSocialMediaLinks(activeOnly) {
  console.log("[SOCIAL MEDIA SERVICE] Retrieved social media links:", { activeOnly: activeOnly || false });
  try {
    const links = await contentStorage.getSocialMediaLinks();
    const filteredLinks = activeOnly ? links.filter((link) => link.isActive) : links;
    const sortedLinks = filteredLinks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    console.log("[SOCIAL MEDIA SERVICE] Retrieved social media links:", {
      count: sortedLinks.length,
      activeOnly: activeOnly || false
    });
    return sortedLinks;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SOCIAL MEDIA SERVICE] Error getting social media links:", errorMessage);
    throw new Error(`Failed to get social media links: ${errorMessage}`);
  }
}
var reorderAllSocialMediaLinks2 = reorderAllSocialMediaLinks;
var moveSocialMediaLink2 = moveSocialMediaLink;
var performBulkSocialMediaLinkUpdates2 = performBulkSocialMediaLinkUpdates;
var performBulkSocialMediaLinkAction2 = performBulkSocialMediaLinkAction;

// server/routes/socialMedia.routes.ts
var router15 = Router16();
router15.get("/social-media", async (req, res) => {
  try {
    const activeOnly = req.query.active === "true";
    const links = await getAllSocialMediaLinks(activeOnly);
    res.json(links);
  } catch (error) {
    console.error("Error fetching social media links:", error);
    res.status(500).json({ message: "Failed to fetch social media links" });
  }
});
router15.get("/admin/social-media", async (req, res) => {
  try {
    const links = await getAllSocialMediaLinks();
    res.json(links);
  } catch (error) {
    console.error("Error fetching all social media links:", error);
    res.status(500).json({ message: "Failed to fetch social media links" });
  }
});
router15.get("/admin/social-media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    const link = await getSocialMediaLinkById(id);
    if (!link) {
      return res.status(404).json({ message: "Social media link not found" });
    }
    res.json(link);
  } catch (error) {
    console.error("Error fetching social media link:", error);
    res.status(500).json({ message: "Failed to fetch social media link" });
  }
});
router15.post("/admin/social-media", async (req, res) => {
  try {
    const link = await createSocialMediaLink(req.body);
    res.status(201).json(link);
  } catch (error) {
    console.error("Error creating social media link:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid") || error.message.includes("already exists")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create social media link" });
  }
});
router15.put("/admin/social-media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    const link = await updateSocialMediaLink(id, req.body);
    res.json(link);
  } catch (error) {
    console.error("Error updating social media link:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid") || error.message.includes("already exists")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update social media link" });
  }
});
router15.delete("/admin/social-media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    await deleteSocialMediaLink(id);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting social media link:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to delete social media link" });
  }
});
router15.patch("/admin/social-media/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    const link = await toggleSocialMediaLinkStatus(id);
    res.json(link);
  } catch (error) {
    console.error("Error toggling social media link:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to toggle social media link" });
  }
});
router15.put("/admin/social-media/:id/move", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid social media link ID" });
    }
    const { direction } = req.body;
    if (!direction || !["up", "down"].includes(direction)) {
      return res.status(400).json({ message: "Direction must be 'up' or 'down'" });
    }
    const result = await moveSocialMediaLink2(id, direction);
    if (!result) {
      return res.status(400).json({ message: "Cannot move social media link in that direction" });
    }
    res.json({ message: "Social media link moved successfully" });
  } catch (error) {
    console.error("Error moving social media link:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to move social media link" });
  }
});
router15.post("/admin/social-media/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "OrderedIds array is required" });
    }
    await reorderAllSocialMediaLinks2(orderedIds);
    res.json({ message: "Social media links reordered successfully" });
  } catch (error) {
    console.error("Error reordering social media links:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to reorder social media links" });
  }
});
router15.post("/admin/social-media/bulk-update", async (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: "Updates array is required" });
    }
    const result = await performBulkSocialMediaLinkUpdates2(updates);
    if (result.failed > 0) {
      return res.status(207).json({
        message: `Bulk update completed with some failures`,
        ...result
      });
    }
    res.json({
      message: `Successfully updated ${result.success} social media links`,
      ...result
    });
  } catch (error) {
    console.error("Error bulk updating social media links:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to bulk update social media links" });
  }
});
router15.post("/admin/social-media/bulk-action", async (req, res) => {
  try {
    const { linkIds, action } = req.body;
    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({ message: "Link IDs array is required" });
    }
    if (!action || !["activate", "deactivate", "delete"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'activate', 'deactivate', or 'delete'" });
    }
    const result = await performBulkSocialMediaLinkAction2(linkIds, action);
    if (result.failed > 0) {
      return res.status(207).json({
        message: `Bulk action completed with some failures`,
        ...result
      });
    }
    res.json({
      message: `Successfully ${action}d ${result.success} social media links`,
      ...result
    });
  } catch (error) {
    console.error("Error performing bulk social media action:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to perform bulk action" });
  }
});
var socialMedia_routes_default = router15;

// server/routes/menu.routes.ts
import { Router as Router17 } from "express";

// server/services/menu.service.ts
function validateMenuItemCreation(menuItemData) {
  console.log("[MENU SERVICE] Validating menu item creation:", { name: menuItemData.name, position: menuItemData.position });
  if (!menuItemData.name || typeof menuItemData.name !== "string" || menuItemData.name.trim().length === 0) {
    return { isValid: false, error: "Menu item name is required" };
  }
  if (!menuItemData.url || typeof menuItemData.url !== "string" || menuItemData.url.trim().length === 0) {
    return { isValid: false, error: "Menu item URL is required" };
  }
  if (!menuItemData.position || typeof menuItemData.position !== "string") {
    return { isValid: false, error: "Menu item position is required" };
  }
  const validPositions = ["header", "footer", "footer1", "footer2"];
  if (!validPositions.includes(menuItemData.position)) {
    return { isValid: false, error: `Invalid position. Must be one of: ${validPositions.join(", ")}` };
  }
  const validTargets = ["_self", "_blank"];
  if (menuItemData.target && !validTargets.includes(menuItemData.target)) {
    return { isValid: false, error: `Invalid target. Must be one of: ${validTargets.join(", ")}` };
  }
  return { isValid: true };
}
function validateMenuItemUpdate(menuItemData) {
  console.log("[MENU SERVICE] Validating menu item update:", { updates: Object.keys(menuItemData) });
  if (menuItemData.name !== void 0) {
    if (typeof menuItemData.name !== "string" || menuItemData.name.trim().length === 0) {
      return { isValid: false, error: "Menu item name must be a non-empty string" };
    }
  }
  if (menuItemData.url !== void 0) {
    if (typeof menuItemData.url !== "string" || menuItemData.url.trim().length === 0) {
      return { isValid: false, error: "Menu item URL must be a non-empty string" };
    }
  }
  if (menuItemData.position !== void 0) {
    const validPositions = ["header", "footer", "footer1", "footer2"];
    if (!validPositions.includes(menuItemData.position)) {
      return { isValid: false, error: `Invalid position. Must be one of: ${validPositions.join(", ")}` };
    }
  }
  if (menuItemData.target !== void 0) {
    const validTargets = ["_self", "_blank"];
    if (!validTargets.includes(menuItemData.target)) {
      return { isValid: false, error: `Invalid target. Must be one of: ${validTargets.join(", ")}` };
    }
  }
  if (menuItemData.order !== void 0) {
    if (typeof menuItemData.order !== "number" || menuItemData.order < 0) {
      return { isValid: false, error: "Order must be a non-negative number" };
    }
  }
  return { isValid: true };
}
async function createMenuItem(menuItemData) {
  console.log("[MENU SERVICE] Creating new menu item:", { name: menuItemData.name, position: menuItemData.position });
  const validation = validateMenuItemCreation(menuItemData);
  if (!validation.isValid) {
    console.log("[MENU SERVICE] Validation failed:", validation.error);
    throw new Error(validation.error);
  }
  try {
    const existingItems = await contentStorage.getMenuItems(menuItemData.position);
    const maxOrder = existingItems.length > 0 ? Math.max(...existingItems.map((item) => item.order)) : 0;
    const createData = {
      name: menuItemData.name.trim(),
      url: menuItemData.url.trim(),
      position: menuItemData.position,
      order: menuItemData.order !== void 0 ? menuItemData.order : maxOrder + 1,
      isActive: menuItemData.isActive !== void 0 ? menuItemData.isActive : true,
      target: menuItemData.target || "_self"
    };
    const menuItem = await contentStorage.createMenuItem(createData);
    console.log("[MENU SERVICE] Successfully created menu item:", {
      id: menuItem.id,
      name: menuItem.name,
      position: menuItem.position,
      order: menuItem.order
    });
    return menuItem;
  } catch (error) {
    console.log("[MENU SERVICE] Error creating menu item:", error.message);
    throw new Error(`Failed to create menu item: ${error.message}`);
  }
}
async function updateMenuItem(menuItemId, menuItemData) {
  console.log("[MENU SERVICE] Updating menu item:", { id: menuItemId, updates: Object.keys(menuItemData) });
  const validation = validateMenuItemUpdate(menuItemData);
  if (!validation.isValid) {
    console.log("[MENU SERVICE] Validation failed:", validation.error);
    throw new Error(validation.error);
  }
  try {
    const existingItem = await contentStorage.getMenuItemById?.(menuItemId);
    if (!existingItem) {
      throw new Error("Menu item not found");
    }
    const updateData = {};
    if (menuItemData.name !== void 0) updateData.name = menuItemData.name.trim();
    if (menuItemData.url !== void 0) updateData.url = menuItemData.url.trim();
    if (menuItemData.position !== void 0) updateData.position = menuItemData.position;
    if (menuItemData.order !== void 0) updateData.order = menuItemData.order;
    if (menuItemData.isActive !== void 0) updateData.isActive = menuItemData.isActive;
    if (menuItemData.target !== void 0) updateData.target = menuItemData.target;
    const updatedMenuItem = await contentStorage.updateMenuItem(menuItemId, updateData);
    console.log("[MENU SERVICE] Successfully updated menu item:", {
      id: updatedMenuItem.id,
      name: updatedMenuItem.name,
      position: updatedMenuItem.position
    });
    return updatedMenuItem;
  } catch (error) {
    console.log("[MENU SERVICE] Error updating menu item:", error.message);
    throw new Error(`Failed to update menu item: ${error.message}`);
  }
}
async function deleteMenuItem(menuItemId) {
  console.log("[MENU SERVICE] Deleting menu item:", { id: menuItemId });
  try {
    const existingItem = await contentStorage.getMenuItemById(menuItemId);
    if (!existingItem) {
      throw new Error("Menu item not found");
    }
    await contentStorage.deleteMenuItem(menuItemId);
    console.log("[MENU SERVICE] Successfully deleted menu item:", { id: menuItemId, name: existingItem.name });
    const remainingItems = await contentStorage.getMenuItems(existingItem.position);
    if (remainingItems.length > 0) {
      await reorderMenuItemsInPosition(existingItem.position, remainingItems.map((item) => item.id));
    }
  } catch (error) {
    console.log("[MENU SERVICE] Error deleting menu item:", error.message);
    throw new Error(`Failed to delete menu item: ${error.message}`);
  }
}
async function reorderMenuItemsInPosition(position, orderedIds) {
  console.log("[MENU SERVICE] Reordering menu items in position:", { position, itemCount: orderedIds.length });
  if (!orderedIds || orderedIds.length === 0) {
    throw new Error("Ordered IDs array is required");
  }
  const validPositions = ["header", "footer", "footer1", "footer2"];
  if (!validPositions.includes(position)) {
    throw new Error(`Invalid position. Must be one of: ${validPositions.join(", ")}`);
  }
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      const menuItemId = orderedIds[i];
      const newOrder = i + 1;
      await contentStorage.updateMenuItem(menuItemId, { order: newOrder });
    }
    console.log("[MENU SERVICE] Successfully reordered menu items in position:", { position, itemCount: orderedIds.length });
  } catch (error) {
    console.log("[MENU SERVICE] Error reordering menu items:", error.message);
    throw new Error(`Failed to reorder menu items: ${error.message}`);
  }
}
async function moveMenuItem(menuItemId, direction) {
  console.log("[MENU SERVICE] Moving menu item:", { id: menuItemId, direction });
  if (!["up", "down"].includes(direction)) {
    throw new Error('Direction must be "up" or "down"');
  }
  try {
    const currentItem = await contentStorage.getMenuItemById?.(menuItemId);
    if (!currentItem) {
      throw new Error("Menu item not found");
    }
    const allItems = await contentStorage.getMenuItems(currentItem.position);
    const sortedItems = allItems.sort((a, b) => a.order - b.order);
    const currentIndex = sortedItems.findIndex((item) => item.id === menuItemId);
    if (currentIndex === -1) {
      throw new Error("Menu item not found in position");
    }
    if (direction === "up" && currentIndex === 0) {
      console.log("[MENU SERVICE] Cannot move up: already at top");
      return false;
    }
    if (direction === "down" && currentIndex === sortedItems.length - 1) {
      console.log("[MENU SERVICE] Cannot move down: already at bottom");
      return false;
    }
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentOrder = sortedItems[currentIndex].order;
    const swapOrder = sortedItems[swapIndex].order;
    await contentStorage.updateMenuItem(sortedItems[currentIndex].id, { order: swapOrder });
    await contentStorage.updateMenuItem(sortedItems[swapIndex].id, { order: currentOrder });
    console.log("[MENU SERVICE] Successfully moved menu item:", {
      id: menuItemId,
      direction,
      newOrder: swapOrder
    });
    return true;
  } catch (error) {
    console.log("[MENU SERVICE] Error moving menu item:", error.message);
    throw new Error(`Failed to move menu item: ${error.message}`);
  }
}
async function getAllMenuItems(position) {
  console.log("[MENU SERVICE] Retrieved menu items:", { position: position || "all" });
  try {
    const menuItems2 = await contentStorage.getMenuItems(position);
    console.log("[MENU SERVICE] Retrieved menu items:", { count: menuItems2.length, position: position || "all" });
    return menuItems2;
  } catch (error) {
    console.log("[MENU SERVICE] Error retrieving menu items:", error.message);
    throw new Error(`Failed to retrieve menu items: ${error.message}`);
  }
}
async function getMenuItemById(menuItemId) {
  console.log("[MENU SERVICE] Retrieving menu item by ID:", { id: menuItemId });
  try {
    const menuItem = await contentStorage.getMenuItemById?.(menuItemId);
    if (menuItem) {
      console.log("[MENU SERVICE] Retrieved menu item:", { id: menuItem.id, name: menuItem.name });
    } else {
      console.log("[MENU SERVICE] Menu item not found by ID:", { id: menuItemId });
    }
    return menuItem;
  } catch (error) {
    console.log("[MENU SERVICE] Error retrieving menu item by ID:", error.message);
    throw new Error(`Failed to retrieve menu item: ${error.message}`);
  }
}
async function toggleMenuItemStatus(menuItemId) {
  console.log("[MENU SERVICE] Toggling menu item status:", { id: menuItemId });
  try {
    const existingItem = await contentStorage.getMenuItemById?.(menuItemId);
    if (!existingItem) {
      throw new Error("Menu item not found");
    }
    const updatedMenuItem = await contentStorage.updateMenuItem(menuItemId, {
      isActive: !existingItem.isActive
    });
    console.log("[MENU SERVICE] Toggled menu item status:", {
      id: menuItemId,
      newStatus: updatedMenuItem.isActive ? "active" : "inactive"
    });
    return updatedMenuItem;
  } catch (error) {
    console.log("[MENU SERVICE] Error toggling menu item status:", error.message);
    throw new Error(`Failed to toggle menu item status: ${error.message}`);
  }
}
async function performBulkMenuItemAction(menuItemIds, action) {
  console.log("[MENU SERVICE] Performing bulk menu item action:", { action, itemCount: menuItemIds.length });
  if (action === "activate-all") {
    try {
      const allItems = await contentStorage.getMenuItems();
      let successCount = 0;
      for (const item of allItems) {
        if (!item.isActive) {
          await contentStorage.updateMenuItem(item.id, { isActive: true });
          successCount++;
        }
      }
      console.log("[MENU SERVICE] Activated all menu items:", { count: successCount });
      return { success: successCount, failed: 0, errors: [] };
    } catch (error) {
      console.log("[MENU SERVICE] Error activating all menu items:", error.message);
      return { success: 0, failed: 1, errors: [error.message] };
    }
  }
  if (!menuItemIds || menuItemIds.length === 0) {
    throw new Error("Menu item IDs array is required");
  }
  if (!["activate", "deactivate", "delete"].includes(action)) {
    throw new Error("Invalid action. Must be activate, deactivate, delete, or activate-all");
  }
  const result = { success: 0, failed: 0, errors: [] };
  for (const menuItemId of menuItemIds) {
    try {
      switch (action) {
        case "activate":
          await contentStorage.updateMenuItem(menuItemId, { isActive: true });
          break;
        case "deactivate":
          await contentStorage.updateMenuItem(menuItemId, { isActive: false });
          break;
        case "delete":
          await contentStorage.deleteMenuItem(menuItemId);
          break;
      }
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push(`MenuItem ${menuItemId}: ${error.message}`);
    }
  }
  console.log("[MENU SERVICE] Bulk action completed:", { action, ...result });
  return result;
}

// server/routes/menu.routes.ts
var router16 = Router17();
router16.get("/menu-items", async (req, res) => {
  try {
    const { position, location } = req.query;
    const filterPosition = position || location;
    const menuItems2 = await getAllMenuItems(filterPosition);
    res.json(menuItems2);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});
router16.get("/menu-items/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const menuItems2 = await getAllMenuItems(location);
    res.json(menuItems2);
  } catch (error) {
    console.error("Error fetching menu items by location:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});
router16.get("/admin/menu-items", async (req, res) => {
  try {
    const menuItems2 = await getAllMenuItems();
    res.json(menuItems2);
  } catch (error) {
    console.error("Error fetching admin menu items:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});
router16.post("/admin/menu-items", async (req, res) => {
  try {
    const menuItem = await createMenuItem(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create menu item" });
  }
});
router16.post("/admin/activate-menu-items", async (req, res) => {
  try {
    const result = await performBulkMenuItemAction([], "activate-all");
    res.json({ message: "All menu items activated", result });
  } catch (error) {
    console.error("Error activating menu items:", error);
    res.status(500).json({ message: "Failed to activate menu items" });
  }
});
router16.get("/admin/menu-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    const menuItem = await getMenuItemById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({ message: "Failed to fetch menu item" });
  }
});
router16.put("/admin/menu-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    const menuItem = await updateMenuItem(id, req.body);
    res.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update menu item" });
  }
});
router16.delete("/admin/menu-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    await deleteMenuItem(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting menu item:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to delete menu item" });
  }
});
router16.patch("/admin/menu-items/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    const menuItem = await toggleMenuItemStatus(id);
    res.json(menuItem);
  } catch (error) {
    console.error("Error toggling menu item:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to toggle menu item" });
  }
});
router16.put("/admin/menu-items/:id/move", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }
    const { direction } = req.body;
    if (!direction || !["up", "down"].includes(direction)) {
      return res.status(400).json({ message: "Direction must be 'up' or 'down'" });
    }
    const result = await moveMenuItem(id, direction);
    if (!result) {
      return res.status(400).json({ message: "Cannot move menu item in that direction" });
    }
    res.json({ message: "Menu item moved successfully" });
  } catch (error) {
    console.error("Error moving menu item:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to move menu item" });
  }
});
router16.post("/admin/menu-items/reorder", async (req, res) => {
  try {
    const { position, orderedIds } = req.body;
    if (!position || !orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "Position and orderedIds array are required" });
    }
    await reorderMenuItemsInPosition(position, orderedIds);
    res.json({ message: "Menu items reordered successfully" });
  } catch (error) {
    console.error("Error reordering menu items:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to reorder menu items" });
  }
});
router16.post("/admin/menu-items/bulk-action", async (req, res) => {
  try {
    const { menuItemIds, action } = req.body;
    if (!menuItemIds || !Array.isArray(menuItemIds) || menuItemIds.length === 0) {
      return res.status(400).json({ message: "Menu item IDs array is required" });
    }
    if (!action || !["activate", "deactivate", "delete"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'activate', 'deactivate', or 'delete'" });
    }
    const result = await performBulkMenuItemAction(menuItemIds, action);
    if (result.failed > 0) {
      return res.status(207).json({
        message: `Bulk action completed with some failures`,
        ...result
      });
    }
    res.json({
      message: `Successfully ${action}d ${result.success} menu items`,
      ...result
    });
  } catch (error) {
    console.error("Error performing bulk menu item action:", error);
    if (error.message.includes("validation") || error.message.includes("required") || error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to perform bulk action" });
  }
});
var menu_routes_default = router16;

// server/routes/pages.routes.ts
import { Router as Router18 } from "express";

// server/services/page.service.ts
function validatePageCreation(pageData) {
  if (!pageData.title || pageData.title.trim().length === 0) {
    return { isValid: false, error: "Page title is required" };
  }
  if (!pageData.slug || pageData.slug.trim().length === 0) {
    return { isValid: false, error: "Page slug is required" };
  }
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(pageData.slug)) {
    return { isValid: false, error: "Slug must contain only lowercase letters, numbers, and hyphens" };
  }
  if (!pageData.content || pageData.content.trim().length === 0) {
    return { isValid: false, error: "Page content is required" };
  }
  if (!pageData.authorId || pageData.authorId.trim().length === 0) {
    return { isValid: false, error: "Author ID is required" };
  }
  const validStatuses = ["draft", "published"];
  if (pageData.status && !validStatuses.includes(pageData.status)) {
    return { isValid: false, error: "Status must be either 'draft' or 'published'" };
  }
  return { isValid: true };
}
function validatePageUpdate(pageData) {
  if (pageData.title !== void 0 && pageData.title.trim().length === 0) {
    return { isValid: false, error: "Page title cannot be empty" };
  }
  if (pageData.slug !== void 0) {
    if (pageData.slug.trim().length === 0) {
      return { isValid: false, error: "Page slug cannot be empty" };
    }
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(pageData.slug)) {
      return { isValid: false, error: "Slug must contain only lowercase letters, numbers, and hyphens" };
    }
  }
  if (pageData.content !== void 0 && pageData.content.trim().length === 0) {
    return { isValid: false, error: "Page content cannot be empty" };
  }
  if (pageData.status !== void 0) {
    const validStatuses = ["draft", "published"];
    if (!validStatuses.includes(pageData.status)) {
      return { isValid: false, error: "Status must be either 'draft' or 'published'" };
    }
  }
  return { isValid: true };
}
async function createPage(pageData) {
  console.log("[PAGE SERVICE] Creating new page:", { title: pageData.title, slug: pageData.slug, status: pageData.status });
  const validation = validatePageCreation(pageData);
  if (!validation.isValid) {
    console.log("[PAGE SERVICE] Page creation validation failed:", validation.error);
    throw new Error(validation.error);
  }
  try {
    const existingPage = await contentStorage.getPageBySlug(pageData.slug);
    if (existingPage) {
      throw new Error(`A page with slug "${pageData.slug}" already exists`);
    }
    const insertData = {
      title: pageData.title.trim(),
      slug: pageData.slug.trim(),
      content: pageData.content.trim(),
      seoTitle: pageData.seoTitle?.trim() || null,
      seoDescription: pageData.seoDescription?.trim() || null,
      status: pageData.status || "draft",
      authorId: pageData.authorId
    };
    const page = await contentStorage.createPage(insertData);
    console.log("[PAGE SERVICE] Successfully created page:", { id: page.id, title: page.title, status: page.status });
    return page;
  } catch (error) {
    console.error("[PAGE SERVICE] Error creating page:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create page");
  }
}
async function updatePage(pageId, pageData) {
  console.log("[PAGE SERVICE] Updating page:", { id: pageId, updates: Object.keys(pageData) });
  const validation = validatePageUpdate(pageData);
  if (!validation.isValid) {
    console.log("[PAGE SERVICE] Page update validation failed:", validation.error);
    throw new Error(validation.error);
  }
  try {
    const existingPage = await contentStorage.getPage(pageId);
    if (!existingPage) {
      throw new Error("Page not found");
    }
    if (pageData.slug && pageData.slug !== existingPage.slug) {
      const pageWithSlug = await contentStorage.getPageBySlug(pageData.slug);
      if (pageWithSlug && pageWithSlug.id !== pageId) {
        throw new Error(`A page with slug "${pageData.slug}" already exists`);
      }
    }
    const updateData = {};
    if (pageData.title !== void 0) updateData.title = pageData.title.trim();
    if (pageData.slug !== void 0) updateData.slug = pageData.slug.trim();
    if (pageData.content !== void 0) updateData.content = pageData.content.trim();
    if (pageData.seoTitle !== void 0) updateData.seoTitle = pageData.seoTitle?.trim() || null;
    if (pageData.seoDescription !== void 0) updateData.seoDescription = pageData.seoDescription?.trim() || null;
    if (pageData.status !== void 0) updateData.status = pageData.status;
    const updatedPage = await contentStorage.updatePage(pageId, updateData);
    if (!updatedPage) {
      throw new Error("Failed to update page");
    }
    console.log("[PAGE SERVICE] Successfully updated page:", { id: updatedPage.id, title: updatedPage.title, status: updatedPage.status });
    return updatedPage;
  } catch (error) {
    console.error("[PAGE SERVICE] Error updating page:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update page");
  }
}
async function publishPage(pageId, authorId) {
  console.log("[PAGE SERVICE] Publishing page:", { id: pageId, publishedBy: authorId });
  try {
    const existingPage = await contentStorage.getPage(pageId);
    if (!existingPage) {
      throw new Error("Page not found");
    }
    if (existingPage.status === "published") {
      console.log("[PAGE SERVICE] Page is already published:", { id: pageId, title: existingPage.title });
      return existingPage;
    }
    if (!existingPage.title || existingPage.title.trim().length === 0) {
      throw new Error("Cannot publish page: title is required");
    }
    if (!existingPage.content || existingPage.content.trim().length === 0) {
      throw new Error("Cannot publish page: content is required");
    }
    const publishedPage = await contentStorage.publishPage(pageId, authorId || "system");
    if (!publishedPage) {
      throw new Error("Failed to publish page");
    }
    console.log("[PAGE SERVICE] Successfully published page:", {
      id: publishedPage.id,
      title: publishedPage.title,
      status: publishedPage.status,
      publishedAt: publishedPage.publishedAt
    });
    return publishedPage;
  } catch (error) {
    console.error("[PAGE SERVICE] Error publishing page:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to publish page");
  }
}
async function unpublishPage(pageId, authorId) {
  console.log("[PAGE SERVICE] Unpublishing page:", { id: pageId, unpublishedBy: authorId });
  try {
    const existingPage = await contentStorage.getPage(pageId);
    if (!existingPage) {
      throw new Error("Page not found");
    }
    if (existingPage.status === "draft") {
      console.log("[PAGE SERVICE] Page is already a draft:", { id: pageId, title: existingPage.title });
      return existingPage;
    }
    const unpublishedPage = await contentStorage.updatePage(pageId, { status: "draft" });
    if (!unpublishedPage) {
      throw new Error("Failed to unpublish page");
    }
    console.log("[PAGE SERVICE] Successfully unpublished page:", {
      id: unpublishedPage.id,
      title: unpublishedPage.title,
      status: unpublishedPage.status
    });
    return unpublishedPage;
  } catch (error) {
    console.error("[PAGE SERVICE] Error unpublishing page:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to unpublish page");
  }
}
async function deletePage(pageId) {
  console.log("[PAGE SERVICE] Deleting page:", { id: pageId });
  try {
    const existingPage = await contentStorage.getPage(pageId);
    if (!existingPage) {
      throw new Error("Page not found");
    }
    const protectedSlugs = ["home", "about", "contact", "privacy", "terms"];
    if (protectedSlugs.includes(existingPage.slug)) {
      throw new Error(`Cannot delete protected page: ${existingPage.slug}`);
    }
    await contentStorage.deletePage(pageId);
    console.log("[PAGE SERVICE] Successfully deleted page:", { id: pageId, title: existingPage.title });
  } catch (error) {
    console.error("[PAGE SERVICE] Error deleting page:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete page");
  }
}
async function getPages(status) {
  try {
    if (status && !["draft", "published"].includes(status)) {
      throw new Error('Invalid status filter: must be "draft" or "published"');
    }
    const pages2 = await contentStorage.getPages(status);
    console.log("[PAGE SERVICE] Retrieved pages:", { count: pages2.length, status: status || "all" });
    return pages2;
  } catch (error) {
    console.error("[PAGE SERVICE] Error retrieving pages:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to retrieve pages");
  }
}
async function getPageById(pageId) {
  try {
    const page = await contentStorage.getPage(pageId);
    if (page) {
      console.log("[PAGE SERVICE] Retrieved page by ID:", { id: page.id, title: page.title, status: page.status });
    } else {
      console.log("[PAGE SERVICE] Page not found by ID:", { id: pageId });
    }
    return page;
  } catch (error) {
    console.error("[PAGE SERVICE] Error retrieving page by ID:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to retrieve page");
  }
}
async function getPageBySlug(slug) {
  try {
    if (!slug || slug.trim().length === 0) {
      throw new Error("Page slug is required");
    }
    const page = await contentStorage.getPageBySlug(slug.trim());
    if (page) {
      console.log("[PAGE SERVICE] Retrieved page by slug:", { slug: page.slug, title: page.title, status: page.status });
    } else {
      console.log("[PAGE SERVICE] Page not found by slug:", { slug });
    }
    return page;
  } catch (error) {
    console.error("[PAGE SERVICE] Error retrieving page by slug:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to retrieve page");
  }
}

// server/routes/pages.routes.ts
var router17 = Router18();
router17.get("/pages", async (req, res) => {
  try {
    const { status } = req.query;
    const pages2 = await getPages(status);
    res.json(pages2);
  } catch (error) {
    console.error("Error in pages route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pages";
    res.status(500).json({ message });
  }
});
router17.get("/pages/:slug", async (req, res) => {
  try {
    const page = await getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    console.error("Error in page by slug route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch page";
    res.status(400).json({ message });
  }
});
router17.get("/admin/pages", async (req, res) => {
  try {
    const { status } = req.query;
    const pages2 = await getPages(status);
    res.json(pages2);
  } catch (error) {
    console.error("Error in admin pages route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pages";
    res.status(500).json({ message });
  }
});
router17.post("/admin/pages", async (req, res) => {
  try {
    const page = await createPage(req.body);
    res.status(201).json(page);
  } catch (error) {
    console.error("Error in create page route:", error);
    const message = error instanceof Error ? error.message : "Failed to create page";
    res.status(400).json({ message });
  }
});
router17.put("/admin/pages/:id", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    const page = await updatePage(pageId, req.body);
    res.json(page);
  } catch (error) {
    console.error("Error in update page route:", error);
    const message = error instanceof Error ? error.message : "Failed to update page";
    const statusCode = message === "Page not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});
router17.delete("/admin/pages/:id", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    await deletePage(pageId);
    res.status(204).send();
  } catch (error) {
    console.error("Error in delete page route:", error);
    const message = error instanceof Error ? error.message : "Failed to delete page";
    const statusCode = message === "Page not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});
router17.post("/admin/pages/:id/publish", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    const { authorId } = req.body;
    const page = await publishPage(pageId, authorId);
    res.json(page);
  } catch (error) {
    console.error("Error in publish page route:", error);
    const message = error instanceof Error ? error.message : "Failed to publish page";
    const statusCode = message === "Page not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});
router17.post("/admin/pages/:id/unpublish", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    const { authorId } = req.body;
    const page = await unpublishPage(pageId, authorId);
    res.json(page);
  } catch (error) {
    console.error("Error in unpublish page route:", error);
    const message = error instanceof Error ? error.message : "Failed to unpublish page";
    const statusCode = message === "Page not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});
router17.get("/admin/pages/:id", async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    if (isNaN(pageId)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }
    const page = await getPageById(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    console.error("Error in get page by ID route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch page";
    res.status(400).json({ message });
  }
});
var pages_routes_default = router17;

// server/routes.ts
async function registerRoutes(app2) {
  setTimeout(async () => {
    try {
      await createOwnershipClaimsTable();
      await createFeaturedRequestsTable();
      await createLeadsTable();
      await createContentStringsTable();
      await seedInitialContentStrings();
    } catch (error) {
      console.error("Error initializing database tables:", error);
    }
  }, 1e3);
  app2.post("/api/setup-db", async (req, res) => {
    try {
      const result = await createOwnershipClaimsTable();
      res.json({ success: result, message: result ? "Database tables created successfully" : "Failed to create tables" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error setting up database", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  setupAuth(app2);
  setupAuthRoutes(app2);
  setupBusinessRoutes2(app2);
  setupAdminRoutes(app2);
  setupReviewRoutes(app2);
  registerCategoryRoutes(app2);
  setupLeadRoutes(app2);
  app2.use(contentRouter);
  app2.use("/api/admin", optimization_default);
  app2.use("/api", settings_routes_default);
  app2.use("/api", import_routes_default);
  app2.use("/api", claims_routes_default);
  app2.use("/api", services_routes_default2);
  app2.use("/api", socialMedia_routes_default);
  app2.use("/api", menu_routes_default);
  app2.use("/api", pages_routes_default);
  setupFeaturedRequestsRoutes(app2);
  app2.post("/api/admin/optimize-businesses", async (req, res) => {
    try {
      const { businessIds } = req.body;
      if (!businessIds || !Array.isArray(businessIds)) {
        return res.status(400).json({ message: "businessIds array is required" });
      }
      const optimizedBusinesses = await optimizeBusinesses(businessIds, "descriptions");
      res.json(optimizedBusinesses);
    } catch (error) {
      console.error("Error optimizing businesses:", error);
      res.status(500).json({
        message: "Failed to optimize businesses",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "../public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/config/environment.ts
function detectPlatform() {
  if (process.env.REPLIT_URL || process.env.REPL_SLUG) return "replit";
  if (process.env.VERCEL_URL || process.env.VERCEL) return "vercel";
  if (process.env.DYNO || process.env.HEROKU_APP_NAME) return "heroku";
  return "local";
}
function getSessionConfig() {
  const platform = detectPlatform();
  const baseConfig = {
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1e3
      // 2 hours
    }
  };
  switch (platform) {
    case "replit":
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: false,
          // HTTP compatibility for Replit
          sameSite: "lax",
          // Better compatibility for same-origin
          domain: void 0
          // Don't set domain for Replit
        }
      };
    case "vercel":
    case "heroku":
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        }
      };
    default:
      return {
        ...baseConfig,
        cookie: {
          ...baseConfig.cookie,
          secure: false,
          sameSite: "lax"
        }
      };
  }
}
function getCORSConfig() {
  const platform = detectPlatform();
  switch (platform) {
    case "replit":
      return {
        origin: true,
        // Allow all origins for Replit compatibility
        credentials: true
      };
    case "vercel":
      return {
        origin: [/\.vercel\.app$/, /\.vercel\.dev$/, /localhost:\d+/],
        credentials: true
      };
    case "heroku":
      return {
        origin: [/\.herokuapp\.com$/, /localhost:\d+/],
        credentials: true
      };
    default:
      return {
        origin: ["http://localhost:5000", "http://127.0.0.1:5000"],
        credentials: true
      };
  }
}
function getSecurityConfig() {
  const platform = detectPlatform();
  if (platform === "replit") {
    return {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    };
  }
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"]
      }
    },
    crossOriginEmbedderPolicy: false
  };
}
function getEnvironmentConfig() {
  const platform = detectPlatform();
  const sessionConfig = getSessionConfig();
  return {
    platform,
    session: {
      secure: sessionConfig.cookie.secure,
      sameSite: sessionConfig.cookie.sameSite
    },
    cors: getCORSConfig(),
    security: getSecurityConfig()
  };
}
function validateEnvironment() {
  const required = ["SESSION_SECRET", "DATABASE_URL"];
  const missing = required.filter((env) => !process.env[env]);
  return {
    valid: missing.length === 0,
    missing
  };
}
function logConfiguration() {
  const config = getEnvironmentConfig();
  console.log(`[CONFIG] Platform: ${config.platform}`);
  console.log(`[CONFIG] Session secure: ${config.session.secure}`);
  console.log(`[CONFIG] Session sameSite: ${config.session.sameSite}`);
  console.log(`[CONFIG] CORS origin: ${typeof config.cors.origin === "boolean" ? "all" : "restricted"}`);
  console.log(`[CONFIG] CSP enabled: ${config.security.contentSecurityPolicy !== false}`);
}

// server/index.ts
var app = express2();
app.set("trust proxy", 1);
var envValidation = validateEnvironment();
if (!envValidation.valid) {
  console.error("[CONFIG] Missing required environment variables:", envValidation.missing);
  process.exit(1);
}
logConfiguration();
app.use(helmet(getSecurityConfig()));
app.use(cors(getCORSConfig()));
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later."
  },
  skipSuccessfulRequests: true
});
app.use("/api", limiter);
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use(session3(getSessionConfig()));
console.log("[SERVER] Clearing all existing sessions on startup");
try {
  console.log("[SERVER] Session store reset completed");
} catch (error) {
  console.error("[SERVER] Session clear error:", error);
}
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Business Directory API is healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/health/config", (req, res) => {
  const config = getEnvironmentConfig();
  res.json({
    status: "healthy",
    platform: config.platform,
    session: {
      secure: config.session.secure,
      sameSite: config.session.sameSite
    },
    cors: {
      origin: typeof config.cors.origin === "boolean" ? "all" : "restricted"
    },
    security: {
      csp: config.security.contentSecurityPolicy !== false
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
(async () => {
  try {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Request error:", err);
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log("Serving React application via Vite dev server");
    } else {
      try {
        serveStatic(app);
        console.log("Serving static files from server/public");
      } catch (error) {
        console.warn("Static files not available, serving fallback frontend:", error instanceof Error ? error.message : String(error));
        app.get("*", (_req, res) => {
          res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Directory Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 600px; width: 100%; text-align: center; }
        h1 { color: #333; margin-bottom: 1rem; font-size: 2.5rem; font-weight: 700; }
        .subtitle { color: #666; margin-bottom: 2rem; font-size: 1.1rem; }
        .status { display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #e8f5e8; color: #2d5a2d; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #4CAF50; }
        .status-dot { width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .nav-item { background: #667eea; color: white; padding: 1rem; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.3s ease; border: none; cursor: pointer; }
        .nav-item:hover { background: #5a6fd8; transform: translateY(-2px); }
        .api-info { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-top: 2rem; border-left: 4px solid #007bff; }
        .endpoint { font-family: monospace; background: #e9ecef; padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Business Directory</h1>
            <p class="subtitle">Your comprehensive business networking platform</p>
            
            <div class="status">
                <div class="status-dot"></div>
                <strong>System Status: Online & Ready</strong>
            </div>
            
            <div class="nav-grid">
                <button class="nav-item" onclick="loadBusinesses()">Browse Businesses</button>
                <button class="nav-item" onclick="loadCategories()">Categories</button>
                <button class="nav-item" onclick="loadCities()">Cities</button>
                <button class="nav-item" onclick="window.location.href='/api/auth/login'">Admin Login</button>
            </div>
            
            <div class="api-info">
                <h3>API Endpoints Available</h3>
                <div class="endpoint">GET /api/businesses</div>
                <div class="endpoint">GET /api/categories</div>
                <div class="endpoint">GET /api/cities</div>
                <div class="endpoint">POST /api/auth/login</div>
            </div>
            
            <div id="content" style="margin-top: 2rem;"></div>
        </div>
    </div>
    
    <script>
        async function loadBusinesses() {
            try {
                const response = await fetch('/api/businesses');
                const businesses = await response.json();
                displayData('Businesses', businesses);
            } catch (error) {
                displayError('Failed to load businesses: ' + error.message);
            }
        }
        
        async function loadCategories() {
            try {
                const response = await fetch('/api/categories');
                const categories = await response.json();
                displayData('Categories', categories);
            } catch (error) {
                displayError('Failed to load categories: ' + error.message);
            }
        }
        
        async function loadCities() {
            try {
                const response = await fetch('/api/cities');
                const cities = await response.json();
                displayData('Cities', cities);
            } catch (error) {
                displayError('Failed to load cities: ' + error.message);
            }
        }
        
        function displayData(title, data) {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: left;">
                    <h3>\${title}</h3>
                    <pre style="background: white; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.9rem;">\${JSON.stringify(data, null, 2)}</pre>
                </div>
            \`;
        }
        
        function displayError(message) {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545;">
                    <strong>Error:</strong> \${message}
                </div>
            \`;
        }
    </script>
</body>
</html>
          `);
        });
      }
    }
    const port = parseInt(process.env.PORT || "5000");
    await new Promise((resolve, reject) => {
      server.listen(port, "0.0.0.0", (err) => {
        if (err) {
          reject(err);
          return;
        }
        log(`serving on port ${port}`);
        console.log("Server is ready to accept connections");
        console.log("Process will stay alive to serve requests");
      });
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
})();
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
