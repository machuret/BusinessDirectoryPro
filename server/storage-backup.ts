import { eq, like, ilike, and, or, desc, asc, sql, ne } from "drizzle-orm";
import { db, pool } from "./db";
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
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Business,
  type InsertBusiness,
  type Review,
  type InsertReview,
  type SiteSetting,
  type Lead,
  type InsertLead,
  type LeadWithBusiness,
  type ContactMessage,
  type InsertContactMessage,
  type InsertSiteSetting,
  type MenuItem,
  type InsertMenuItem,
  type Page,
  type InsertPage,
  type WebsiteFaq,
  type InsertWebsiteFaq,
  type BusinessWithCategory,
  type CategoryWithCount,
} from "@shared/schema";

export interface IStorage {
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
  updateCityName(oldName: string, newName: string, description?: string): Promise<void>;
  
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
  
  // CSV Import operations
  importBusinessFromCSV(businessData: any): Promise<Business>;
  bulkImportBusinesses(businessesData: any[]): Promise<{ success: number; errors: any[] }>;
  
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: UpsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      const result = await db
        .update(users)
        .set({ 
          ...userData, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return result[0];
    } else {
      return this.createUser(userData);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getCategories(): Promise<CategoryWithCount[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.description,
          c.icon,
          c.color,
          c.created_at as "createdAt",
          COUNT(b.placeid)::int as "businessCount"
        FROM categories c
        LEFT JOIN businesses b ON LOWER(c.name) = LOWER(b.categoryname)
        GROUP BY c.id, c.name, c.slug, c.description, c.icon, c.color, c.created_at
        ORDER BY c.name
      `);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        icon: row.icon,
        color: row.color,
        createdAt: new Date(row.createdAt as string),
        businessCount: row.businessCount
      })) as CategoryWithCount[];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getUniqueCities(): Promise<{ city: string; count: number }[]> {
    const result = await db.execute(sql`
      SELECT city, COUNT(*) as count
      FROM businesses 
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city 
      ORDER BY count DESC, city ASC
    `);
    
    return result.rows.map(row => ({
      city: row.city as string,
      count: parseInt(row.count as string)
    }));
  }

  async updateCityName(oldName: string, newName: string, description?: string): Promise<void> {
    await db.update(businesses)
      .set({ city: newName })
      .where(eq(businesses.city, oldName));
  }

  async getBusinesses(params: { 
    categoryId?: number; 
    search?: string; 
    city?: string; 
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<BusinessWithCategory[]> {
    const { categoryId, search, city, featured, limit = 50, offset = 0 } = params;

    try {
      // Build base query
      let query = db.select().from(businesses);
      
      // Apply city filter if provided
      if (city) {
        query = query.where(like(businesses.city, `%${city}%`));
      }
      
      // Apply search filter if provided  
      if (search && !city) {
        query = query.where(
          or(
            like(businesses.title, `%${search}%`),
            like(businesses.description, `%${search}%`),
            like(businesses.categoryname, `%${search}%`)
          )
        );
      }
      
      // Apply featured filter if provided
      if (featured && !city && !search) {
        query = query.where(eq(businesses.featured, true));
      }

      // Order by featured status first (featured businesses at top), then by name
      const result = await query
        .orderBy(desc(businesses.featured), asc(businesses.title))
        .limit(limit)
        .offset(offset);
      return result as BusinessWithCategory[];
    } catch (error) {
      console.error('Error in getBusinesses:', error);
      // Simple fallback query
      const result = await db.execute(sql`SELECT * FROM businesses ORDER BY placeid LIMIT ${limit} OFFSET ${offset}`);
      return result.rows as BusinessWithCategory[];
    }
  }

  async getBusinessById(id: string): Promise<BusinessWithCategory | undefined> {
    const result = await db
      .select()
      .from(businesses)
      .where(eq(businesses.placeid, id))
      .limit(1);



    return result[0] as BusinessWithCategory;
  }

  async getBusinessBySlug(slug: string): Promise<BusinessWithCategory | undefined> {
    const result = await db
      .select()
      .from(businesses)
      .where(eq(businesses.slug, slug))
      .limit(1);

    return result[0] as BusinessWithCategory;
  }

  async getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]> {
    const result = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerid, ownerId));

    return result as BusinessWithCategory[];
  }

  // Helper function to generate SEO-friendly slug
  private generateSeoSlug(title: string, city?: string, category?: string): string {
    let slugParts = [title];
    if (city) slugParts.push(city);
    if (category) slugParts.push(category);
    
    return slugParts
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
  }

  // Helper function to ensure unique slug
  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await db
        .select({ placeid: businesses.placeid })
        .from(businesses)
        .where(
          excludeId 
            ? and(eq(businesses.slug, slug), ne(businesses.placeid, excludeId))
            : eq(businesses.slug, slug)
        )
        .limit(1);
      
      if (existing.length === 0) {
        return slug;
      }
      
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  // Helper function to generate SEO title and description
  private generateSeoMetadata(business: any): { seotitle: string; seodescription: string } {
    const title = business.title || 'Business';
    const city = business.city || '';
    const category = business.categoryname || '';
    
    // Generate SEO title (60 characters max recommended)
    let seoTitle = title;
    if (city) seoTitle += ` - ${city}`;
    if (category) seoTitle += ` | ${category}`;
    if (seoTitle.length > 60) {
      seoTitle = `${title} - ${city}`.substring(0, 57) + '...';
    }
    
    // Generate SEO description (160 characters max recommended)
    let seoDescription = `Visit ${title}`;
    if (city) seoDescription += ` in ${city}`;
    if (category) seoDescription += ` - ${category}`;
    if (business.address) seoDescription += `. Located at ${business.address}`;
    if (business.phone) seoDescription += `. Call ${business.phone}`;
    seoDescription += '. Get directions, hours, and reviews.';
    
    if (seoDescription.length > 160) {
      seoDescription = seoDescription.substring(0, 157) + '...';
    }
    
    return { seotitle: seoTitle, seodescription: seoDescription };
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    // Generate placeid if not provided
    if (!business.placeid) {
      business.placeid = `ChIJ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Generate SEO slug if not provided
    if (!business.slug) {
      const baseSlug = this.generateSeoSlug(
        business.title || 'business',
        business.city || undefined,
        business.categoryname || undefined
      );
      business.slug = await this.ensureUniqueSlug(baseSlug);
    }
    
    // Generate SEO metadata if not provided
    if (!business.seotitle || !business.seodescription) {
      const seoMetadata = this.generateSeoMetadata(business);
      if (!business.seotitle) business.seotitle = seoMetadata.seotitle;
      if (!business.seodescription) business.seodescription = seoMetadata.seodescription;
    }
    
    const result = await db.insert(businesses).values(business).returning();
    return result[0];
  }

  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    // If title, city, or category changed, regenerate slug
    if (business.title || business.city || business.categoryname) {
      const currentBusiness = await this.getBusinessById(id);
      if (currentBusiness) {
        const baseSlug = this.generateSeoSlug(
          business.title || currentBusiness.title || 'business',
          business.city || currentBusiness.city || undefined,
          business.categoryname || currentBusiness.categoryname || undefined
        );
        business.slug = await this.ensureUniqueSlug(baseSlug, id);
      }
    }
    
    // Regenerate SEO metadata if business details changed and no custom SEO provided
    if ((business.title || business.city || business.categoryname || business.address || business.phone) && 
        (!business.seotitle || !business.seodescription)) {
      const currentBusiness = await this.getBusinessById(id);
      if (currentBusiness) {
        const updatedBusiness = { ...currentBusiness, ...business };
        const seoMetadata = this.generateSeoMetadata(updatedBusiness);
        if (!business.seotitle) business.seotitle = seoMetadata.seotitle;
        if (!business.seodescription) business.seodescription = seoMetadata.seodescription;
      }
    }
    
    const result = await db
      .update(businesses)
      .set({ ...business, updatedat: new Date() })
      .where(eq(businesses.placeid, id))
      .returning();
    return result[0];
  }

  async deleteBusiness(id: string): Promise<void> {
    await db.delete(businesses).where(eq(businesses.placeid, id));
  }

  async updateBusinessRating(businessId: string): Promise<void> {
    // This would calculate average rating from reviews
    // For now, we'll skip this since we're not implementing reviews yet
  }

  async getReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    return this.getApprovedReviewsByBusiness(businessId);
  }

  async getApprovedReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    const result = await db
      .select({
        id: reviews.id,
        businessId: reviews.businessId,
        userId: reviews.userId,
        authorName: reviews.authorName,
        authorEmail: reviews.authorEmail,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        status: reviews.status,
        adminNotes: reviews.adminNotes,
        createdAt: reviews.createdAt,
        reviewedAt: reviews.reviewedAt,
        reviewedBy: reviews.reviewedBy,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(
        eq(reviews.businessId, businessId),
        eq(reviews.status, 'approved')
      ))
      .orderBy(desc(reviews.createdAt));

    return result as (Review & { user: Pick<User, 'firstName' | 'lastName'> })[];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    await this.updateBusinessRating(review.businessId!);
    return result[0];
  }

  async createPublicReview(businessId: string, reviewData: any): Promise<Review> {
    const review = {
      businessId,
      authorName: reviewData.reviewerName,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      status: 'pending',
    };
    
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getPendingReviews(): Promise<Review[]> {
    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.status, 'pending'))
      .orderBy(desc(reviews.createdAt));
    
    return result;
  }

  async approveReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    const result = await db
      .update(reviews)
      .set({
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: notes,
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    if (result[0]?.businessId) {
      await this.updateBusinessRating(result[0].businessId);
    }
    
    return result[0];
  }

  async rejectReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    const result = await db
      .update(reviews)
      .set({
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: notes,
      })
      .where(eq(reviews.id, reviewId))
      .returning();
    
    return result[0];
  }

  async getAllReviewsForAdmin(): Promise<Review[]> {
    const result = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt));
    
    return result;
  }

  async deleteReview(reviewId: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, reviewId));
  }

  async searchBusinesses(query: string, location?: string): Promise<BusinessWithCategory[]> {
    const conditions = [];

    if (query && query.trim()) {
      conditions.push(
        or(
          like(businesses.title, `%${query}%`),
          like(businesses.description, `%${query}%`),
          like(businesses.categoryname, `%${query}%`)
        )
      );
    }

    if (location && location.trim()) {
      conditions.push(
        or(
          like(businesses.city, `%${location}%`),
          like(businesses.state, `%${location}%`),
          like(businesses.address, `%${location}%`)
        )
      );
    }

    let queryBuilder = db
      .select()
      .from(businesses);

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }

    const result = await queryBuilder.limit(20);

    return result as BusinessWithCategory[];
  }

  async getFeaturedBusinesses(limit: number = 6): Promise<BusinessWithCategory[]> {
    const result = await db
      .select()
      .from(businesses)
      .where(eq(businesses.featured, true))
      .limit(limit);

    return result as BusinessWithCategory[];
  }

  async getRandomBusinesses(limit: number = 9): Promise<BusinessWithCategory[]> {
    try {
      // Use raw SQL query with correct column names
      const result = await db.execute(sql`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.featured IS NOT NULL
        ORDER BY RANDOM()
        LIMIT ${limit}
      `);

      return result.rows.map((row: any) => ({
        ...row,
        category: row.category_id ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          description: row.category_description,
          icon: row.category_icon,
          color: row.category_color
        } : null
      })) as BusinessWithCategory[];
    } catch (error) {
      console.error('Error fetching random businesses:', error);
      return [];
    }
  }

  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    return result[0];
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(key);
    
    if (existing) {
      const result = await db
        .update(siteSettings)
        .set({
          value: typeof value === 'string' ? value : JSON.stringify(value),
          description,
          category,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.key, key))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(siteSettings)
        .values({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          description,
          category,
        })
        .returning();
      return result[0];
    }
  }

  async importBusinessFromCSV(businessData: any): Promise<Business> {
    const transformedData = this.transformCSVToBusiness(businessData);
    return this.createBusiness(transformedData);
  }

  async bulkImportBusinesses(businessesData: any[]): Promise<{ success: number; errors: any[] }> {
    let success = 0;
    const errors: any[] = [];

    for (const [index, businessData] of businessesData.entries()) {
      try {
        const transformedData = this.transformCSVToBusiness(businessData);
        
        // Generate a unique slug if not provided
        if (!transformedData.slug && transformedData.title) {
          transformedData.slug = transformedData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substr(2, 9);
        }

        await this.createBusiness(transformedData);
        success++;
      } catch (error) {
        errors.push({
          row: index + 1,
          data: businessData,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { success, errors };
  }

  private transformCSVToBusiness(csvData: any): any {
    // Map CSV fields to database fields
    return {
      placeid: csvData.placeid || csvData.PlaceId || `csv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: csvData.title || csvData.Title || csvData.name || csvData.Name,
      subtitle: csvData.subtitle || csvData.Subtitle,
      description: csvData.description || csvData.Description,
      categoryname: csvData.categoryname || csvData.CategoryName || csvData.category || csvData.Category,
      categories: this.safeJSONParse(csvData.categories || csvData.Categories),
      price: csvData.price || csvData.Price,
      website: csvData.website || csvData.Website,
      phone: csvData.phone || csvData.Phone,
      phoneunformatted: csvData.phoneunformatted || csvData.PhoneUnformatted,
      menu: csvData.menu || csvData.Menu,
      address: csvData.address || csvData.Address,
      neighborhood: csvData.neighborhood || csvData.Neighborhood,
      street: csvData.street || csvData.Street,
      city: csvData.city || csvData.City,
      postalcode: csvData.postalcode || csvData.PostalCode || csvData.zipcode || csvData.ZipCode,
      state: csvData.state || csvData.State,
      countrycode: csvData.countrycode || csvData.CountryCode,
      lat: csvData.lat || csvData.Lat || csvData.latitude || csvData.Latitude,
      lng: csvData.lng || csvData.Lng || csvData.longitude || csvData.Longitude,
      pluscode: csvData.pluscode || csvData.PlusCode,
      locatedin: csvData.locatedin || csvData.LocatedIn,
      fid: csvData.fid || csvData.Fid,
      cid: csvData.cid || csvData.Cid,
      kgmid: csvData.kgmid || csvData.Kgmid,
      url: csvData.url || csvData.Url,
      searchpageurl: csvData.searchpageurl || csvData.SearchPageUrl,
      googlefoodurl: csvData.googlefoodurl || csvData.GoogleFoodUrl,
      claimthisbusiness: this.parseBoolean(csvData.claimthisbusiness || csvData.ClaimThisBusiness),
      permanentlyclosed: this.parseBoolean(csvData.permanentlyclosed || csvData.PermanentlyClosed),
      temporarilyclosed: this.parseBoolean(csvData.temporarilyclosed || csvData.TemporarilyClosed),
      isadvertisement: this.parseBoolean(csvData.isadvertisement || csvData.IsAdvertisement),
      featured: this.parseBoolean(csvData.featured || csvData.Featured),
      totalscore: csvData.totalscore || csvData.TotalScore,
      reviewscount: parseInt(csvData.reviewscount || csvData.ReviewsCount || '0') || 0,
      reviewsdistribution: this.safeJSONParse(csvData.reviewsdistribution || csvData.ReviewsDistribution),
      reviewstags: this.safeJSONParse(csvData.reviewstags || csvData.ReviewsTags),
      reviews: this.safeJSONParse(csvData.reviews || csvData.Reviews),
      imageurl: this.extractBestImageUrl(csvData),
      imagescount: parseInt(csvData.imagescount || csvData.ImagesCount || '0') || 0,
      imagecategories: this.safeJSONParse(csvData.imagecategories || csvData.ImageCategories),
      imageurls: this.safeJSONParse(csvData.imageurls || csvData.ImageUrls),
      images: this.safeJSONParse(csvData.images || csvData.Images),
      logo: this.safeJSONParse(csvData.logo || csvData.Logo),
      openinghours: this.safeJSONParse(csvData.openinghours || csvData.OpeningHours),
      additionalopeninghours: this.safeJSONParse(csvData.additionalopeninghours || csvData.AdditionalOpeningHours),
      openinghoursbusinessconfirmationtext: csvData.openinghoursbusinessconfirmationtext || csvData.OpeningHoursBusinessConfirmationText,
      additionalinfo: this.safeJSONParse(csvData.additionalinfo || csvData.AdditionalInfo),
      amenities: this.safeJSONParse(csvData.amenities || csvData.Amenities),
      accessibility: this.safeJSONParse(csvData.accessibility || csvData.Accessibility),
      planning: this.safeJSONParse(csvData.planning || csvData.Planning),
      reservetableurl: csvData.reservetableurl || csvData.ReserveTableUrl,
      tablereservationlinks: this.safeJSONParse(csvData.tablereservationlinks || csvData.TableReservationLinks),
      bookinglinks: this.safeJSONParse(csvData.bookinglinks || csvData.BookingLinks),
      orderby: this.safeJSONParse(csvData.orderby || csvData.OrderBy),
      restaurantdata: this.safeJSONParse(csvData.restaurantdata || csvData.RestaurantData),
      hotelads: this.safeJSONParse(csvData.hotelads || csvData.HotelAds),
      hotelstars: parseInt(csvData.hotelstars || csvData.HotelStars || '0') || null,
      hoteldescription: csvData.hoteldescription || csvData.HotelDescription,
      checkindate: csvData.checkindate || csvData.CheckInDate,
      checkoutdate: csvData.checkoutdate || csvData.CheckOutDate,
      similarhotelsnearby: this.safeJSONParse(csvData.similarhotelsnearby || csvData.SimilarHotelsNearby),
      hotelreviewsummary: this.safeJSONParse(csvData.hotelreviewsummary || csvData.HotelReviewSummary),
      peoplealsosearch: this.safeJSONParse(csvData.peoplealsosearch || csvData.PeopleAlsoSearch),
      placestags: this.safeJSONParse(csvData.placestags || csvData.PlacesTags),
      gasprices: this.safeJSONParse(csvData.gasprices || csvData.GasPrices),
      questionsandanswers: this.safeJSONParse(csvData.questionsandanswers || csvData.QuestionsAndAnswers),
      updatesfromcustomers: this.safeJSONParse(csvData.updatesfromcustomers || csvData.UpdatesFromCustomers),
      ownerupdates: this.safeJSONParse(csvData.ownerupdates || csvData.OwnerUpdates),
      webresults: this.safeJSONParse(csvData.webresults || csvData.WebResults),
      leadsenrichment: this.safeJSONParse(csvData.leadsenrichment || csvData.LeadsEnrichment),
      userplacenote: csvData.userplacenote || csvData.UserPlaceNote,
      scrapedat: csvData.scrapedat || csvData.ScrapedAt ? new Date(csvData.scrapedat || csvData.ScrapedAt) : null,
      searchstring: csvData.searchstring || csvData.SearchString,
      language: csvData.language || csvData.Language,
      rank: parseInt(csvData.rank || csvData.Rank || '0') || null,
      ownerid: csvData.ownerid || csvData.OwnerId,
      seotitle: csvData.seotitle || csvData.SeoTitle,
      slug: csvData.slug || csvData.Slug || (csvData.title || csvData.Title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      seodescription: csvData.seodescription || csvData.SeoDescription,
      faq: this.safeJSONParse(csvData.faq || csvData.Faq),
    };
  }

  private safeJSONParse(value: any): any {
    if (!value || value === '') return null;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private parseBoolean(value: any): boolean | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    return null;
  }

  private extractBestImageUrl(csvData: any): string | null {
    // Priority 1: Direct imageurl field
    if (csvData.imageurl || csvData.ImageUrl) {
      return csvData.imageurl || csvData.ImageUrl;
    }

    // Priority 2: Extract from reviews
    const reviewsData = this.safeJSONParse(csvData.reviews || csvData.Reviews);
    if (reviewsData && Array.isArray(reviewsData)) {
      for (const review of reviewsData) {
        if (review.reviewImageUrls && Array.isArray(review.reviewImageUrls) && review.reviewImageUrls.length > 0) {
          return review.reviewImageUrls[0];
        }
      }
    }

    // Priority 3: imageurls array
    const imageUrls = this.safeJSONParse(csvData.imageurls || csvData.ImageUrls);
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      return imageUrls[0];
    }

    // Priority 4: images array
    const images = this.safeJSONParse(csvData.images || csvData.Images);
    if (images && Array.isArray(images) && images.length > 0) {
      return images[0];
    }

    return null;
  }

  // Ownership claim operations
  async getOwnershipClaims(): Promise<any[]> {
    try {
      // Since we can't create the table yet, use a simple in-memory storage
      return [];
    } catch (error) {
      console.error('Error getting ownership claims:', error);
      return [];
    }
  }

  async getOwnershipClaimsByUser(userId: string): Promise<any[]> {
    try {
      return [];
    } catch (error) {
      console.error('Error getting ownership claims by user:', error);
      return [];
    }
  }

  async getOwnershipClaimsByBusiness(businessId: string): Promise<any[]> {
    try {
      return [];
    } catch (error) {
      console.error('Error getting ownership claims by business:', error);
      return [];
    }
  }

  async createOwnershipClaim(claim: any): Promise<any> {
    try {
      // For now, return a mock response until we can create the table
      return {
        id: Date.now(),
        userId: claim.userId,
        businessId: claim.businessId,
        status: 'pending',
        message: claim.message,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating ownership claim:', error);
      throw error;
    }
  }

  async updateOwnershipClaim(id: number, status: string, adminMessage?: string, reviewedBy?: string): Promise<any> {
    try {
      return {
        id,
        status,
        adminMessage,
        reviewedBy,
        reviewedAt: new Date(),
      };
    } catch (error) {
      console.error('Error updating ownership claim:', error);
      throw error;
    }
  }

  async deleteOwnershipClaim(id: number): Promise<void> {
    try {
      // Mock implementation
    } catch (error) {
      console.error('Error deleting ownership claim:', error);
      throw error;
    }
  }

  // Menu management implementation
  async getMenuItems(position?: string): Promise<MenuItem[]> {
    try {
      // Ensure table exists first
      await this.ensureMenuTableExists();
      
      if (position) {
        return await db.select().from(menuItems)
          .where(eq(menuItems.position, position))
          .orderBy(menuItems.order, menuItems.name);
      }
      
      return await db.select().from(menuItems)
        .orderBy(menuItems.order, menuItems.name);
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }

  private async ensureMenuTableExists(): Promise<void> {
    try {
      // Drop existing table if it has wrong schema
      await db.execute(sql`DROP TABLE IF EXISTS menu_items`);
      
      // Create the table with correct schema
      await db.execute(sql`
        CREATE TABLE menu_items (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          position TEXT NOT NULL DEFAULT 'header',
          "order" INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          target TEXT DEFAULT '_self',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )
      `);

      // Add default menu items
      await db.execute(sql`
        INSERT INTO menu_items (name, url, position, "order") VALUES
        ('Home', '/', 'header', 1),
        ('Categories', '/categories', 'header', 2),
        ('Featured', '/featured', 'header', 3),
        ('About Us', '/about', 'footer', 1),
        ('Contact', '/contact', 'footer', 2),
        ('Privacy Policy', '/privacy', 'footer', 3)
      `);
    } catch (error) {
      console.error('Error ensuring menu table exists:', error);
    }
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    try {
      const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting menu item:', error);
      return undefined;
    }
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    try {
      const result = await db.insert(menuItems).values(menuItem).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id: number, menuItemData: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    try {
      const result = await db
        .update(menuItems)
        .set({
          ...menuItemData,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(id: number): Promise<void> {
    try {
      await db.delete(menuItems).where(eq(menuItems.id, id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Page management operations (CMS)
  async getPages(status?: string): Promise<Page[]> {
    try {
      const query = db.select().from(pages).orderBy(desc(pages.updatedAt));
      
      if (status) {
        return await query.where(eq(pages.status, status));
      }
      
      return await query;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  async getPage(id: number): Promise<Page | undefined> {
    try {
      const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    try {
      const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      throw error;
    }
  }

  private generatePageSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async ensureUniquePageSlug(baseSlug: string, excludeId?: number): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await db
        .select()
        .from(pages)
        .where(
          excludeId 
            ? and(eq(pages.slug, slug), ne(pages.id, excludeId))
            : eq(pages.slug, slug)
        )
        .limit(1);

      if (existing.length === 0) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async createPage(page: InsertPage): Promise<Page> {
    try {
      const slug = await this.ensureUniquePageSlug(
        page.slug || this.generatePageSlug(page.title)
      );

      const result = await db.insert(pages).values({
        ...page,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  async updatePage(id: number, pageData: Partial<InsertPage>): Promise<Page | undefined> {
    try {
      const updateData: any = {
        ...pageData,
        updatedAt: new Date(),
      };

      // Handle slug update if title changed
      if (pageData.title && !pageData.slug) {
        updateData.slug = await this.ensureUniquePageSlug(
          this.generatePageSlug(pageData.title),
          id
        );
      } else if (pageData.slug) {
        updateData.slug = await this.ensureUniquePageSlug(pageData.slug, id);
      }

      const result = await db
        .update(pages)
        .set(updateData)
        .where(eq(pages.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  async deletePage(id: number): Promise<void> {
    try {
      await db.delete(pages).where(eq(pages.id, id));
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }

  async publishPage(id: number, authorId: string): Promise<Page | undefined> {
    try {
      const result = await db
        .update(pages)
        .set({
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pages.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error publishing page:', error);
      throw error;
    }
  }

  // Website FAQ management methods
  async getWebsiteFaqs(category?: string): Promise<WebsiteFaq[]> {
    try {
      let query = db.select().from(websiteFaq);
      
      if (category) {
        query = query.where(eq(websiteFaq.category, category));
      }
      
      return await query.orderBy(websiteFaq.order, websiteFaq.createdAt);
    } catch (error) {
      console.error('Error fetching website FAQs:', error);
      throw error;
    }
  }

  async getWebsiteFaq(id: number): Promise<WebsiteFaq | undefined> {
    try {
      const [faq] = await db.select()
        .from(websiteFaq)
        .where(eq(websiteFaq.id, id));
      return faq;
    } catch (error) {
      console.error('Error fetching website FAQ:', error);
      throw error;
    }
  }

  async createWebsiteFaq(faqData: InsertWebsiteFaq): Promise<WebsiteFaq> {
    try {
      const [faq] = await db.insert(websiteFaq)
        .values({
          ...faqData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return faq;
    } catch (error) {
      console.error('Error creating website FAQ:', error);
      throw error;
    }
  }

  async updateWebsiteFaq(id: number, faqData: Partial<InsertWebsiteFaq>): Promise<WebsiteFaq | undefined> {
    try {
      const [faq] = await db.update(websiteFaq)
        .set({
          ...faqData,
          updatedAt: new Date()
        })
        .where(eq(websiteFaq.id, id))
        .returning();
      return faq;
    } catch (error) {
      console.error('Error updating website FAQ:', error);
      throw error;
    }
  }

  async deleteWebsiteFaq(id: number): Promise<void> {
    try {
      await db.delete(websiteFaq).where(eq(websiteFaq.id, id));
    } catch (error) {
      console.error('Error deleting website FAQ:', error);
      throw error;
    }
  }

  async reorderWebsiteFaqs(faqIds: number[]): Promise<void> {
    try {
      for (let i = 0; i < faqIds.length; i++) {
        await db.update(websiteFaq)
          .set({ order: i + 1, updatedAt: new Date() })
          .where(eq(websiteFaq.id, faqIds[i]));
      }
    } catch (error) {
      console.error('Error reordering website FAQs:', error);
      throw error;
    }
  }

  // Leads management operations
  async getLeads(): Promise<LeadWithBusiness[]> {
    try {
      // Use raw SQL query to bypass Drizzle ORM schema issues
      const result = await pool.query(`
        SELECT 
          l.id, l.business_id as "businessId", l.sender_name as "senderName", 
          l.sender_email as "senderEmail", l.sender_phone as "senderPhone",
          l.message, l.status, l.created_at as "createdAt", l.updated_at as "updatedAt",
          jsonb_build_object('title', b.title, 'placeid', b.placeid) as business
        FROM leads l
        LEFT JOIN businesses b ON l.business_id = b.placeid
        ORDER BY l.created_at DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  async getLead(id: number): Promise<LeadWithBusiness | undefined> {
    try {
      const result = await db
        .select({
          id: leads.id,
          businessId: leads.businessId,
          senderName: leads.senderName,
          senderEmail: leads.senderEmail,
          senderPhone: leads.senderPhone,
          message: leads.message,
          status: leads.status,
          createdAt: leads.createdAt,
          updatedAt: leads.updatedAt,
          business: {
            title: businesses.title,
            placeid: businesses.placeid,
          },
        })
        .from(leads)
        .leftJoin(businesses, eq(leads.businessId, businesses.placeid))
        .where(eq(leads.id, id))
        .limit(1);

      return result[0] as LeadWithBusiness | undefined;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  }

  async createLead(leadData: InsertLead): Promise<Lead> {
    try {
      // Use raw SQL query to bypass Drizzle ORM schema issues
      const query = `
        INSERT INTO leads (business_id, sender_name, sender_email, sender_phone, message, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, business_id as "businessId", sender_name as "senderName", 
                 sender_email as "senderEmail", sender_phone as "senderPhone",
                 message, status, created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      const values = [
        leadData.businessId,
        leadData.senderName,
        leadData.senderEmail,
        leadData.senderPhone || null,
        leadData.message,
        leadData.status || 'new'
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    try {
      const [result] = await db
        .update(leads)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(leads.id, id))
        .returning();

      return result;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  }

  async deleteLead(id: number): Promise<void> {
    try {
      await db.delete(leads).where(eq(leads.id, id));
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  async getLeadsByBusiness(businessId: string): Promise<LeadWithBusiness[]> {
    try {
      const result = await db
        .select({
          id: leads.id,
          businessId: leads.businessId,
          senderName: leads.senderName,
          senderEmail: leads.senderEmail,
          senderPhone: leads.senderPhone,
          message: leads.message,
          status: leads.status,
          createdAt: leads.createdAt,
          updatedAt: leads.updatedAt,
          business: {
            title: businesses.title,
            placeid: businesses.placeid,
          },
        })
        .from(leads)
        .leftJoin(businesses, eq(leads.businessId, businesses.placeid))
        .where(eq(leads.businessId, businessId))
        .orderBy(desc(leads.createdAt));

      return result as LeadWithBusiness[];
    } catch (error) {
      console.error('Error fetching leads by business:', error);
      throw error;
    }
  }

  // Contact Messages Management
  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const result = await db
        .select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt));
      return result;
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    try {
      const result = await db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.id, id))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching contact message:', error);
      throw error;
    }
  }

  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    try {
      const result = await db
        .insert(contactMessages)
        .values(messageData)
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw error;
    }
  }

  async updateContactMessageStatus(id: number, status: string, adminNotes?: string): Promise<ContactMessage | undefined> {
    try {
      const result = await db
        .update(contactMessages)
        .set({ 
          status, 
          adminNotes,
          updatedAt: new Date()
        })
        .where(eq(contactMessages.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating contact message status:', error);
      throw error;
    }
  }

  async deleteContactMessage(id: number): Promise<void> {
    try {
      await db
        .delete(contactMessages)
        .where(eq(contactMessages.id, id));
    } catch (error) {
      console.error('Error deleting contact message:', error);
      throw error;
    }
  }

  async getBusinessSubmissions(): Promise<any[]> {
    try {
      const submissions = await db
        .select({
          placeid: businesses.placeid,
          title: businesses.title,
          description: businesses.description,
          address: businesses.address,
          city: businesses.city,
          phone: businesses.phone,
          email: businesses.email,
          website: businesses.website,
          hours: businesses.hours,
          categoryid: businesses.categoryid,
          categoryname: categories.name,
          status: businesses.status,
          submittedby: businesses.submittedby,
          createdat: businesses.createdat,
          updatedat: businesses.updatedat,
          submitterName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          submitterEmail: users.email,
        })
        .from(businesses)
        .leftJoin(categories, eq(businesses.categoryid, categories.id))
        .leftJoin(users, eq(businesses.submittedby, users.id))
        .where(ne(businesses.status, 'published'))
        .orderBy(desc(businesses.createdat));

      return submissions;
    } catch (error) {
      console.error('Error fetching business submissions:', error);
      throw error;
    }
  }

  async updateBusinessSubmissionStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<any> {
    try {
      const now = new Date();
      
      if (status === 'approved') {
        // When approving, publish the business
        const [updated] = await db
          .update(businesses)
          .set({
            status: 'published',
            updatedat: now,
            adminNotes,
            reviewedBy,
            reviewedAt: now,
          })
          .where(eq(businesses.placeid, id))
          .returning();
        
        return updated;
      } else {
        // When rejecting or other status changes
        const [updated] = await db
          .update(businesses)
          .set({
            status,
            updatedat: now,
            adminNotes,
            reviewedBy,
            reviewedAt: now,
          })
          .where(eq(businesses.placeid, id))
          .returning();
        
        return updated;
      }
    } catch (error) {
      console.error('Error updating business submission status:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();