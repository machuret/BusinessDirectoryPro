import { type Business, type InsertBusiness, type BusinessWithCategory } from "@shared/schema";
import { BusinessQueries } from "./business-queries";
import { BusinessOperations } from "./business-operations";
import { BusinessSearch } from "./business-search";
import { BusinessValidation } from "./business-validation";

/**
 * Refactored Business Storage class
 * 
 * This class acts as a facade for all business-related operations,
 * delegating to specialized modules for better organization and maintainability.
 */
export class BusinessStorage {
  // ========== SEARCH & RETRIEVAL ==========

  /**
   * Get businesses with filtering options
   */
  async getBusinesses(params?: {
    categoryId?: number;
    search?: string;
    city?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<BusinessWithCategory[]> {
    return BusinessSearch.getBusinesses(params);
  }

  /**
   * Get business by ID with category information
   */
  async getBusinessById(id: string): Promise<BusinessWithCategory | undefined> {
    return BusinessQueries.getBusinessWithCategoryById(id);
  }

  /**
   * Get business by slug with category information
   */
  async getBusinessBySlug(slug: string): Promise<BusinessWithCategory | undefined> {
    return BusinessQueries.getBusinessWithCategoryBySlug(slug);
  }

  /**
   * Get businesses owned by a specific user
   */
  async getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]> {
    return BusinessSearch.getBusinessesByOwner(ownerId);
  }

  /**
   * Get featured businesses
   */
  async getFeaturedBusinesses(limit: number = 10): Promise<BusinessWithCategory[]> {
    return BusinessSearch.getFeaturedBusinesses(limit);
  }

  /**
   * Get random businesses for homepage
   */
  async getRandomBusinesses(limit: number = 10): Promise<BusinessWithCategory[]> {
    return BusinessSearch.getRandomBusinesses(limit);
  }

  /**
   * Get businesses by category
   */
  async getBusinessesByCategory(categoryId: number, limit?: number): Promise<BusinessWithCategory[]> {
    return BusinessSearch.getBusinessesByCategory(categoryId, limit);
  }

  /**
   * Get businesses by city
   */
  async getBusinessesByCity(city: string, limit?: number): Promise<BusinessWithCategory[]> {
    return BusinessSearch.getBusinessesByCity(city, limit);
  }

  /**
   * Search businesses by term
   */
  async searchBusinesses(searchTerm: string, limit?: number): Promise<BusinessWithCategory[]> {
    return BusinessSearch.searchBusinesses(searchTerm, limit);
  }

  /**
   * Get businesses pending approval
   */
  async getPendingBusinesses(): Promise<BusinessWithCategory[]> {
    return BusinessSearch.getPendingBusinesses();
  }

  /**
   * Get business statistics
   */
  async getBusinessStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    featured: number;
  }> {
    return BusinessSearch.getBusinessStats();
  }

  /**
   * Get businesses near a location
   */
  async getBusinessesNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<BusinessWithCategory[]> {
    return BusinessSearch.getBusinessesNearLocation(latitude, longitude, radiusKm, limit);
  }

  /**
   * Get cities with business counts
   */
  async getCitiesWithBusinessCounts(): Promise<Array<{ city: string; count: number }>> {
    return BusinessSearch.getCitiesWithBusinessCounts();
  }

  /**
   * Get unique cities (legacy method name for compatibility)
   */
  async getUniqueCities(): Promise<Array<{ city: string; count: number }>> {
    return BusinessSearch.getCitiesWithBusinessCounts();
  }

  // ========== CRUD OPERATIONS ==========

  /**
   * Create a new business
   */
  async createBusiness(business: InsertBusiness): Promise<Business> {
    return BusinessOperations.createBusiness(business);
  }

  /**
   * Update an existing business
   */
  async updateBusiness(id: string, updates: Partial<InsertBusiness>): Promise<Business | undefined> {
    return BusinessOperations.updateBusiness(id, updates);
  }

  /**
   * Delete a business
   */
  async deleteBusiness(id: string): Promise<void> {
    return BusinessOperations.deleteBusiness(id);
  }

  /**
   * Update business featured status
   */
  async updateFeaturedStatus(id: string, featured: boolean): Promise<Business | undefined> {
    return BusinessOperations.updateFeaturedStatus(id, featured);
  }

  /**
   * Update business verification status
   */
  async updateVerificationStatus(id: string, verified: boolean): Promise<Business | undefined> {
    return BusinessOperations.updateVerificationStatus(id, verified);
  }

  // ========== BULK OPERATIONS ==========

  /**
   * Bulk update multiple businesses
   */
  async bulkUpdateBusinesses(ids: string[], updates: Partial<InsertBusiness>): Promise<void> {
    return BusinessOperations.bulkUpdateBusinesses(ids, updates);
  }

  /**
   * Bulk delete multiple businesses
   */
  async bulkDeleteBusinesses(ids: string[]): Promise<void> {
    return BusinessOperations.bulkDeleteBusinesses(ids);
  }

  // ========== UTILITY METHODS ==========

  /**
   * Generate unique slug for business
   */
  async generateUniqueSlug(baseSlug: string, excludePlaceId?: string): Promise<string> {
    return BusinessOperations.generateUniqueSlug(baseSlug, excludePlaceId);
  }

  /**
   * Generate SEO metadata for business
   */
  generateSeoMetadata(business: any): { seotitle: string; seodescription: string } {
    return BusinessValidation.generateSeoMetadata(business);
  }

  /**
   * Validate business data
   */
  validateBusinessData(business: InsertBusiness): string[] {
    return BusinessValidation.validateBusinessData(business);
  }

  /**
   * Sanitize business data (remove undefined values)
   */
  sanitizeBusinessData(business: Partial<InsertBusiness>): any {
    return BusinessValidation.sanitizeBusinessData(business);
  }

  /**
   * Generate SEO-friendly slug
   */
  generateSeoSlug(title: string, city?: string, categoryName?: string): string {
    return BusinessValidation.generateSeoSlug(title, city, categoryName);
  }
}