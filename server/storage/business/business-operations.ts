import { eq, and, sql } from "drizzle-orm";
import { db } from "../../db";
import { businesses, type Business, type InsertBusiness } from "@shared/schema";
import { BusinessValidation } from "./business-validation";

export class BusinessOperations {
  /**
   * Create a new business
   */
  static async createBusiness(businessData: InsertBusiness): Promise<Business> {
    // Validate business data
    const validationErrors = BusinessValidation.validateBusinessData(businessData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Generate slug if not provided
    if (!businessData.slug && businessData.title) {
      businessData.slug = await this.generateUniqueSlug(
        BusinessValidation.generateSeoSlug(
          businessData.title,
          businessData.city || undefined,
          businessData.categoryname || undefined
        )
      );
    }

    // Generate SEO metadata if not provided
    if (!businessData.seotitle || !businessData.seodescription) {
      const seoMetadata = BusinessValidation.generateSeoMetadata(businessData);
      if (!businessData.seotitle) businessData.seotitle = seoMetadata.seotitle;
      if (!businessData.seodescription) businessData.seodescription = seoMetadata.seodescription;
    }

    // Set timestamps
    businessData.createdat = new Date();
    businessData.updatedat = new Date();

    // Sanitize data
    const sanitizedBusiness = BusinessValidation.sanitizeBusinessData(businessData);

    const [created] = await db.insert(businesses).values(sanitizedBusiness).returning();
    return created;
  }

  /**
   * Update an existing business
   */
  static async updateBusiness(id: string, updates: Partial<InsertBusiness>): Promise<Business | undefined> {
    // If title, city, or category changed, regenerate slug
    if (updates.title || updates.city || updates.categoryname) {
      const currentBusiness = await this.getBusinessById(id);
      if (currentBusiness) {
        const baseSlug = BusinessValidation.generateSeoSlug(
          updates.title || currentBusiness.title || 'business',
          updates.city || currentBusiness.city || undefined,
          updates.categoryname || currentBusiness.categoryname || undefined
        );
        updates.slug = await this.generateUniqueSlug(baseSlug, id);
      }
    }

    // Regenerate SEO metadata if business details changed and no custom SEO provided
    if ((updates.title || updates.city || updates.categoryname || updates.address || updates.phone) && 
        (!updates.seotitle || !updates.seodescription)) {
      const currentBusiness = await this.getBusinessById(id);
      if (currentBusiness) {
        const updatedBusiness = { ...currentBusiness, ...updates };
        const seoMetadata = BusinessValidation.generateSeoMetadata(updatedBusiness);
        if (!updates.seotitle) updates.seotitle = seoMetadata.seotitle;
        if (!updates.seodescription) updates.seodescription = seoMetadata.seodescription;
      }
    }

    // Set update timestamp
    updates.updatedat = new Date();

    // Sanitize data
    const sanitizedUpdates = BusinessValidation.sanitizeBusinessData(updates);

    const [updated] = await db
      .update(businesses)
      .set(sanitizedUpdates)
      .where(eq(businesses.placeid, id))
      .returning();

    return updated;
  }

  /**
   * Delete a business
   */
  static async deleteBusiness(id: string): Promise<void> {
    await db.delete(businesses).where(eq(businesses.placeid, id));
  }

  /**
   * Get business by ID (simple version without category join)
   */
  static async getBusinessById(id: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.placeid, id));
    return business;
  }

  /**
   * Generate unique slug for business
   */
  static async generateUniqueSlug(baseSlug: string, excludePlaceId?: string): Promise<string> {
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
  private static async slugExists(slug: string, excludePlaceId?: string): Promise<boolean> {
    let query = db.select({ count: sql`count(*)` }).from(businesses).where(eq(businesses.slug, slug));
    
    if (excludePlaceId) {
      query = db.select({ count: sql`count(*)` })
        .from(businesses)
        .where(and(eq(businesses.slug, slug), eq(businesses.placeid, excludePlaceId)));
    }

    const result = await query;
    return Number(result[0]?.count) > 0;
  }

  /**
   * Update business featured status
   */
  static async updateFeaturedStatus(id: string, featured: boolean): Promise<Business | undefined> {
    return this.updateBusiness(id, { featured, updatedat: new Date() });
  }

  /**
   * Update business verification status
   */
  static async updateVerificationStatus(id: string, verified: boolean): Promise<Business | undefined> {
    return this.updateBusiness(id, { verified, updatedat: new Date() });
  }

  /**
   * Bulk update businesses
   */
  static async bulkUpdateBusinesses(ids: string[], updates: Partial<InsertBusiness>): Promise<void> {
    updates.updatedat = new Date();
    const sanitizedUpdates = BusinessValidation.sanitizeBusinessData(updates);

    await db
      .update(businesses)
      .set(sanitizedUpdates)
      .where(sql`${businesses.placeid} = ANY(${ids})`);
  }

  /**
   * Bulk delete businesses
   */
  static async bulkDeleteBusinesses(ids: string[]): Promise<void> {
    await db
      .delete(businesses)
      .where(sql`${businesses.placeid} = ANY(${ids})`);
  }
}