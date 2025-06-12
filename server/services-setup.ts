import { sql } from "drizzle-orm";
import { db } from "./db";

export async function setupServicesTables() {
  try {
    // Create services table
    await db.execute(sql`
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS business_services (
        id SERIAL PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        service_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE(business_id, service_id)
      )
    `);

    // Insert sample services
    await db.execute(sql`
      INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active)
      VALUES 
        ('Dental Cleaning', 'dental-cleaning', 'Professional dental cleaning and hygiene services', 'Preventive', 'Professional Dental Cleaning Services', 'Get your teeth professionally cleaned with our expert dental hygiene services. Book your appointment today.', '<h2>Professional Dental Cleaning</h2><p>Regular dental cleanings are essential for maintaining optimal oral health...</p>', true),
        ('Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening treatments', 'Cosmetic', 'Professional Teeth Whitening', 'Brighten your smile with our professional teeth whitening treatments. Safe and effective results.', '<h2>Teeth Whitening Services</h2><p>Transform your smile with our professional whitening treatments...</p>', true),
        ('Root Canal Treatment', 'root-canal-treatment', 'Endodontic root canal therapy', 'Restorative', 'Root Canal Treatment', 'Expert root canal therapy to save your natural teeth. Pain-free procedures with modern techniques.', '<h2>Root Canal Treatment</h2><p>Our experienced endodontists provide comfortable root canal therapy...</p>', true),
        ('Dental Implants', 'dental-implants', 'Permanent tooth replacement solutions', 'Restorative', 'Dental Implants', 'Replace missing teeth permanently with our dental implant solutions. Natural-looking results.', '<h2>Dental Implants</h2><p>Restore your smile with permanent dental implant solutions...</p>', true),
        ('Orthodontics', 'orthodontics', 'Teeth straightening and alignment services', 'Orthodontic', 'Orthodontic Treatment', 'Straighten your teeth with braces or clear aligners. Expert orthodontic care for all ages.', '<h2>Orthodontic Services</h2><p>Achieve a perfect smile with our comprehensive orthodontic treatments...</p>', true)
      ON CONFLICT (slug) DO NOTHING
    `);

    console.log("Services tables created and sample data inserted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error setting up services tables:", error);
    throw error;
  }
}