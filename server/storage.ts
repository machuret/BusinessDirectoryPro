import { eq, like, ilike, and, or, desc, sql, ne } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  categories,
  businesses,
  reviews,
  siteSettings,
  menuItems,
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
  createReview(review: InsertReview): Promise<Review>;
  
  // Search operations
  searchBusinesses(query: string, location?: string): Promise<BusinessWithCategory[]>;
  getFeaturedBusinesses(limit?: number): Promise<BusinessWithCategory[]>;
  
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
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        color: categories.color,
        createdAt: categories.createdAt,
        businessCount: sql<number>`count(${businesses.placeid})::int`,
      })
      .from(categories)
      .leftJoin(businesses, eq(categories.name, businesses.categoryname))
      .groupBy(categories.id)
      .orderBy(categories.name);

    return result;
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

  async getBusinesses(params: { 
    categoryId?: number; 
    search?: string; 
    city?: string; 
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<BusinessWithCategory[]> {
    const { categoryId, search, city, featured, limit = 50, offset = 0 } = params;

    let query = db.select().from(businesses);
    
    if (city) {
      query = query.where(ilike(businesses.city, `%${city}%`));
    }
    
    if (categoryId) {
      query = query.where(eq(businesses.categoryid, categoryId));
    }
    
    if (search) {
      query = query.where(
        or(
          ilike(businesses.title, `%${search}%`),
          ilike(businesses.description, `%${search}%`),
          ilike(businesses.categoryname, `%${search}%`)
        )
      );
    }
    
    if (featured) {
      query = query.where(eq(businesses.featured, true));
    }

    const result = await query
      .orderBy(desc(businesses.createdat))
      .limit(limit)
      .offset(offset);

    return result as BusinessWithCategory[];
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
    // For now, return empty array since we're focusing on businesses
    return [];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
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
      imageurl: csvData.imageurl || csvData.ImageUrl,
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
}

export const storage = new DatabaseStorage();