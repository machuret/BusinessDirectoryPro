import {
  users,
  categories,
  businesses,
  reviews,
  siteSettings,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Business,
  type InsertBusiness,
  type BusinessWithCategory,
  type CategoryWithCount,
  type Review,
  type InsertReview,
  type SiteSetting,
  type InsertSiteSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, like, and, or, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Admin user management
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  
  // Category operations
  getCategories(): Promise<CategoryWithCount[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Business operations
  getBusinesses(params?: { 
    categoryId?: number; 
    search?: string; 
    city?: string; 
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<BusinessWithCategory[]>;
  getBusinessById(id: number): Promise<BusinessWithCategory | undefined>;
  getBusinessBySlug(slug: string): Promise<BusinessWithCategory | undefined>;
  getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusiness(id: number): Promise<void>;
  updateBusinessRating(businessId: number): Promise<void>;
  
  // Review operations
  getReviewsByBusiness(businessId: number): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Search operations
  searchBusinesses(query: string, location?: string): Promise<BusinessWithCategory[]>;
  getFeaturedBusinesses(limit?: number): Promise<BusinessWithCategory[]>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
    return result;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Category operations
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
        businessCount: count(businesses.id),
      })
      .from(categories)
      .leftJoin(businesses, and(eq(categories.id, businesses.categoryId), eq(businesses.active, true)))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));
    
    return result;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Business operations
  async getBusinesses(params: { 
    categoryId?: number; 
    search?: string; 
    city?: string; 
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<BusinessWithCategory[]> {
    const { categoryId, search, city, featured, limit = 50, offset = 0 } = params;
    
    let query = db
      .select({
        id: businesses.id,
        ownerId: businesses.ownerId,
        categoryId: businesses.categoryId,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        zipCode: businesses.zipCode,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        imageUrls: businesses.imageUrls,
        featured: businesses.featured,
        verified: businesses.verified,
        active: businesses.active,
        averageRating: businesses.averageRating,
        totalReviews: businesses.totalReviews,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
          createdAt: categories.createdAt,
        },
        owner: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(businesses)
      .innerJoin(categories, eq(businesses.categoryId, categories.id))
      .innerJoin(users, eq(businesses.ownerId, users.id))
      .where(eq(businesses.active, true));

    const conditions = [];
    
    if (categoryId) {
      conditions.push(eq(businesses.categoryId, categoryId));
    }
    
    if (search) {
      conditions.push(
        or(
          like(businesses.name, `%${search}%`),
          like(businesses.description, `%${search}%`)
        )
      );
    }
    
    if (city) {
      conditions.push(like(businesses.city, `%${city}%`));
    }
    
    if (featured !== undefined) {
      conditions.push(eq(businesses.featured, featured));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query
      .orderBy(desc(businesses.featured), desc(businesses.averageRating))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row,
      category: row.category,
      owner: row.owner,
    }));
  }

  async getBusinessById(id: number): Promise<BusinessWithCategory | undefined> {
    const [result] = await db
      .select({
        id: businesses.id,
        ownerId: businesses.ownerId,
        categoryId: businesses.categoryId,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        zipCode: businesses.zipCode,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        imageUrls: businesses.imageUrls,
        featured: businesses.featured,
        verified: businesses.verified,
        active: businesses.active,
        averageRating: businesses.averageRating,
        totalReviews: businesses.totalReviews,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
          createdAt: categories.createdAt,
        },
        owner: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(businesses)
      .innerJoin(categories, eq(businesses.categoryId, categories.id))
      .innerJoin(users, eq(businesses.ownerId, users.id))
      .where(and(eq(businesses.id, id), eq(businesses.active, true)));

    if (!result) return undefined;

    return {
      ...result,
      category: result.category,
      owner: result.owner,
    };
  }

  async getBusinessBySlug(slug: string): Promise<BusinessWithCategory | undefined> {
    const [result] = await db
      .select({
        id: businesses.id,
        ownerId: businesses.ownerId,
        categoryId: businesses.categoryId,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        zipCode: businesses.zipCode,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        imageUrls: businesses.imageUrls,
        featured: businesses.featured,
        verified: businesses.verified,
        active: businesses.active,
        averageRating: businesses.averageRating,
        totalReviews: businesses.totalReviews,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
          createdAt: categories.createdAt,
        },
        owner: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(businesses)
      .innerJoin(categories, eq(businesses.categoryId, categories.id))
      .innerJoin(users, eq(businesses.ownerId, users.id))
      .where(and(eq(businesses.slug, slug), eq(businesses.active, true)));

    if (!result) return undefined;

    return {
      ...result,
      category: result.category,
      owner: result.owner,
    };
  }

  async getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]> {
    const result = await db
      .select({
        id: businesses.id,
        ownerId: businesses.ownerId,
        categoryId: businesses.categoryId,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        zipCode: businesses.zipCode,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        imageUrls: businesses.imageUrls,
        featured: businesses.featured,
        verified: businesses.verified,
        active: businesses.active,
        averageRating: businesses.averageRating,
        totalReviews: businesses.totalReviews,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
          createdAt: categories.createdAt,
        },
        owner: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(businesses)
      .innerJoin(categories, eq(businesses.categoryId, categories.id))
      .innerJoin(users, eq(businesses.ownerId, users.id))
      .where(eq(businesses.ownerId, ownerId))
      .orderBy(desc(businesses.createdAt));

    return result.map(row => ({
      ...row,
      category: row.category,
      owner: row.owner,
    }));
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    // Generate slug from name
    const slug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const [newBusiness] = await db
      .insert(businesses)
      .values({ ...business, slug })
      .returning();
    return newBusiness;
  }

  async updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const updateData = { ...business, updatedAt: new Date() };
    
    // Generate new slug if name is being updated
    if (business.name) {
      updateData.slug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    const [updatedBusiness] = await db
      .update(businesses)
      .set(updateData)
      .where(eq(businesses.id, id))
      .returning();
    
    return updatedBusiness;
  }

  async deleteBusiness(id: number): Promise<void> {
    await db.update(businesses).set({ active: false }).where(eq(businesses.id, id));
  }

  async updateBusinessRating(businessId: number): Promise<void> {
    const [stats] = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})::decimal`,
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.businessId, businessId));

    if (stats) {
      await db
        .update(businesses)
        .set({
          averageRating: stats.avgRating?.toString() || "0",
          totalReviews: stats.totalReviews,
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, businessId));
    }
  }

  // Review operations
  async getReviewsByBusiness(businessId: number): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    const result = await db
      .select({
        id: reviews.id,
        businessId: reviews.businessId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        createdAt: reviews.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.businessId, businessId))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row,
      user: row.user,
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update business rating
    await this.updateBusinessRating(review.businessId);
    
    return newReview;
  }

  // Search operations
  async searchBusinesses(query: string, location?: string): Promise<BusinessWithCategory[]> {
    const conditions = [
      eq(businesses.active, true),
      or(
        like(businesses.name, `%${query}%`),
        like(businesses.description, `%${query}%`),
        like(categories.name, `%${query}%`)
      )
    ];

    if (location) {
      conditions.push(
        or(
          like(businesses.city, `%${location}%`),
          like(businesses.state, `%${location}%`),
          like(businesses.address, `%${location}%`)
        )
      );
    }

    const result = await db
      .select({
        id: businesses.id,
        ownerId: businesses.ownerId,
        categoryId: businesses.categoryId,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        zipCode: businesses.zipCode,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        imageUrls: businesses.imageUrls,
        featured: businesses.featured,
        verified: businesses.verified,
        active: businesses.active,
        averageRating: businesses.averageRating,
        totalReviews: businesses.totalReviews,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
          createdAt: categories.createdAt,
        },
        owner: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(businesses)
      .innerJoin(categories, eq(businesses.categoryId, categories.id))
      .innerJoin(users, eq(businesses.ownerId, users.id))
      .where(and(...conditions))
      .orderBy(desc(businesses.featured), desc(businesses.averageRating))
      .limit(50);

    return result.map(row => ({
      ...row,
      category: row.category,
      owner: row.owner,
    }));
  }

  async getFeaturedBusinesses(limit: number = 6): Promise<BusinessWithCategory[]> {
    return this.getBusinesses({ featured: true, limit });
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting[]> {
    const result = await db
      .select()
      .from(siteSettings)
      .orderBy(siteSettings.category, siteSettings.key);
    return result;
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key));
    return setting;
  }

  async updateSiteSetting(key: string, value: any, description?: string, category?: string): Promise<SiteSetting> {
    const [setting] = await db
      .insert(siteSettings)
      .values({
        key,
        value: value,
        description,
        category: category || 'general',
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: value,
          description,
          category: category || 'general',
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }
}

export const storage = new DatabaseStorage();
