import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { type BusinessWithCategory } from "@shared/schema";
import { BusinessQueries } from "./business-queries";

export class BusinessSearch {
  /**
   * Get businesses with advanced filtering
   */
  static async getBusinesses(params?: {
    categoryId?: number;
    search?: string;
    city?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<BusinessWithCategory[]> {
    const query = BusinessQueries.buildBusinessQuery(params);
    return BusinessQueries.executeBusinessQuery(query);
  }

  /**
   * Get featured businesses
   */
  static async getFeaturedBusinesses(limit: number = 10): Promise<BusinessWithCategory[]> {
    return this.getBusinesses({ featured: true, limit });
  }

  /**
   * Get random businesses for homepage
   */
  static async getRandomBusinesses(limit: number = 10): Promise<BusinessWithCategory[]> {
    try {
      const result = await db.execute(sql`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE (b.permanentlyclosed = false OR b.permanentlyclosed IS NULL)
        ORDER BY RANDOM()
        LIMIT ${limit}
      `);

      return BusinessQueries.transformBusinessResults(result.rows);
    } catch (error) {
      console.error('Error fetching random businesses:', error);
      return [];
    }
  }

  /**
   * Get businesses by category
   */
  static async getBusinessesByCategory(categoryId: number, limit?: number): Promise<BusinessWithCategory[]> {
    return this.getBusinesses({ categoryId, limit });
  }

  /**
   * Get businesses by city
   */
  static async getBusinessesByCity(city: string, limit?: number): Promise<BusinessWithCategory[]> {
    return this.getBusinesses({ city, limit });
  }

  /**
   * Search businesses by term
   */
  static async searchBusinesses(searchTerm: string, limit?: number): Promise<BusinessWithCategory[]> {
    return this.getBusinesses({ search: searchTerm, limit });
  }

  /**
   * Get businesses by owner
   */
  static async getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]> {
    try {
      const result = await db.execute(sql`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.ownerid = ${ownerId}
        ORDER BY b.createdat DESC
      `);

      return BusinessQueries.transformBusinessResults(result.rows);
    } catch (error) {
      console.error('Error fetching businesses by owner:', error);
      return [];
    }
  }

  /**
   * Get businesses pending approval
   */
  static async getPendingBusinesses(): Promise<BusinessWithCategory[]> {
    try {
      const result = await db.execute(sql`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.submissionstatus = 'pending'
        ORDER BY b.createdat DESC
      `);

      return BusinessQueries.transformBusinessResults(result.rows);
    } catch (error) {
      console.error('Error fetching pending businesses:', error);
      return [];
    }
  }

  /**
   * Get business counts by status
   */
  static async getBusinessStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    featured: number;
  }> {
    try {
      const result = await db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN submissionstatus = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN submissionstatus = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN featured = true THEN 1 END) as featured
        FROM businesses
        WHERE (permanentlyclosed = false OR permanentlyclosed IS NULL)
      `);

      const stats = result.rows[0] as any;
      return {
        total: Number(stats.total) || 0,
        active: Number(stats.active) || 0,
        pending: Number(stats.pending) || 0,
        featured: Number(stats.featured) || 0
      };
    } catch (error) {
      console.error('Error fetching business stats:', error);
      return { total: 0, active: 0, pending: 0, featured: 0 };
    }
  }

  /**
   * Get businesses near coordinates (if lat/lng are available)
   */
  static async getBusinessesNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<BusinessWithCategory[]> {
    try {
      const result = await db.execute(sql`
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
      console.error('Error fetching businesses near location:', error);
      return [];
    }
  }

  /**
   * Get unique cities with business counts
   */
  static async getCitiesWithBusinessCounts(): Promise<Array<{ city: string; count: number }>> {
    try {
      const result = await db.execute(sql`
        SELECT city, COUNT(*) as count
        FROM businesses
        WHERE city IS NOT NULL AND city != ''
          AND (permanentlyclosed = false OR permanentlyclosed IS NULL)
        GROUP BY city
        ORDER BY count DESC, city ASC
      `);

      return result.rows.map((row: any) => ({
        city: row.city,
        count: Number(row.count)
      }));
    } catch (error) {
      console.error('Error fetching cities with counts:', error);
      return [];
    }
  }
}