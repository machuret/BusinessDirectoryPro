import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Simple services storage that uses direct SQL queries
export class ServicesStorageSimple {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  async getServices() {
    try {
      const result = await this.pool.query(`
        SELECT id, name, slug, description, category, seo_title, seo_description, content, is_active, created_at, updated_at
        FROM services 
        WHERE is_active = true
        ORDER BY name ASC
      `);
      return result.rows;
    } catch (error) {
      console.error("Error fetching services:", error);
      return [];
    }
  }

  async getService(id: number) {
    try {
      const result = await this.pool.query(`
        SELECT id, name, slug, description, category, seo_title, seo_description, content, is_active, created_at, updated_at
        FROM services 
        WHERE id = $1
      `, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error fetching service:", error);
      return null;
    }
  }

  async getServiceBySlug(slug: string) {
    try {
      const result = await this.pool.query(`
        SELECT id, name, slug, description, category, seo_title, seo_description, content, is_active, created_at, updated_at
        FROM services 
        WHERE slug = $1 AND is_active = true
      `, [slug]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error fetching service by slug:", error);
      return null;
    }
  }

  async createService(serviceData: any) {
    try {
      const {
        name,
        slug,
        description,
        category,
        seo_title,
        seo_description,
        content,
        is_active = true
      } = serviceData;

      const result = await this.pool.query(`
        INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, slug, description, category, seo_title, seo_description, content, is_active, created_at, updated_at
      `, [name, slug, description, category, seo_title, seo_description, content, is_active]);

      return result.rows[0];
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  }

  async updateService(id: number, serviceData: any) {
    try {
      const {
        name,
        slug,
        description,
        category,
        seo_title,
        seo_description,
        content,
        is_active
      } = serviceData;

      const result = await this.pool.query(`
        UPDATE services 
        SET name = $2, slug = $3, description = $4, category = $5, 
            seo_title = $6, seo_description = $7, content = $8, is_active = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, slug, description, category, seo_title, seo_description, content, is_active, created_at, updated_at
      `, [id, name, slug, description, category, seo_title, seo_description, content, is_active]);

      return result.rows[0];
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  }

  async deleteService(id: number) {
    try {
      await this.pool.query('DELETE FROM services WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  }

  async getBusinessServices(businessId: string) {
    try {
      const result = await this.pool.query(`
        SELECT s.id, s.name, s.slug, s.description, s.category
        FROM services s
        INNER JOIN business_services bs ON s.id = bs.service_id
        WHERE bs.business_id = $1 AND s.is_active = true
        ORDER BY s.name ASC
      `, [businessId]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching business services:", error);
      return [];
    }
  }

  async addBusinessService(businessId: string, serviceId: number) {
    try {
      await this.pool.query(`
        INSERT INTO business_services (business_id, service_id)
        VALUES ($1, $2)
        ON CONFLICT (business_id, service_id) DO NOTHING
      `, [businessId, serviceId]);
      return true;
    } catch (error) {
      console.error("Error adding business service:", error);
      throw error;
    }
  }

  async removeBusinessService(businessId: string, serviceId: number) {
    try {
      await this.pool.query(`
        DELETE FROM business_services
        WHERE business_id = $1 AND service_id = $2
      `, [businessId, serviceId]);
      return true;
    } catch (error) {
      console.error("Error removing business service:", error);
      throw error;
    }
  }

  async ensureTablesExist() {
    try {
      console.log("Ensuring services tables exist...");
      
      // Create services table
      await this.pool.query(`
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

      // Create business_services junction table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS business_services (
          id SERIAL PRIMARY KEY,
          business_id VARCHAR(255) NOT NULL,
          service_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(business_id, service_id)
        )
      `);

      // Insert initial services if table is empty
      const count = await this.pool.query('SELECT COUNT(*) as count FROM services');
      if (parseInt(count.rows[0].count) === 0) {
        console.log("Inserting initial services...");
        await this.pool.query(`
          INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active)
          VALUES 
            ('General Dentistry', 'general-dentistry', 'Comprehensive dental care including cleanings, exams, and preventive treatments.', 'General', 'General Dentistry Services - Comprehensive Dental Care', 'Professional general dentistry services including routine cleanings, dental exams, fillings, and preventive care to maintain optimal oral health.', 'Our general dentistry services provide comprehensive oral healthcare to patients of all ages. We focus on preventive care to help you maintain healthy teeth and gums for life.', true),
            ('Cosmetic Dentistry', 'cosmetic-dentistry', 'Enhance your smile with professional cosmetic dental treatments.', 'Cosmetic', 'Cosmetic Dentistry - Professional Smile Enhancement', 'Transform your smile with our cosmetic dentistry services including teeth whitening, veneers, and smile makeovers by experienced dental professionals.', 'Our cosmetic dentistry services are designed to enhance the beauty of your smile while maintaining optimal oral health. We use the latest techniques and materials.', true),
            ('Dental Implants', 'dental-implants', 'Permanent tooth replacement solutions with dental implants.', 'Restorative', 'Dental Implants - Permanent Tooth Replacement Solutions', 'Replace missing teeth with natural-looking dental implants. Our experienced team provides comprehensive implant dentistry services.', 'Dental implants provide a permanent solution for missing teeth, offering the look, feel, and function of natural teeth with long-lasting results.', true),
            ('Orthodontics', 'orthodontics', 'Straighten your teeth with braces and clear aligners.', 'Orthodontic', 'Orthodontics - Braces and Clear Aligners', 'Achieve a straighter smile with our orthodontic treatments including traditional braces, clear aligners, and Invisalign.', 'Our orthodontic services help patients of all ages achieve straighter, healthier smiles through various treatment options tailored to individual needs.', true),
            ('Root Canal Therapy', 'root-canal-therapy', 'Save your natural teeth with professional root canal treatment.', 'Endodontic', 'Root Canal Therapy - Save Your Natural Teeth', 'Professional root canal therapy to save infected or damaged teeth. Our gentle approach ensures comfortable treatment and successful outcomes.', 'Root canal therapy allows us to save natural teeth that have become infected or severely damaged, providing pain relief and preserving your smile.', true),
            ('Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening for a brighter, whiter smile.', 'Cosmetic', 'Professional Teeth Whitening - Brighter Smile', 'Achieve a brighter, whiter smile with our professional teeth whitening treatments. Safe, effective, and long-lasting results.', 'Our professional teeth whitening treatments can safely and effectively brighten your smile, removing stains and discoloration for dramatic results.', true)
        `);
      }

      console.log("Services tables setup completed successfully!");
      return { success: true };
    } catch (error) {
      console.error("Error ensuring services tables exist:", error);
      return { success: false, error: error.message };
    }
  }

  async close() {
    await this.pool.end();
  }
}

export const servicesStorageSimple = new ServicesStorageSimple();