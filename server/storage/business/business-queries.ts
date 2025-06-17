import { sql } from "drizzle-orm";
import { db } from "../../db";
import { type BusinessWithCategory } from "@shared/schema";

export class BusinessQueries {
  /**
   * Build business query with filters
   */
  static buildBusinessQuery(params?: {
    categoryId?: number;
    search?: string;
    city?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): string {
    let query = `
      SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
             c.icon as category_icon, c.color as category_color, c.id as category_id
      FROM businesses b
      LEFT JOIN categories c ON (b.categoryname = c.name OR 
                                b.categoryname || 's' = c.name OR 
                                b.categoryname = c.name || 's' OR
                                b.categoryname ILIKE '%' || REPLACE(c.name, 'Restaurants', 'Restaurant') || '%' OR
                                c.name ILIKE '%' || b.categoryname || '%')
      WHERE (b.permanentlyclosed = false OR b.permanentlyclosed IS NULL)
    `;

    if (params?.categoryId) {
      query += ` AND c.id = ${params.categoryId}`;
    }

    if (params?.search) {
      const searchTerm = params.search.replace(/'/g, "''");
      query += ` AND (b.title ILIKE '%${searchTerm}%' OR b.description ILIKE '%${searchTerm}%' OR b.categoryname ILIKE '%${searchTerm}%')`;
    }

    if (params?.city) {
      const cityTerm = params.city.replace(/'/g, "''");
      query += ` AND b.city = '${cityTerm}'`;
    }

    if (params?.featured) {
      query += ` AND b.featured = true`;
    }

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;

    query += ` ORDER BY b.featured DESC, b.createdat DESC NULLS LAST LIMIT ${limit} OFFSET ${offset}`;

    return query;
  }

  /**
   * Execute business query and transform results
   */
  static async executeBusinessQuery(query: string): Promise<BusinessWithCategory[]> {
    try {
      const result = await db.execute(sql.raw(query));
      return this.transformBusinessResults(result.rows);
    } catch (error) {
      console.error('Error executing business query:', error);
      return [];
    }
  }

  /**
   * Transform raw query results to BusinessWithCategory format
   */
  static transformBusinessResults(rows: any[]): BusinessWithCategory[] {
    return rows.map((row: any) => ({
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
  }

  /**
   * Get single business with category by ID
   */
  static async getBusinessWithCategoryById(id: string): Promise<BusinessWithCategory | undefined> {
    try {
      const result = await db.execute(sql`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.placeid = ${id}
        LIMIT 1
      `);

      if (result.rows.length === 0) return undefined;

      const row = result.rows[0] as any;
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
      } as BusinessWithCategory;
    } catch (error) {
      console.error('Error fetching business by ID:', error);
      return undefined;
    }
  }

  /**
   * Get single business with category by slug
   */
  static async getBusinessWithCategoryBySlug(slug: string): Promise<BusinessWithCategory | undefined> {
    try {
      const result = await db.execute(sql`
        SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description, 
               c.icon as category_icon, c.color as category_color, c.id as category_id
        FROM businesses b
        LEFT JOIN categories c ON b.categoryname = c.name
        WHERE b.slug = ${slug}
        LIMIT 1
      `);

      if (result.rows.length === 0) return undefined;

      const row = result.rows[0] as any;
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
      } as BusinessWithCategory;
    } catch (error) {
      console.error('Error fetching business by slug:', error);
      return undefined;
    }
  }
}