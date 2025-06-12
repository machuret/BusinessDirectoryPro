import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function setupServicesDatabase() {
  console.log("Setting up services database tables...");
  
  try {
    // Check if tables exist first
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('services', 'business_services')
    `);
    
    console.log("Existing tables:", tableCheck.rows);

    // Create services table
    await pool.query(`
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS business_services (
        id SERIAL PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        service_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(business_id, service_id)
      )
    `);

    // Add foreign key constraints if they don't exist
    try {
      await pool.query(`
        ALTER TABLE business_services 
        ADD CONSTRAINT fk_business_services_business 
        FOREIGN KEY (business_id) REFERENCES businesses(placeid) ON DELETE CASCADE
      `);
    } catch (e) {
      console.log("Foreign key constraint already exists or businesses table not found");
    }

    try {
      await pool.query(`
        ALTER TABLE business_services 
        ADD CONSTRAINT fk_business_services_service 
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      `);
    } catch (e) {
      console.log("Foreign key constraint already exists");
    }

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON business_services(business_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_business_services_service_id ON business_services(service_id)`);

    // Insert initial services
    await pool.query(`
      INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active)
      VALUES 
        ('General Dentistry', 'general-dentistry', 'Comprehensive dental care including cleanings, exams, and preventive treatments.', 'General', 'General Dentistry Services - Comprehensive Dental Care', 'Professional general dentistry services including routine cleanings, dental exams, fillings, and preventive care to maintain optimal oral health.', 'Our general dentistry services provide comprehensive oral healthcare to patients of all ages. We focus on preventive care to help you maintain healthy teeth and gums for life.', true),
        ('Cosmetic Dentistry', 'cosmetic-dentistry', 'Enhance your smile with professional cosmetic dental treatments.', 'Cosmetic', 'Cosmetic Dentistry - Professional Smile Enhancement', 'Transform your smile with our cosmetic dentistry services including teeth whitening, veneers, and smile makeovers by experienced dental professionals.', 'Our cosmetic dentistry services are designed to enhance the beauty of your smile while maintaining optimal oral health. We use the latest techniques and materials.', true),
        ('Dental Implants', 'dental-implants', 'Permanent tooth replacement solutions with dental implants.', 'Restorative', 'Dental Implants - Permanent Tooth Replacement Solutions', 'Replace missing teeth with natural-looking dental implants. Our experienced team provides comprehensive implant dentistry services.', 'Dental implants provide a permanent solution for missing teeth, offering the look, feel, and function of natural teeth with long-lasting results.', true),
        ('Orthodontics', 'orthodontics', 'Straighten your teeth with braces and clear aligners.', 'Orthodontic', 'Orthodontics - Braces and Clear Aligners', 'Achieve a straighter smile with our orthodontic treatments including traditional braces, clear aligners, and Invisalign.', 'Our orthodontic services help patients of all ages achieve straighter, healthier smiles through various treatment options tailored to individual needs.', true),
        ('Root Canal Therapy', 'root-canal-therapy', 'Save your natural teeth with professional root canal treatment.', 'Endodontic', 'Root Canal Therapy - Save Your Natural Teeth', 'Professional root canal therapy to save infected or damaged teeth. Our gentle approach ensures comfortable treatment and successful outcomes.', 'Root canal therapy allows us to save natural teeth that have become infected or severely damaged, providing pain relief and preserving your smile.', true),
        ('Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening for a brighter, whiter smile.', 'Cosmetic', 'Professional Teeth Whitening - Brighter Smile', 'Achieve a brighter, whiter smile with our professional teeth whitening treatments. Safe, effective, and long-lasting results.', 'Our professional teeth whitening treatments can safely and effectively brighten your smile, removing stains and discoloration for dramatic results.', true)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Verify tables were created
    const finalCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('services', 'business_services')
    `);
    
    console.log("Final table check:", finalCheck.rows);

    // Check if services were inserted
    const servicesCount = await pool.query('SELECT COUNT(*) FROM services');
    console.log("Services count:", servicesCount.rows[0].count);

    console.log("Services database setup completed successfully!");
    return { success: true, tables: finalCheck.rows, servicesCount: servicesCount.rows[0].count };
    
  } catch (error) {
    console.error("Error setting up services database:", error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}