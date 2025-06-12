import { 
  db, eq, like, ilike, and, or, desc, asc, sql, ne,
  businesses, categories, users,
  type Business, type InsertBusiness, type BusinessWithCategory
} from "./base-storage";

export class BusinessStorage {
  async getBusinesses(params?: { 
    categoryId?: number; 
    search?: string; 
    city?: string; 
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<BusinessWithCategory[]> {
    let query = db
      .select({
        placeid: businesses.placeid,
        slug: businesses.slug,
        title: businesses.title,
        subtitle: businesses.subtitle,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        country: businesses.country,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        photos: businesses.photos,
        logo: businesses.logo,
        featured: businesses.featured,
        verified: businesses.verified,
        status: businesses.status,
        metaTitle: businesses.metaTitle,
        metaDescription: businesses.metaDescription,
        totalscore: businesses.totalscore,
        totalreviews: businesses.totalreviews,
        averagerating: businesses.averagerating,
        categoryname: businesses.categoryname,
        categoryid: businesses.categoryid,
        ownerId: businesses.ownerId,
        submittedBy: businesses.submittedBy,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        faqs: businesses.faqs,
        faq: businesses.faq,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color
        }
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryname, categories.name))
      .where(eq(businesses.status, 'approved'));

    const conditions = [];

    if (params?.categoryId) {
      conditions.push(eq(categories.id, params.categoryId));
    }

    if (params?.search) {
      conditions.push(
        or(
          ilike(businesses.title, `%${params.search}%`),
          ilike(businesses.description, `%${params.search}%`),
          ilike(businesses.categoryname, `%${params.search}%`)
        )
      );
    }

    if (params?.city) {
      conditions.push(eq(businesses.city, params.city));
    }

    if (params?.featured) {
      conditions.push(eq(businesses.featured, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(businesses.createdAt));

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.offset(params.offset);
    }

    return await query;
  }

  async getBusinessById(id: string): Promise<BusinessWithCategory | undefined> {
    const result = await db
      .select({
        placeid: businesses.placeid,
        slug: businesses.slug,
        title: businesses.title,
        subtitle: businesses.subtitle,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        country: businesses.country,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        photos: businesses.photos,
        logo: businesses.logo,
        featured: businesses.featured,
        verified: businesses.verified,
        status: businesses.status,
        metaTitle: businesses.metaTitle,
        metaDescription: businesses.metaDescription,
        totalscore: businesses.totalscore,
        totalreviews: businesses.totalreviews,
        averagerating: businesses.averagerating,
        categoryname: businesses.categoryname,
        categoryid: businesses.categoryid,
        ownerId: businesses.ownerId,
        submittedBy: businesses.submittedBy,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        faqs: businesses.faqs,
        faq: businesses.faq,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color
        }
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryname, categories.name))
      .where(eq(businesses.placeid, id))
      .limit(1);

    return result[0];
  }

  async getBusinessBySlug(slug: string): Promise<BusinessWithCategory | undefined> {
    const result = await db
      .select({
        placeid: businesses.placeid,
        slug: businesses.slug,
        title: businesses.title,
        subtitle: businesses.subtitle,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        country: businesses.country,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        photos: businesses.photos,
        logo: businesses.logo,
        featured: businesses.featured,
        verified: businesses.verified,
        status: businesses.status,
        metaTitle: businesses.metaTitle,
        metaDescription: businesses.metaDescription,
        totalscore: businesses.totalscore,
        totalreviews: businesses.totalreviews,
        averagerating: businesses.averagerating,
        categoryname: businesses.categoryname,
        categoryid: businesses.categoryid,
        ownerId: businesses.ownerId,
        submittedBy: businesses.submittedBy,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        faqs: businesses.faqs,
        faq: businesses.faq,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color
        }
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryname, categories.name))
      .where(eq(businesses.slug, slug))
      .limit(1);

    return result[0];
  }

  async getBusinessesByOwner(ownerId: string): Promise<BusinessWithCategory[]> {
    return await db
      .select({
        placeid: businesses.placeid,
        slug: businesses.slug,
        title: businesses.title,
        subtitle: businesses.subtitle,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        country: businesses.country,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        photos: businesses.photos,
        logo: businesses.logo,
        featured: businesses.featured,
        verified: businesses.verified,
        status: businesses.status,
        metaTitle: businesses.metaTitle,
        metaDescription: businesses.metaDescription,
        totalscore: businesses.totalscore,
        totalreviews: businesses.totalreviews,
        averagerating: businesses.averagerating,
        categoryname: businesses.categoryname,
        categoryid: businesses.categoryid,
        ownerId: businesses.ownerId,
        submittedBy: businesses.submittedBy,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        faqs: businesses.faqs,
        faq: businesses.faq,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color
        }
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryname, categories.name))
      .where(eq(businesses.ownerId, ownerId));
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [created] = await db.insert(businesses).values(business).returning();
    return created;
  }

  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const [updated] = await db
      .update(businesses)
      .set({ ...business, updatedAt: new Date() })
      .where(eq(businesses.placeid, id))
      .returning();
    return updated;
  }

  async deleteBusiness(id: string): Promise<void> {
    await db.delete(businesses).where(eq(businesses.placeid, id));
  }

  async updateBusinessRating(businessId: string): Promise<void> {
    // This would typically recalculate ratings from reviews
    // For now, we'll skip this as reviews are embedded in business data
  }

  async searchBusinesses(query: string, location?: string): Promise<BusinessWithCategory[]> {
    const conditions = [
      or(
        ilike(businesses.title, `%${query}%`),
        ilike(businesses.description, `%${query}%`),
        ilike(businesses.categoryname, `%${query}%`)
      )
    ];

    if (location) {
      conditions.push(ilike(businesses.city, `%${location}%`));
    }

    return await db
      .select({
        placeid: businesses.placeid,
        slug: businesses.slug,
        title: businesses.title,
        subtitle: businesses.subtitle,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        country: businesses.country,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        photos: businesses.photos,
        logo: businesses.logo,
        featured: businesses.featured,
        verified: businesses.verified,
        status: businesses.status,
        metaTitle: businesses.metaTitle,
        metaDescription: businesses.metaDescription,
        totalscore: businesses.totalscore,
        totalreviews: businesses.totalreviews,
        averagerating: businesses.averagerating,
        categoryname: businesses.categoryname,
        categoryid: businesses.categoryid,
        ownerId: businesses.ownerId,
        submittedBy: businesses.submittedBy,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        faqs: businesses.faqs,
        faq: businesses.faq,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color
        }
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryname, categories.name))
      .where(and(...conditions))
      .orderBy(desc(businesses.totalscore));
  }

  async getFeaturedBusinesses(limit: number = 6): Promise<BusinessWithCategory[]> {
    return await db
      .select({
        placeid: businesses.placeid,
        slug: businesses.slug,
        title: businesses.title,
        subtitle: businesses.subtitle,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        country: businesses.country,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        hours: businesses.hours,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        photos: businesses.photos,
        logo: businesses.logo,
        featured: businesses.featured,
        verified: businesses.verified,
        status: businesses.status,
        metaTitle: businesses.metaTitle,
        metaDescription: businesses.metaDescription,
        totalscore: businesses.totalscore,
        totalreviews: businesses.totalreviews,
        averagerating: businesses.averagerating,
        categoryname: businesses.categoryname,
        categoryid: businesses.categoryid,
        ownerId: businesses.ownerId,
        submittedBy: businesses.submittedBy,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        faqs: businesses.faqs,
        faq: businesses.faq,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color
        }
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryname, categories.name))
      .where(and(eq(businesses.featured, true), eq(businesses.status, 'approved')))
      .orderBy(desc(businesses.totalscore))
      .limit(limit);
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

  async getUniqueCities(): Promise<{ city: string; count: number }[]> {
    const result = await db.execute(sql`
      SELECT city, COUNT(*) as count 
      FROM businesses 
      WHERE city IS NOT NULL AND city != '' AND status = 'approved'
      GROUP BY city 
      ORDER BY count DESC, city ASC
    `);

    return result.rows.map((row: any) => ({
      city: row.city,
      count: parseInt(row.count)
    }));
  }

  async updateCityName(oldName: string, newName: string, description?: string): Promise<void> {
    await db
      .update(businesses)
      .set({ city: newName })
      .where(eq(businesses.city, oldName));
  }

  async importBusinessFromCSV(businessData: any): Promise<Business> {
    const slug = businessData.title
      ? businessData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : `business-${Date.now()}`;

    const business: InsertBusiness = {
      placeid: businessData.placeid || `import-${Date.now()}`,
      slug,
      title: businessData.title || businessData.name,
      description: businessData.description,
      address: businessData.address,
      city: businessData.city,
      phone: businessData.phone,
      email: businessData.email,
      website: businessData.website,
      hours: businessData.hours,
      categoryname: businessData.categoryname || businessData.category,
      status: 'approved',
      submittedBy: 'csv-import',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.createBusiness(business);
  }

  async bulkImportBusinesses(businessesData: any[]): Promise<{ success: number; errors: any[] }> {
    const results = { success: 0, errors: [] as any[] };

    for (const businessData of businessesData) {
      try {
        await this.importBusinessFromCSV(businessData);
        results.success++;
      } catch (error) {
        results.errors.push({ businessData, error: error.message });
      }
    }

    return results;
  }

  async getBusinessSubmissions(): Promise<any[]> {
    return await db
      .select()
      .from(businesses)
      .where(eq(businesses.status, 'pending'))
      .orderBy(desc(businesses.createdAt));
  }

  async updateBusinessSubmissionStatus(
    id: string, 
    status: string, 
    adminNotes?: string, 
    reviewedBy?: string
  ): Promise<any> {
    const [updated] = await db
      .update(businesses)
      .set({ 
        status, 
        updatedAt: new Date(),
        // Add admin notes and reviewed by fields when they exist in schema
      })
      .where(eq(businesses.placeid, id))
      .returning();
    
    return updated;
  }
}