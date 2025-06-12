import { 
  db, eq, sql,
  categories, businesses,
  type Category, type InsertCategory, type CategoryWithCount
} from "./base-storage";

export class CategoryStorage {
  async getCategories(): Promise<CategoryWithCount[]> {
    const result = await db.execute(sql`
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

    return result.rows.map((row: any) => ({
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

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }
}